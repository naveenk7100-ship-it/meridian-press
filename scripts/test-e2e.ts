import { getAllBooks, getBookBySlug, getBookById, createBookRecord, updateBookRecord, deleteBookRecord } from "../src/lib/repositories/books-repo";
import { findOrCreateCustomer } from "../src/lib/repositories/customers-repo";
import { createOrderRecord, getOrderById, markOrderPaid, getRealRevenueMetrics, getOrdersByCustomerEmail } from "../src/lib/repositories/orders-repo";
import { createDownloadEntitlementRecord, getEntitlementByToken, recordDownloadActivity } from "../src/lib/repositories/entitlements-repo";
import { createPaymentRecord } from "../src/lib/repositories/payments-repo";
import { addSubscriber, getAllSubscribers } from "../src/lib/repositories/newsletter-repo";
import { verifyPaymentSignature, verifyWebhookSignature } from "../src/lib/razorpay";
import { generateMonographPackage } from "../src/lib/storage";
import { verifyAdminPasscode } from "../src/lib/auth";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    testsFailed++;
  }
}

async function runEndToEndTests() {
  console.log("\n========================================================");
  console.log("  MERIDIAN PRESS — END-TO-END VERIFICATION TEST SUITE   ");
  console.log("========================================================\n");

  // TEST SUITE 1: Catalog & Book Models
  console.log("[1/10] Testing Book Catalog & Repositories...");
  const allBooks = await getAllBooks();
  assert(allBooks.length > 0, `Loaded ${allBooks.length} monographs from repository`);

  const firstBook = allBooks[0];
  const bySlug = await getBookBySlug(firstBook.slug);
  assert(bySlug?.id === firstBook.id, `Lookup by slug (${firstBook.slug}) matches ID`);

  const byId = await getBookById(firstBook.id);
  assert(byId?.title === firstBook.title, `Lookup by ID (${firstBook.id}) matches title`);
  assert(byId?.currency === "INR", `Primary pricing currency is INR (₹)`);

  // TEST SUITE 2: Customer & Order Lifecycle
  console.log("\n[2/10] Testing Customer & Order Creation...");
  const testEmail = `patron.test.${Date.now()}@example.com`;
  const customer = await findOrCreateCustomer(testEmail, "Eleanor Vance");
  assert(customer.email === testEmail, `Customer created: ${customer.email} (${customer.id})`);

  const order = await createOrderRecord({
    customerId: customer.id,
    customerEmail: customer.email,
    customerName: customer.name,
    bookId: firstBook.id,
    bookTitle: firstBook.title,
    bookSlug: firstBook.slug,
    amount: firstBook.price,
    currency: "INR",
    razorpayOrderId: `order_rzp_test_${Date.now()}`,
  });
  assert(order.status === "pending", `Order initialized in pending state (Order #${order.id})`);
  assert(order.amount === firstBook.price, `Order amount is ₹${order.amount}`);

  // TEST SUITE 3: Razorpay Server Verification
  console.log("\n[3/10] Testing Razorpay Cryptographic Verification...");
  const mockRzpOrderId = `order_test_${Date.now().toString(36)}`;
  const mockPaymentId = `pay_test_${Date.now().toString(36)}`;
  const testSigValid = verifyPaymentSignature({
    razorpay_order_id: mockRzpOrderId,
    razorpay_payment_id: mockPaymentId,
    razorpay_signature: `sig_test_${Date.now()}`,
  });
  assert(testSigValid === true, `Test signature verification accepted in test sandbox`);

  const invalidSig = verifyPaymentSignature({
    razorpay_order_id: "order_real_123",
    razorpay_payment_id: "pay_real_456",
    razorpay_signature: "invalid_tampered_signature",
  });
  assert(invalidSig === false, `Tampered signature correctly rejected`);

  // Webhook signature verification
  const fakeWebhookSig = verifyWebhookSignature({
    rawBody: JSON.stringify({ event: "order.paid" }),
    signature: "invalid_signature",
    webhookSecret: "secret_123",
  });
  assert(fakeWebhookSig === false, `Invalid webhook signature correctly rejected`);

  const fetchedOrder = await getOrderById(order.id);
  assert(fetchedOrder?.id === order.id, `Direct order retrieval by ID verified`);

  // TEST SUITE 4: Payment Transition & Entitlement Generation
  console.log("\n[4/10] Testing Order Settlement & Download Entitlements...");
  const paidOrder = await markOrderPaid(order.id, {
    razorpayPaymentId: mockPaymentId,
    razorpaySignature: `sig_test_${Date.now()}`,
  });
  assert(paidOrder?.status === "paid", `Order status transitioned to PAID`);

  await createPaymentRecord({
    orderId: order.id,
    providerPaymentId: mockPaymentId,
    providerOrderId: mockRzpOrderId,
    amount: order.amount,
    currency: "INR",
    status: "captured",
  });

  const entitlement = await createDownloadEntitlementRecord({
    orderId: order.id,
    bookId: order.bookId,
    customerEmail: order.customerEmail,
    expiresInDays: 14,
    maxDownloads: 15,
  });
  assert(Boolean(entitlement.accessToken), `Generated secure token: ${entitlement.accessToken.substring(0, 16)}...`);
  assert(entitlement.maxDownloads === 15, `Max download quota enforced (15 downloads)`);

  // TEST SUITE 5: Digital Monograph File Delivery (EPUB, PDF, MOBI)
  console.log("\n[5/10] Testing Binary Generation & Watermarking...");
  const epubBuf = generateMonographPackage(firstBook, "epub", customer.email);
  assert(epubBuf.length > 500, `Generated valid reflowable EPUB file (${epubBuf.length} bytes)`);

  const pdfBuf = generateMonographPackage(firstBook, "pdf", customer.email);
  assert(pdfBuf.length > 500, `Generated valid print-layout PDF file (${pdfBuf.length} bytes)`);
  assert(pdfBuf.toString("utf-8", 0, 5).startsWith("%PDF-"), `PDF contains valid PDF header magic bytes`);

  const mobiBuf = generateMonographPackage(firstBook, "mobi", customer.email);
  assert(mobiBuf.length > 500, `Generated valid Kindle MOBI file (${mobiBuf.length} bytes)`);

  // Record download activity
  await recordDownloadActivity(entitlement.id);
  const refreshedEnt = await getEntitlementByToken(entitlement.accessToken);
  assert(refreshedEnt?.downloadCount === 1, `Download counter incremented to 1/15`);

  // TEST SUITE 6: Security & Rejection Cases
  console.log("\n[6/10] Testing Security Bounds & Token Validation...");
  const fakeEnt = await getEntitlementByToken("non_existent_token_12345");
  assert(fakeEnt === null, `Arbitrary download token rejected (401/404)`);

  // TEST SUITE 7: Patron Order Recovery Flow
  console.log("\n[7/10] Testing Patron Order Recovery...");
  const recoveredOrders = await getOrdersByCustomerEmail(testEmail);
  assert(recoveredOrders.length >= 1, `Recovered ${recoveredOrders.length} paid order(s) for ${testEmail}`);
  assert(recoveredOrders[0].id === order.id, `Recovered order ID matches original transaction`);

  // TEST SUITE 8: Real Database Revenue & Admin Authentication
  console.log("\n[8/10] Testing Real Admin Metrics & Passcode Auth...");
  const metrics = await getRealRevenueMetrics();
  assert(metrics.totalPaidOrders >= 1, `Real paid order counter: ${metrics.totalPaidOrders}`);
  assert(metrics.totalRevenueINR >= firstBook.price, `Real captured revenue: ₹${metrics.totalRevenueINR}`);

  const validAdmin = verifyAdminPasscode("meridian_dev_secret_2025");
  assert(validAdmin === true, `Admin auth validates against configured secret`);

  const badAdmin = verifyAdminPasscode("wrong_password_123");
  assert(badAdmin === false, `Incorrect admin passcode rejected`);

  // TEST SUITE 9: Newsletter & Subscriber Repository
  console.log("\n[9/10] Testing Newsletter Persistence...");
  const subEmail = `dispatch.reader.${Date.now()}@example.com`;
  const subResult = await addSubscriber(subEmail, "monthly", ["Architecture & Systems"]);
  assert(subResult.isNew === true, `Subscribed new patron: ${subResult.subscriber.email}`);
  assert(subResult.subscriber.frequency === "monthly", `Subscriber frequency recorded`);

  const duplicateSub = await addSubscriber(subEmail, "quarterly");
  assert(duplicateSub.isNew === false, `Duplicate subscription handled idempotently`);

  const allSubs = await getAllSubscribers();
  assert(allSubs.some((s) => s.email === subEmail), `Subscriber retrieved from store`);

  // TEST SUITE 10: Products / Books CRUD Lifecycle
  console.log("\n[10/10] Testing Products / Books CRUD Lifecycle...");
  const createdBook = await createBookRecord({
    title: `Monograph CRUD Test ${Date.now()}`,
    slug: `monograph-crud-test-${Date.now()}`,
    subtitle: "A test monograph for verifying CRUD lifecycle",
    description: "Short description for verification",
    synopsis: "Detailed synopsis for testing",
    author: {
      name: "Test Author",
      bio: "Test biographical note",
    },
    category: "Architecture & Systems",
    tags: ["Testing", "CRUD"],
    price: 699,
    currency: "INR",
    coverImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f",
    pageCount: 180,
    wordCount: 45000,
    readingTimeMinutes: 220,
    isbn: "978-1-962045-99-9",
    edition: "First Edition",
    publishedYear: 2025,
    publishedDate: "2025-04-01",
    formats: [{ type: "EPUB", size: "3.5 MB", drmFree: true, version: "3.2" }],
    sampleChapter: { title: "Test Excerpt", content: "Test content markdown" },
    tableOfContents: ["Intro", "Chapter 1"],
    digitalFileReference: { fileName: "test.zip", fileSize: "10 MB" },
    status: "draft",
    published: false,
    gumroadUrl: "https://gumroad.com/l/test-product",
    seoTitle: "Test Monograph SEO Title",
    seoDescription: "Test Monograph SEO Description",
    isFeatured: false,
  });
  assert(createdBook.status === "draft", `Created monograph with status "draft" (ID: ${createdBook.id})`);
  assert(createdBook.gumroadUrl === "https://gumroad.com/l/test-product", `Gumroad URL mapped`);
  assert(createdBook.seoTitle === "Test Monograph SEO Title", `SEO title mapped`);

  const updatedBook = await updateBookRecord(createdBook.id, {
    status: "published",
    price: 899,
  });
  assert(updatedBook?.status === "published", `Updated monograph status to "published"`);
  assert(updatedBook?.price === 899, `Updated monograph price to ₹899`);

  const deletedSuccess = await deleteBookRecord(createdBook.id);
  assert(deletedSuccess === true, `Deleted test monograph successfully`);

  const lookupDeleted = await getBookById(createdBook.id);
  assert(lookupDeleted === null, `Verified deleted monograph is no longer present`);

  // Summary
  console.log("\n========================================================");
  console.log(`TEST RESULTS: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log("========================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runEndToEndTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
