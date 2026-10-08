import { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Meridian Press",
  description: "Our privacy policy: minimal data collection, zero third-party telemetry, no DRM tracking.",
};

export default function PrivacyPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-[#E7E2D8] pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B85D19]">
            <ShieldCheck className="h-4 w-4" />
            <span>Digital Privacy & Telemetry Statement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#14161A] tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm text-[#737680]">
            Last updated: January 2025 · Effective across all Meridian Press digital publications
          </p>
        </div>

        <div className="prose font-sans text-sm sm:text-base text-[#383A42] leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              1. Our Core Privacy Philosophy
            </h2>
            <p>
              Meridian Press operates under a simple covenant: we sell books, not human attention or reading telemetry. We do not track your reading habits, we do not embed surveillance beacons inside our EPUB or PDF files, and we do not sell subscriber information to advertising brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              2. Information We Collect
            </h2>
            <p>We collect only the minimum information necessary to execute transactions and deliver files:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Email Address:</strong> Required to generate unique digital download tokens and deliver transaction receipts.</li>
              <li><strong>Billing Name (Optional):</strong> Stored with your order record for license verification.</li>
              <li><strong>Newsletter Dispatch Subscriptions:</strong> Stored securely solely to distribute editorial notices when requested.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              3. Digital File Security & No DRM
            </h2>
            <p>
              Our publications are distributed without Digital Rights Management (DRM) locks or remote telemetry probes. Once downloaded to your personal device, your reading activity is completely private and decoupled from our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              4. Cookies and Local Storage
            </h2>
            <p>
              We use minimal first-party cookies solely to maintain publisher administrative sessions and temporary reading preferences (e.g. font size and dark/sepia reading mode). We do not employ third-party tracking cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              5. Data Deletion & Inquiries
            </h2>
            <p>
              You may request full erasure of your email correspondence or order records from our systems at any time by contacting <span className="font-mono text-xs text-[#14161A]">privacy@meridianpress.pub</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
