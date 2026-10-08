async function runSmokeTests() {
  const baseUrl = "http://localhost:3005";
  console.log("\n========================================================");
  console.log("       MERIDIAN PRESS — PRODUCTION SMOKE TEST          ");
  console.log(`       Target URL: ${baseUrl}                          `);
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  async function testRoute(name: string, path: string, expectedStatus = 200, matchText?: string) {
    try {
      const res = await fetch(`${baseUrl}${path}`);
      const text = await res.text();
      const statusMatch = res.status === expectedStatus;
      const textMatch = matchText ? text.includes(matchText) : true;

      if (statusMatch && textMatch) {
        console.log(`  ✓ [PASS] ${name} -> HTTP ${res.status}`);
        passed++;
      } else {
        console.error(`  ✗ [FAIL] ${name} -> Expected HTTP ${expectedStatus}, got ${res.status}`);
        if (matchText && !textMatch) {
          console.error(`     Text mismatch: did not find "${matchText}"`);
        }
        failed++;
      }
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name} -> Network Error:`, err);
      failed++;
    }
  }

  // 1. Pages Smoke Test
  console.log("[1/3] Testing Core Editorial Pages...");
  await testRoute("Homepage", "/", 200, "Meridian Press");
  await testRoute("Library & Catalog", "/books", 200, "Library");
  await testRoute("Individual Monograph Detail", "/books/the-architecture-of-durable-systems", 200, "The Architecture of Durable Systems");
  await testRoute("Publisher Admin Login", "/admin/login", 200, "Editorial Desk");
  await testRoute("Patron Order Recovery Desk", "/orders/recover", 200, "Monograph Access Recovery");
  await testRoute("About / Publishing Ethos", "/about", 200, "Publishing Ethos");
  await testRoute("Colophon & Inquiries", "/contact", 200, "Colophon");
  await testRoute("Privacy Policy", "/privacy", 200, "Privacy Policy");
  await testRoute("Terms of Sale", "/terms", 200, "Terms of Sale");
  await testRoute("Refund Policy", "/refunds", 200, "Refund");

  // 2. Public API Endpoints
  console.log("\n[2/3] Testing Production API Endpoints...");
  await testRoute("API Books Index", "/api/books", 200, '"success":true');
  await testRoute("API Admin Auth Status", "/api/auth/admin", 200, '"authenticated":false');

  // 3. Payment & Security API Endpoints
  console.log("\n[3/3] Testing Payments & Security Boundaries...");
  
  // Test Create Order API
  try {
    const createRes = await fetch(`${baseUrl}/api/payments/razorpay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookSlug: "the-architecture-of-durable-systems",
        email: "smoke.test@meridianpress.pub",
        name: "Smoke Test Patron",
      }),
    });
    const createData = await createRes.json();
    if (createRes.ok && createData.success && createData.order?.id) {
      console.log(`  ✓ [PASS] API Create Razorpay Order -> Generated Order #${createData.order.id}`);
      passed++;

      // Test Verification API with test sandbox payload
      const verifyRes = await fetch(`${baseUrl}/api/payments/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: createData.razorpay.orderId,
          razorpay_payment_id: `pay_smoke_${Date.now()}`,
          razorpay_signature: `sig_test_${createData.order.id}`,
          order_id: createData.order.id,
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success && verifyData.accessToken) {
        console.log(`  ✓ [PASS] API Verify Payment Signature -> Generated Entitlement Token`);
        passed++;

        // Test Download API with generated valid token
        const dlRes = await fetch(`${baseUrl}/api/download/${verifyData.accessToken}?format=epub`);
        if (dlRes.status === 200 && dlRes.headers.get("content-type")?.includes("epub")) {
          console.log(`  ✓ [PASS] API Download Valid EPUB -> Streamed authenticated EPUB`);
          passed++;
        } else {
          console.error(`  ✗ [FAIL] API Download Valid EPUB -> HTTP ${dlRes.status}`);
          failed++;
        }
      } else {
        console.error(`  ✗ [FAIL] API Verify Payment -> ${JSON.stringify(verifyData)}`);
        failed++;
      }
    } else {
      console.error(`  ✗ [FAIL] API Create Order -> ${JSON.stringify(createData)}`);
      failed++;
    }
  } catch (err) {
    console.error("  ✗ [FAIL] Payment flow smoke test failed:", err);
    failed++;
  }

  // Test unauthorized download rejection
  await testRoute("API Download Fake Token Rejection", "/api/download/fake_unauthorized_token", 401);

  // Summary
  console.log("\n========================================================");
  console.log(`SMOKE TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests().catch((err) => {
  console.error("Smoke test error:", err);
  process.exit(1);
});
