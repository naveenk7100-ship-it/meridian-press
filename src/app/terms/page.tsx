import { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Sale & Licensing | Meridian Press",
  description: "Terms of sale, digital license grants, and usage policies for Meridian Press books.",
};

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-[#E7E2D8] pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B85D19]">
            <FileText className="h-4 w-4" />
            <span>Digital Product License & Terms</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#14161A] tracking-tight">
            Terms of Sale
          </h1>
          <p className="font-sans text-sm text-[#737680]">
            Last revised: January 2025 · Meridian Press Imprint
          </p>
        </div>

        <div className="prose font-sans text-sm sm:text-base text-[#383A42] leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              1. Grant of Personal License
            </h2>
            <p>
              Upon completing an acquisition of any digital monograph from Meridian Press, you are granted a perpetual, non-exclusive, non-transferable personal license to read, store, and back up the included files (EPUB, PDF, MOBI) across any number of personal devices owned by you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              2. Permitted Uses & Personal Backups
            </h2>
            <p>You are explicitly allowed to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Load files onto your personal e-readers, tablets, laptops, and mobile phones.</li>
              <li>Make private archival backup copies onto physical hard drives or personal cloud drives.</li>
              <li>Annotate, highlight, and print excerpts for personal non-commercial study.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              3. Prohibited Uses & Redistribution
            </h2>
            <p>
              Because our works are DRM-free to respect your freedom, we rely on mutual respect and goodwill. You may not:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload our digital files to public file-sharing networks, torrent sites, or unauthorized repositories.</li>
              <li>Resell, sublicense, or commercially exploit the texts without written permission from Meridian Press.</li>
              <li>Train unauthorized commercial generative artificial intelligence models on full copyright texts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#14161A]">
              4. Institutional & Team Licensing
            </h2>
            <p>
              Engineering studios, research laboratories, and educational institutions requiring multi-seat licenses may request team licenses by emailing <span className="font-mono text-xs text-[#14161A]">rights@meridianpress.pub</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
