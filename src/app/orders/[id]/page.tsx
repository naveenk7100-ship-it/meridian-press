import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/repositories/orders-repo";
import { getBookById } from "@/lib/repositories/books-repo";
import { getEntitlementByOrderId, getEntitlementByToken } from "@/lib/repositories/entitlements-repo";
import { formatPrice } from "@/lib/utils";
import { BookCover } from "@/components/books/BookCover";
import {
  CheckCircle2,
  Download,
  FileCheck,
  ShieldCheck,
  Clock,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Smartphone,
  Tablet,
  Laptop,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id} Confirmed | Meridian Press`,
    description: "Access and download your DRM-free digital monograph editions.",
  };
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const order = await getOrderById(id);

  if (!order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 bg-[#FAF8F5]">
        <div className="max-w-md w-full p-8 rounded-sm bg-white border border-[#E7E2D8] text-center space-y-5">
          <div className="inline-flex p-3 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-medium text-[#14161A]">
              Order Not Found
            </h1>
            <p className="text-xs text-[#5C5F68] font-sans">
              We could not find an order matching reference identifier <code>{id}</code>. If you completed a purchase recently, please check your confirmation email or use our recovery desk.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/orders/recover"
              className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors"
            >
              Order Recovery Desk
            </Link>
            <Link
              href="/books"
              className="text-xs font-mono text-[#737680] hover:text-[#B85D19]"
            >
              Return to Bookstore
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Retrieve book and entitlement
  const book = await getBookById(order.bookId);
  if (!book) {
    notFound();
  }

  let entitlement = token ? await getEntitlementByToken(token) : null;
  if (!entitlement) {
    entitlement = await getEntitlementByOrderId(order.id);
  }

  const isPaid = order.status === "paid";
  const accessToken = entitlement?.accessToken || "";
  const isExpired = entitlement ? new Date() > new Date(entitlement.expiresAt) : false;
  const isRevoked = entitlement?.isRevoked || false;
  const downloadsRemaining = entitlement
    ? Math.max(0, entitlement.maxDownloads - entitlement.downloadCount)
    : 0;

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8F5] min-h-screen text-[#14161A]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Status Confirmation Banner */}
        <div className="p-6 sm:p-8 rounded-sm bg-white border border-[#E7E2D8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2D8]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
                  Transaction Verified
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#14161A]">
                  Acquisition Confirmed
                </h1>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-[#737680] space-y-0.5">
              <div>Order Reference: <strong className="text-[#14161A]">{order.id}</strong></div>
              <div>Date: {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>

          {/* Book Summary Card */}
          <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-sm bg-[#F4EFE6]/60 border border-[#E7E2D8]">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <BookCover book={book} size="md" showSpine={false} />
            </div>

            <div className="flex flex-col justify-between space-y-4 flex-1">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#B85D19] bg-[#B85D19]/10 px-2 py-0.5 rounded-xs">
                    {book.category}
                  </span>
                  <span className="font-mono text-[10px] text-[#737680]">
                    {book.edition}
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-medium leading-snug">
                  {book.title}
                </h2>
                <p className="font-serif italic text-sm text-[#5C5F68]">
                  By {book.author.name}
                </p>
                <p className="font-sans text-xs text-[#737680] line-clamp-2 pt-1">
                  {book.description}
                </p>
              </div>

              {/* Order metadata tags */}
              <div className="pt-3 border-t border-[#DDD6C9] grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px] text-[#5C5F68]">
                <div>
                  <span className="text-[#8C909B] block text-[9px] uppercase">Licensed Patron</span>
                  <span className="text-[#14161A] font-medium truncate block">
                    {order.customerEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C909B] block text-[9px] uppercase">Payment Status</span>
                  <span className="text-emerald-700 font-semibold uppercase">
                    {order.status}
                  </span>
                </div>
                <div>
                  <span className="text-[#8C909B] block text-[9px] uppercase">Amount Settled</span>
                  <span className="text-[#14161A] font-semibold">
                    {formatPrice(order.amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Center */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg font-medium text-[#14161A]">
                  Secure Download Vault
                </h3>
                <p className="text-xs text-[#5C5F68]">
                  All three master formats are DRM-free and perpetually licensed for your personal library.
                </p>
              </div>

              {entitlement && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#737680]">
                  <Clock className="h-3.5 w-3.5 text-[#B85D19]" />
                  <span>{downloadsRemaining} downloads available</span>
                </div>
              )}
            </div>

            {isRevoked ? (
              <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs">
                This license has been revoked. Please contact support if you believe this is an error.
              </div>
            ) : isExpired ? (
              <div className="p-4 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                <p>This direct download link has expired for security purposes.</p>
                <Link
                  href="/orders/recover"
                  className="inline-flex items-center gap-1 font-mono text-[#B85D19] underline font-medium"
                >
                  Generate a refreshed token via the recovery desk <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : !isPaid ? (
              <div className="p-4 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Payment is currently pending confirmation from Razorpay. Download links will unlock automatically once captured.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* EPUB Option */}
                <div className="p-4 rounded-sm bg-[#FAF8F5] border border-[#DDD6C9] hover:border-[#B85D19] transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#B85D19]">EPUB</span>
                      <FileCheck className="h-4 w-4 text-[#737680] group-hover:text-[#B85D19]" />
                    </div>
                    <h4 className="font-serif text-sm font-medium text-[#14161A]">
                      Standard E-Reader
                    </h4>
                    <p className="text-[11px] text-[#737680]">
                      Reflowable typography with custom font support for Apple Books, Kobo & Reasily.
                    </p>
                  </div>
                  <a
                    href={`/api/download/${accessToken}?format=epub`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#B85D19] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download EPUB</span>
                  </a>
                </div>

                {/* PDF Option */}
                <div className="p-4 rounded-sm bg-[#FAF8F5] border border-[#DDD6C9] hover:border-[#B85D19] transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#B85D19]">PDF</span>
                      <FileCheck className="h-4 w-4 text-[#737680] group-hover:text-[#B85D19]" />
                    </div>
                    <h4 className="font-serif text-sm font-medium text-[#14161A]">
                      Print Layout Edition
                    </h4>
                    <p className="text-[11px] text-[#737680]">
                      Fixed optical geometry, high-DPI vector typography optimized for large screens & tablets.
                    </p>
                  </div>
                  <a
                    href={`/api/download/${accessToken}?format=pdf`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#B85D19] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>

                {/* MOBI Option */}
                <div className="p-4 rounded-sm bg-[#FAF8F5] border border-[#DDD6C9] hover:border-[#B85D19] transition-all flex flex-col justify-between space-y-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#B85D19]">MOBI</span>
                      <FileCheck className="h-4 w-4 text-[#737680] group-hover:text-[#B85D19]" />
                    </div>
                    <h4 className="font-serif text-sm font-medium text-[#14161A]">
                      Kindle Compatible
                    </h4>
                    <p className="text-[11px] text-[#737680]">
                      Amazon Kindle Send-to-Kindle & USB sideloading compatible format.
                    </p>
                  </div>
                  <a
                    href={`/api/download/${accessToken}?format=mobi`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#B85D19] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download MOBI</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reader Device Guide */}
        <div className="p-6 sm:p-8 rounded-sm bg-white border border-[#E7E2D8] space-y-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#B85D19]" />
            <h3 className="font-serif text-xl font-normal text-[#14161A]">
              Reading Guide & Device Setup
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 p-4 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#14161A]">
                <Smartphone className="h-4 w-4 text-[#B85D19]" />
                <span>Apple Books (iOS/Mac)</span>
              </div>
              <p className="text-xs text-[#5C5F68] leading-relaxed">
                Download the <strong>EPUB</strong> file. Tap it on iPhone or iPad to automatically import into Apple Books with full typographic rendering.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#14161A]">
                <Tablet className="h-4 w-4 text-[#B85D19]" />
                <span>Amazon Kindle</span>
              </div>
              <p className="text-xs text-[#5C5F68] leading-relaxed">
                Download the <strong>EPUB</strong> or <strong>MOBI</strong> file. Send to your device via Amazon’s <a href="https://www.amazon.com/sendtokindle" target="_blank" rel="noopener noreferrer" className="underline text-[#B85D19]">Send to Kindle</a> or via USB.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#14161A]">
                <Laptop className="h-4 w-4 text-[#B85D19]" />
                <span>Android & Desktop</span>
              </div>
              <p className="text-xs text-[#5C5F68] leading-relaxed">
                Open <strong>EPUB</strong> with Thorium, ReadEra, or Google Play Books. For fixed-geometry architectural diagrams, the <strong>PDF</strong> is recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Support & Recovery Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-sm bg-[#F4EFE6] border border-[#E7E2D8] text-xs font-mono text-[#5C5F68]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#B85D19]" />
            <span>Perpetual DRM-Free Personal License · Need assistance?</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/orders/recover" className="text-[#14161A] hover:text-[#B85D19] underline">
              Order Recovery
            </Link>
            <span>·</span>
            <Link href="/contact" className="text-[#14161A] hover:text-[#B85D19] underline">
              Publisher Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
