import { Metadata } from "next";
import Link from "next/link";
import { Compass, Feather, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Publishing Ethos & Colophon",
  description:
    "The editorial philosophy, production standards, and author royalty charter of Meridian Press.",
};

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#FAF8F5]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Page Header */}
        <div className="border-b border-[#E7E2D8] pb-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B85D19]">
            <Feather className="h-4 w-4" />
            <span>Meridian Press Editorial Charter</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#14161A] tracking-tight leading-[1.1]">
            Publishing for the centuries, not the release cycle.
          </h1>

          <p className="font-sans text-lg sm:text-xl text-[#5C5F68] font-light leading-relaxed">
            Meridian Press was founded to restore intellectual permanence to technical and design writing.
            We publish concise, rigorous monographs built to survive the relentless churn of modern technology.
          </p>
        </div>

        {/* The Thesis */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14161A]">
            The Crisis of Ephemeral Knowledge
          </h2>
          <div className="prose font-sans text-base text-[#383A42] leading-relaxed space-y-4">
            <p>
              In contemporary software and digital design culture, information decays at an alarming rate. Blog posts written three years ago break due to revised APIs. Online tutorials optimize for search engine algorithms rather than conceptual clarity. Entire bookshelves of 700-page software manuals become obsolete the moment a vendor releases an incremental version bump.
            </p>
            <p>
              Yet the core invariant laws of computing—the mathematics of state spaces, the cognitive physics of human eye movement, the rhetoric of clear exposition, and the structural principles of resilient systems—scarcely change across generations.
            </p>
            <p>
              At Meridian Press, we reject the premise that technical literature must be disposable. We curate and edit books that remain as vital and instructive twenty years after their publication as they were on day one.
            </p>
          </div>
        </section>

        {/* The Four Commitments */}
        <section className="space-y-8 pt-8 border-t border-[#E7E2D8]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14161A]">
            Our Four Publishing Commitments
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-sm bg-[#F4EFE6] border border-[#DDD6C9] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#B85D19] font-semibold">
                <span>01</span>
                <span>·</span>
                <span>Purity of Scope</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#14161A]">
                The Monograph Format
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5F68] leading-relaxed">
                We believe most books are padded with redundant filler simply to justify physical spine thickness. Our monographs typically range between 180 and 340 pages: dense, focused, and free of conceptual bloat.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-[#F4EFE6] border border-[#DDD6C9] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#B85D19] font-semibold">
                <span>02</span>
                <span>·</span>
                <span>Reader Sovereignty</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#14161A]">
                100% DRM-Free Always
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5F68] leading-relaxed">
                When you purchase a Meridian Press publication, you receive standard EPUB, PDF, and MOBI files that you own forever. No proprietary app lock-in, no license server revocation, no tracking telemetry.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-[#F4EFE6] border border-[#DDD6C9] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#B85D19] font-semibold">
                <span>03</span>
                <span>·</span>
                <span>Editorial Craft</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#14161A]">
                Optical Typography & Ergonomics
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5F68] leading-relaxed">
                Every edition is typeset using classical proportions: calibrated column measures (60–72 characters), generous leading ratios, and curated typefaces designed specifically to minimize cognitive fatigue during deep reading.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-[#F4EFE6] border border-[#DDD6C9] space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs text-[#B85D19] font-semibold">
                <span>04</span>
                <span>·</span>
                <span>Direct Patronage</span>
              </div>
              <h3 className="font-serif text-lg font-medium text-[#14161A]">
                85%+ Direct Author Royalties
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5F68] leading-relaxed">
                Traditional trade publishers pay authors between 10% and 15% in royalties. By cutting out corporate bureaucracy and distributing directly, Meridian Press directs over 85% of net proceeds directly to the author.
              </p>
            </div>
          </div>
        </section>

        {/* Colophon & Imprint Details */}
        <section className="space-y-6 pt-8 border-t border-[#E7E2D8]">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14161A]">
            Colophon & Production Standards
          </h2>

          <div className="p-6 sm:p-8 rounded-sm bg-white border border-[#E7E2D8] space-y-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs font-mono">
              <div>
                <dt className="text-[#737680] uppercase tracking-wider">Imprint Name</dt>
                <dd className="text-[#14161A] font-medium text-sm mt-0.5">Meridian Press</dd>
              </div>
              <div>
                <dt className="text-[#737680] uppercase tracking-wider">Primary Display Typeface</dt>
                <dd className="text-[#14161A] font-medium text-sm mt-0.5">Newsreader (Production Type)</dd>
              </div>
              <div>
                <dt className="text-[#737680] uppercase tracking-wider">Body & UI Typeface</dt>
                <dd className="text-[#14161A] font-medium text-sm mt-0.5">Plus Jakarta Sans & Geist</dd>
              </div>
              <div>
                <dt className="text-[#737680] uppercase tracking-wider">Digital Formats</dt>
                <dd className="text-[#14161A] font-medium text-sm mt-0.5">EPUB 3.2, PDF/X-1a Vector, KF8</dd>
              </div>
              <div>
                <dt className="text-[#737680] uppercase tracking-wider">Licensing</dt>
                <dd className="text-[#14161A] font-medium text-sm mt-0.5">Perpetual Personal DRM-Free</dd>
              </div>
              <div>
                <dt className="text-[#737680] uppercase tracking-wider">Editorial Inquiries</dt>
                <dd className="text-[#14161A] font-medium text-sm mt-0.5">editorial@meridianpress.pub</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* CTA to Catalog */}
        <div className="pt-8 border-t border-[#E7E2D8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#14161A]">
              Ready to explore our monographs?
            </h3>
            <p className="text-xs text-[#5C5F68]">
              Browse the library or preview any sample chapter in your browser.
            </p>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-[#14161A] text-[#FAF8F5] text-sm font-medium hover:bg-[#2B2D33] transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Library</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
