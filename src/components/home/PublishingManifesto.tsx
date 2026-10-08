import Link from "next/link";

export function PublishingManifesto() {
  return (
    <section className="py-20 sm:py-28 bg-[#14161A] text-[#FAF8F5] border-b border-[#2B2D33] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B85D19]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
            The Meridian Manifesto
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-tight">
            Why We Publish Digital Books With Physical Reverence
          </h2>
          <p className="font-sans text-base sm:text-lg text-[#A5A8B2] font-light leading-relaxed">
            The modern web produces billions of words a day, but almost none of it is meant to last.
            We founded Meridian Press to publish works of enduring intellectual value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Pillar 1 */}
          <div className="p-8 rounded-sm bg-[#1A1C21] border border-[#2B2D33] space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#B85D19] font-bold">01 /</span>
              <h3 className="font-serif text-xl font-medium text-[#FAF8F5]">
                Durable Ideas Over Churn
              </h3>
            </div>
            <p className="text-sm text-[#A5A8B2] leading-relaxed font-sans">
              We do not publish 500-page bloated software manual updates that expire when the next framework patch is released. We publish concise, foundational monographs addressing invariant architectural laws, epistemological clarity, and structural craftsmanship.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-sm bg-[#1A1C21] border border-[#2B2D33] space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#B85D19] font-bold">02 /</span>
              <h3 className="font-serif text-xl font-medium text-[#FAF8F5]">
                Absolute Digital Sovereignty
              </h3>
            </div>
            <p className="text-sm text-[#A5A8B2] leading-relaxed font-sans">
              When you purchase a book from Meridian Press, you own the actual files. No proprietary reader apps, no intrusive license servers, no DRM locks, and no telemetry tracking your eye movements. Reflowable EPUB, vector PDF, and MOBI bundles for life.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-sm bg-[#1A1C21] border border-[#2B2D33] space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#B85D19] font-bold">03 /</span>
              <h3 className="font-serif text-xl font-medium text-[#FAF8F5]">
                Typography as Cognitive Architecture
              </h3>
            </div>
            <p className="text-sm text-[#A5A8B2] leading-relaxed font-sans">
              Every monograph is meticulously set using optical margins, proportional leading, curated grid geometries, and high-DPI vector typography. We treat screen reading not as a compromise, but as a fine printing medium that respects human visual stamina.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-8 rounded-sm bg-[#1A1C21] border border-[#2B2D33] space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#B85D19] font-bold">04 /</span>
              <h3 className="font-serif text-xl font-medium text-[#FAF8F5]">
                Direct Author Patronage
              </h3>
            </div>
            <p className="text-sm text-[#A5A8B2] leading-relaxed font-sans">
              Traditional publishing takes 85% to 90% of book revenues, leaving authors with meager crumbs. At Meridian Press, we invert the traditional model: authors receive over 85% of net revenues from direct sales, creating sustainable independence for serious thinkers.
            </p>
          </div>
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#B85D19] hover:text-[#D97724] transition-colors border-b border-[#B85D19] pb-1"
          >
            <span>Read our complete editorial colophon and submission charter →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
