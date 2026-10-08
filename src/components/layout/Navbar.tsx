"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X, Compass, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/books", label: "Library & Catalog" },
  { href: "/about", label: "Publishing Ethos" },
  { href: "/contact", label: "Colophon & Inquiries" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7E2D8] bg-[#FAF8F5]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-18">
        {/* Brand Colophon */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#B85D19] focus:ring-offset-2 rounded-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#14161A] text-[#FAF8F5] transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#B85D19]">
            <BookOpen className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-medium tracking-tight text-[#14161A]">
              Meridian Press
            </span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#737680]">
              Monograph Imprint
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors py-1 relative",
                  isActive
                    ? "text-[#14161A] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#B85D19]"
                    : "text-[#5C5F68] hover:text-[#14161A]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Admin / Direct Catalog CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/admin"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-sm border transition-colors",
              isAdminRoute
                ? "border-[#B85D19] bg-[#B85D19]/10 text-[#B85D19]"
                : "border-[#E7E2D8] text-[#737680] hover:text-[#14161A] hover:border-[#14161A]"
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Desk</span>
          </Link>

          <Link
            href="/books"
            className="inline-flex items-center gap-2 rounded-sm bg-[#14161A] px-4 py-2 text-sm font-medium text-[#FAF8F5] transition-all hover:bg-[#2B2D33] active:scale-[0.98] shadow-sm"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Library</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/admin"
            className="p-2 text-[#737680] hover:text-[#14161A]"
            title="Admin Desk"
          >
            <ShieldCheck className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-sm p-2 text-[#14161A] hover:bg-[#F0EDE6] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7E2D8] bg-[#FAF8F5] px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 text-base font-medium rounded-sm transition-colors",
                  pathname === link.href
                    ? "bg-[#F0EDE6] text-[#14161A] font-semibold"
                    : "text-[#5C5F68] hover:bg-[#F4EFE6] hover:text-[#14161A]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E7E2D8] flex flex-col gap-2">
            <Link
              href="/books"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-sm bg-[#14161A] px-4 py-2.5 text-sm font-medium text-[#FAF8F5]"
            >
              <Compass className="h-4 w-4" />
              <span>Browse All Books</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-sm border border-[#E7E2D8] px-4 py-2 text-xs font-mono text-[#737680] hover:text-[#14161A]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Publisher Admin Desk</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
