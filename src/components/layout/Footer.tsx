import Link from "next/link";
import { BookOpen, Shield, Download, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E7E2D8] bg-[#14161A] text-[#FAF8F5] pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#2B2D33]">
          {/* Brand & Imprint Statement */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#B85D19] text-[#FAF8F5]">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-medium tracking-tight text-[#FAF8F5]">
                  Meridian Press
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#9FA2AB]">
                  Independent Digital Monograph Imprint
                </span>
              </div>
            </div>

            <p className="text-sm text-[#A5A8B2] leading-relaxed max-w-md font-sans">
              We publish rigorous, enduring digital books on software architecture, design philosophy,
              typographic craft, and independent thought. Designed with physical bookmaking care, delivered DRM-free.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-[#A5A8B2]">
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-[#B85D19]" />
                100% DRM-Free
              </span>
              <span className="inline-flex items-center gap-1">
                <Download className="h-3.5 w-3.5 text-[#B85D19]" />
                EPUB · PDF · MOBI
              </span>
            </div>
          </div>

          {/* Catalog & Taxonomy */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#A5A8B2]">
              Thematic Catalog
            </h4>
            <ul className="space-y-2 text-sm text-[#C8CBD3]">
              <li>
                <Link
                  href="/books?category=Architecture+%26+Systems"
                  className="hover:text-[#FAF8F5] transition-colors"
                >
                  Architecture & Systems
                </Link>
              </li>
              <li>
                <Link
                  href="/books?category=Design+Philosophy"
                  className="hover:text-[#FAF8F5] transition-colors"
                >
                  Design Philosophy
                </Link>
              </li>
              <li>
                <Link
                  href="/books?category=Craft+of+Writing"
                  className="hover:text-[#FAF8F5] transition-colors"
                >
                  Craft of Technical Writing
                </Link>
              </li>
              <li>
                <Link
                  href="/books?category=Digital+Epistemology"
                  className="hover:text-[#FAF8F5] transition-colors"
                >
                  Digital Epistemology
                </Link>
              </li>
              <li>
                <Link
                  href="/books?category=Visual+Arts+%26+Typographics"
                  className="hover:text-[#FAF8F5] transition-colors"
                >
                  Visual Arts & Typographics
                </Link>
              </li>
            </ul>
          </div>

          {/* Publishing & Legal */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#A5A8B2]">
              Publishing House
            </h4>
            <ul className="space-y-2 text-sm text-[#C8CBD3]">
              <li>
                <Link href="/about" className="hover:text-[#FAF8F5] transition-colors">
                  Publishing Ethos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F5] transition-colors">
                  Author Submissions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FAF8F5] transition-colors">
                  Rights & Translations
                </Link>
              </li>
              <li>
                <Link href="/orders/recover" className="hover:text-[#FAF8F5] transition-colors">
                  Order Recovery Desk
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#FAF8F5] transition-colors font-mono text-xs text-[#B85D19]">
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>

          {/* Colophon & Inquiries */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#A5A8B2]">
              Legal & Terms
            </h4>
            <ul className="space-y-2 text-sm text-[#C8CBD3]">
              <li>
                <Link href="/privacy" className="hover:text-[#FAF8F5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FAF8F5] transition-colors">
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-[#FAF8F5] transition-colors">
                  Refund & Digital Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#828590]">
          <div>
            © {new Date().getFullYear()} Meridian Press. All rights reserved. Set in Newsreader & Geist.
          </div>
          <div className="flex items-center gap-6">
            <span>Direct Author Royalties: 85%+</span>
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-[#FAF8F5]">
              <Mail className="h-3 w-3" />
              <span>editorial@meridianpress.pub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
