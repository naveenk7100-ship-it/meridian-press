import { Metadata } from "next";
import { RefreshCw, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Digital Delivery Policy | Meridian Press",
  description: "Our fair 14-day digital refund guarantee and perpetual re-download policy.",
};

export default function RefundsPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-[#E7E2D8] pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B85D19]">
            <RefreshCw className="h-4 w-4" />
            <span>Customer Protection Guarantee</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#14161A] tracking-tight">
            Refund & Delivery Policy
          </h1>
          <p className="font-sans text-sm text-[#737680]">
            Fair, transparent rules for digital goods
          </p>
        </div>

        <div className="prose font-sans text-sm sm:text-base text-[#383A42] leading-relaxed space-y-8">
          <div className="p-6 rounded-sm bg-[#F4EFE6] border border-[#DDD6C9] space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#B85D19] font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>The 14-Day Unconditional Digital Guarantee</span>
            </div>
            <p className="text-sm text-[#2C2E35] leading-relaxed">
              If a monograph you purchase does not meet your intellectual expectations, you can request a full refund within 14 days of purchase. No interrogation or hostile friction.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              1. Digital Delivery Protocol
            </h2>
            <p>
              Digital downloads are made available immediately upon transaction authorization. You receive:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Direct in-browser download links for EPUB, PDF, and MOBI bundles.</li>
              <li>An email confirmation containing your permanent order identifier and tokenized recovery link.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              2. How to Request a Refund
            </h2>
            <p>
              Simply email <span className="font-mono text-xs text-[#14161A]">orders@meridianpress.pub</span> with your order reference number (e.g. <code>MER-...</code>). We will process a full reversal to your original payment method within two business days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              3. Lifetime Re-Download Access
            </h2>
            <p>
              If you misplace your downloaded files or acquire a new device years later, you can retrieve revised edition files anytime using your order email.
            </p>
          </section>

          <div className="pt-6 border-t border-[#E7E2D8] flex items-center justify-between">
            <span className="text-xs text-[#737680]">Questions regarding an order?</span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#B85D19] hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Contact Order Support</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
