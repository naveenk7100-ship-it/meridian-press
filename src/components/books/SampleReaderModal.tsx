"use client";

import { useState, useEffect, useRef } from "react";
import { Book } from "@/types/book";
import { X, BookOpen, ShieldCheck, Download } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SampleReaderModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

export function SampleReaderModal({
  book,
  isOpen,
  onClose,
}: SampleReaderModalProps) {
  const [theme, setTheme] = useState<"light" | "sepia" | "dark">("light");
  const [fontSize, setFontSize] = useState<"md" | "lg" | "xl">("md");
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const total = scrollHeight - clientHeight;
    if (total > 0) {
      setScrollProgress((scrollTop / total) * 100);
    }
  };

  if (!isOpen) return null;

  const themeStyles = {
    light: "bg-[#FAF8F5] text-[#1A1C20] border-[#E5E0D5]",
    sepia: "bg-[#F3EBD9] text-[#2C271E] border-[#DFD4BD]",
    dark: "bg-[#14161A] text-[#E2E5EE] border-[#2B2D33]",
  };

  const headerThemeStyles = {
    light: "bg-[#FAF8F5]/95 border-[#E7E2D8] text-[#14161A]",
    sepia: "bg-[#F3EBD9]/95 border-[#DFD4BD] text-[#2C271E]",
    dark: "bg-[#14161A]/95 border-[#2B2D33] text-[#FAF8F5]",
  };

  const fontSizeClasses = {
    md: "text-base sm:text-lg leading-[1.85]",
    lg: "text-lg sm:text-xl leading-[1.9]",
    xl: "text-xl sm:text-2xl leading-[1.95]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Reader Container */}
      <div
        className={`relative flex flex-col w-full h-full sm:h-[94vh] sm:max-w-4xl sm:rounded-md shadow-2xl overflow-hidden border transition-colors duration-200 ${themeStyles[theme]}`}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 z-30">
          <div
            className="h-full bg-[#B85D19] transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Reader Controls Toolbar */}
        <header
          className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b backdrop-blur-md z-20 transition-colors ${headerThemeStyles[theme]}`}
        >
          {/* Monograph info */}
          <div className="flex items-center gap-3 overflow-hidden">
            <BookOpen className="h-4 w-4 text-[#B85D19] flex-shrink-0" />
            <div className="flex flex-col truncate">
              <span className="font-serif text-sm sm:text-base font-medium truncate">
                {book.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider opacity-70 truncate">
                {book.sampleChapter.title}
              </span>
            </div>
          </div>

          {/* Reading Preferences */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Font Size Adjust */}
            <div className="flex items-center rounded-sm border border-current/20 p-0.5">
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={`px-2 py-0.5 text-xs font-mono rounded-xs transition-colors ${
                  fontSize === "md" ? "bg-current/15 font-bold" : "opacity-60 hover:opacity-100"
                }`}
                title="Regular size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 text-sm font-mono rounded-xs transition-colors ${
                  fontSize === "lg" ? "bg-current/15 font-bold" : "opacity-60 hover:opacity-100"
                }`}
                title="Large size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize("xl")}
                className={`px-2 py-0.5 text-base font-mono rounded-xs transition-colors ${
                  fontSize === "xl" ? "bg-current/15 font-bold" : "opacity-60 hover:opacity-100"
                }`}
                title="Extra large size"
              >
                A++
              </button>
            </div>

            {/* Reading Theme selector */}
            <div className="flex items-center rounded-sm border border-current/20 p-0.5">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`w-6 h-6 rounded-xs flex items-center justify-center text-xs transition-colors ${
                  theme === "light" ? "bg-[#FAF8F5] text-black shadow-xs font-bold border border-black/20" : "opacity-60 hover:opacity-100"
                }`}
                title="Light paper mode"
              >
                L
              </button>
              <button
                type="button"
                onClick={() => setTheme("sepia")}
                className={`w-6 h-6 rounded-xs flex items-center justify-center text-xs transition-colors ${
                  theme === "sepia" ? "bg-[#EFE5CD] text-[#2C271E] shadow-xs font-bold border border-[#C5B595]" : "opacity-60 hover:opacity-100"
                }`}
                title="Warm sepia mode"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`w-6 h-6 rounded-xs flex items-center justify-center text-xs transition-colors ${
                  theme === "dark" ? "bg-[#252830] text-white shadow-xs font-bold border border-white/20" : "opacity-60 hover:opacity-100"
                }`}
                title="Ink dark mode"
              >
                D
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-sm hover:bg-current/10 transition-colors focus:outline-none"
              aria-label="Close reader"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Reader Scrollable Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto px-6 sm:px-16 md:px-24 py-10 sm:py-16 focus:outline-none"
        >
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Monograph Header */}
            <div className="text-center border-b pb-8 border-current/15 space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
                Sample Excerpt · Meridian Press
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight">
                {book.title}
              </h1>
              <p className="font-sans text-sm sm:text-base opacity-75 font-light">
                {book.subtitle}
              </p>
              <div className="pt-2 font-serif italic text-sm opacity-90">
                By {book.author.name}
              </div>
            </div>

            {/* Chapter Heading */}
            <div className="pt-4 space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-medium tracking-tight">
                {book.sampleChapter.title}
              </h2>
              {book.sampleChapter.subtitle && (
                <p className="font-sans text-sm italic opacity-75">
                  {book.sampleChapter.subtitle}
                </p>
              )}
            </div>

            {/* Chapter Body with rich paragraphs & markdown styling */}
            <div className={`reader-prose font-serif ${fontSizeClasses[fontSize]}`}>
              {book.sampleChapter.content.split("\n\n").map((block, idx) => {
                const trimmed = block.trim();
                if (trimmed.startsWith("### ")) {
                  return (
                    <h3
                      key={idx}
                      className="font-serif text-lg sm:text-xl font-medium mt-8 mb-3 text-[#B85D19]"
                    >
                      {trimmed.replace("### ", "")}
                    </h3>
                  );
                }
                if (trimmed.startsWith("> ")) {
                  return (
                    <blockquote
                      key={idx}
                      className="border-l-2 border-[#B85D19] pl-4 italic my-4 opacity-90"
                    >
                      {trimmed.replace("> ", "").replace(/\*/g, "")}
                    </blockquote>
                  );
                }
                if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
                  const items = trimmed.split("\n").map((line) => line.replace(/^[\*\-]\s+/, ""));
                  return (
                    <ul key={idx} className="list-disc pl-6 space-y-2 my-4">
                      {items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  );
                }
                if (/^\d+\./.test(trimmed)) {
                  const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s+/, ""));
                  return (
                    <ol key={idx} className="list-decimal pl-6 space-y-2 my-4">
                      {items.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={idx} className="mb-5 leading-relaxed">
                    {trimmed.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1")}
                  </p>
                );
              })}
            </div>

            {/* End of Sample Notice & Acquisition Card */}
            <div className="mt-14 pt-8 border-t border-current/20 space-y-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-current/10">
                <ShieldCheck className="h-3.5 w-3.5 text-[#B85D19]" />
                <span>End of Free Excerpt</span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-serif text-xl sm:text-2xl font-medium">
                  Continue reading {book.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm opacity-80 leading-relaxed">
                  Includes the complete {book.pageCount}-page monograph, formatted for Kindle, Apple Books, Kobo, and high-DPI desktop PDF readers. 100% DRM-free.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`/books/${book.slug}`}
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm bg-[#B85D19] text-white hover:bg-[#A25014] transition-colors shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Acquire Full Monograph ({formatPrice(book.price, book.currency)})</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-sm border border-current/20 hover:bg-current/10 transition-colors"
                >
                  Return to Catalog
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reader Footer Bar */}
        <footer
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 border-t text-xs font-mono transition-colors opacity-75 ${headerThemeStyles[theme]}`}
        >
          <div className="flex items-center gap-3">
            <span>ISBN: {book.isbn}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{book.edition}</span>
          </div>

          <div>
            <span>{Math.round(scrollProgress)}% read</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
