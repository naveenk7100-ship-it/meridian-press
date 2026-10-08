import Link from "next/link";
import { ArrowRight, Compass, Feather } from "lucide-react";

export function Hero() {
  return (
    <section className="relative border-b border-[#E7E2D8] bg-[#FAF8F5] pt-14 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
      {/* Editorial Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFEBE3_1px,transparent_1px),linear-gradient(to_bottom,#EFEBE3_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          {/* Imprint metadata pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#DDD6C9] bg-[#F4EFE6] text-xs font-mono text-[#5C5F68] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B85D19] animate-pulse" />
            <span className="font-semibold text-[#14161A]">Meridian Press</span>
            <span>·</span>
            <span>Winter 2025 Monograph Series</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#14161A] leading-[1.08]">
            Enduring books for the{" "}
            <span className="italic font-normal text-[#B85D19]">deliberate</span>{" "}
            technologist & thinker.
          </h1>

          {/* Subtitle / Statement */}
          <p className="mt-8 font-sans text-lg sm:text-xl text-[#5C5F68] leading-relaxed max-w-3xl font-light">
            We publish rigorous digital monographs on software architecture, design philosophy,
            typographic craft, and independent thought. Designed with physical bookmaking precision,
            delivered completely DRM-free.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href="/books"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#14161A] px-7 py-3.5 text-base font-medium text-[#FAF8F5] transition-all hover:bg-[#2B2D33] active:scale-[0.99] shadow-sm"
            >
              <Compass className="h-5 w-5" />
              <span>Explore The Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#DDD6C9] bg-white px-6 py-3.5 text-base font-medium text-[#14161A] hover:bg-[#F4EFE6] transition-colors active:scale-[0.99]"
            >
              <Feather className="h-4 w-4 text-[#B85D19]" />
              <span>Our Publishing Ethos</span>
            </Link>
          </div>

          {/* Real Credo Badges */}
          <div className="mt-14 pt-10 border-t border-[#E7E2D8] grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono text-[#5C5F68]">
            <div className="space-y-1">
              <span className="text-[#14161A] font-semibold block text-sm">100% DRM-Free</span>
              <span>True ownership of EPUB, PDF & MOBI files</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#14161A] font-semibold block text-sm">Fine Typography</span>
              <span>Optical margins, tailored measures & leading</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#14161A] font-semibold block text-sm">No Artificial Fluff</span>
              <span>Monographs focused strictly on enduring craft</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#14161A] font-semibold block text-sm">Direct Patronage</span>
              <span>Authors receive 85%+ net cover royalties</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
