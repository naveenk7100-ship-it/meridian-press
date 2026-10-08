"use client";

import { useState } from "react";
import { Book } from "@/types/book";
import { BookCover } from "@/components/books/BookCover";
import { FormatBadge } from "@/components/books/FormatBadge";
import { SampleReaderModal } from "@/components/books/SampleReaderModal";
import { CheckoutModal } from "@/components/books/CheckoutModal";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  BookOpen,
  Download,
  CheckCircle2,
  Share2,
} from "lucide-react";
import Link from "next/link";

interface BookDetailClientProps {
  book: Book;
  relatedBooks: Book[];
}

export function BookDetailClient({ book, relatedBooks }: BookDetailClientProps) {
  const [readerOpen, setReaderOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-[#737680]">
          <Link href="/" className="hover:text-[#14161A]">
            Home
          </Link>
          <span>/</span>
          <Link href="/books" className="hover:text-[#14161A]">
            Library
          </Link>
          <span>/</span>
          <Link
            href={`/books?category=${encodeURIComponent(book.category)}`}
            className="hover:text-[#14161A]"
          >
            {book.category}
          </Link>
          <span>/</span>
          <span className="text-[#14161A] truncate max-w-[200px] sm:max-w-none">
            {book.title}
          </span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Cover Stage & Quick Actions */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className="relative cursor-pointer group"
              onClick={() => setReaderOpen(true)}
              title="Click to open sample reader"
            >
              <BookCover book={book} size="xl" />
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-mono text-[#737680] group-hover:text-[#B85D19] transition-colors">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Click to read preview excerpt</span>
              </div>
            </div>

            {/* Share / Save Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#5C5F68] hover:text-[#14161A] hover:bg-[#F4EFE6] transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Share Monograph"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Narrative & Buy Box */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category & ISBN */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#737680]">
              <span className="px-2.5 py-1 rounded-[2px] bg-[#F4EFE6] border border-[#DDD6C9] text-[#B85D19] font-medium">
                {book.category}
              </span>
              <span>ISBN {book.isbn}</span>
              <span>·</span>
              <span>{book.edition}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#14161A] leading-tight">
                {book.title}
              </h1>
              <p className="font-sans text-lg sm:text-xl text-[#5C5F68] font-light leading-relaxed">
                {book.subtitle}
              </p>
            </div>

            {/* Author Byline */}
            <div className="pt-1 flex items-center gap-3">
              <span className="font-serif italic text-base text-[#383A42]">
                By {book.author.name}
              </span>
              <span className="text-[#DDD6C9]">·</span>
              <span className="font-mono text-xs text-[#737680]">
                Published {formatDate(book.publishedDate)}
              </span>
            </div>

            {/* Short Description */}
            <p className="font-sans text-base text-[#2C2E35] leading-relaxed">
              {book.description}
            </p>

            {/* Acquisition Box */}
            <div className="p-6 sm:p-7 rounded-sm border border-[#DDD6C9] bg-[#F4EFE6] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD6C9]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#737680] block">
                    DRM-Free Digital Edition
                  </span>
                  <span className="font-mono text-3xl font-semibold text-[#14161A]">
                    {formatPrice(book.price, book.currency)}
                  </span>
                </div>

                <FormatBadge formats={book.formats} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-all active:scale-[0.99] shadow-sm"
                >
                  <Download className="h-4 w-4 text-[#B85D19]" />
                  <span>Acquire Monograph</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReaderOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] hover:bg-[#FAF8F5]/80 transition-colors active:scale-[0.99]"
                >
                  <BookOpen className="h-4 w-4 text-[#B85D19]" />
                  <span>Read Sample Chapter</span>
                </button>
              </div>

              {/* Delivery Guarantees */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-[#5C5F68]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#B85D19]" />
                  <span>Instant EPUB, PDF & MOBI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#B85D19]" />
                  <span>14-day digital return policy</span>
                </div>
              </div>
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono text-[#5C5F68]">
              <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                <div className="text-[#8C909B]">Pages</div>
                <div className="text-sm font-semibold text-[#14161A] mt-0.5">{book.pageCount} pp</div>
              </div>
              <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                <div className="text-[#8C909B]">Reading Time</div>
                <div className="text-sm font-semibold text-[#14161A] mt-0.5">~{Math.round(book.readingTimeMinutes / 60)} Hours</div>
              </div>
              <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                <div className="text-[#8C909B]">Digital File</div>
                <div className="text-sm font-semibold text-[#14161A] mt-0.5">{book.digitalFileReference.fileSize}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections: Synopsis, Table of Contents, Author & Colophon */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-12 border-t border-[#E7E2D8]">
          {/* Main Body: Synopsis & Excerpt Preview */}
          <div className="lg:col-span-8 space-y-12">
            {/* Synopsis Section */}
            <div className="space-y-4">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14161A]">
                Monograph Synopsis
              </h2>
              <div className="prose font-sans text-base text-[#383A42] leading-relaxed space-y-4">
                {book.synopsis.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Table of Contents */}
            <div className="space-y-4 pt-6 border-t border-[#E7E2D8]">
              <h2 className="font-serif text-2xl font-medium text-[#14161A]">
                Table of Contents
              </h2>
              <ol className="divide-y divide-[#EFEBE3] border border-[#E7E2D8] rounded-sm bg-white overflow-hidden">
                {book.tableOfContents.map((chapter, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 sm:p-4 flex items-center justify-between text-sm font-sans hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#B85D19] font-medium w-6">
                        0{idx + 1}
                      </span>
                      <span className="text-[#14161A] font-medium">{chapter}</span>
                    </div>
                    {idx === 1 && (
                      <button
                        type="button"
                        onClick={() => setReaderOpen(true)}
                        className="font-mono text-[10px] text-[#B85D19] uppercase tracking-wider bg-[#F7EFE9] px-2 py-0.5 rounded-[2px] hover:bg-[#EACBB7]"
                      >
                        Sample Preview
                      </button>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Author Profile */}
            <div className="space-y-4 pt-6 border-t border-[#E7E2D8]">
              <h2 className="font-serif text-2xl font-medium text-[#14161A]">
                About the Author
              </h2>
              <div className="p-6 rounded-sm bg-[#F4EFE6] border border-[#DDD6C9] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14161A] text-[#FAF8F5] font-serif text-lg">
                    {book.author.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#14161A]">
                      {book.author.name}
                    </h3>
                    <span className="font-mono text-xs text-[#737680]">Author & Contributor</span>
                  </div>
                </div>
                <p className="font-sans text-sm text-[#5C5F68] leading-relaxed">
                  {book.author.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar: Technical Specifications & Imprint Colophon */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5] space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-semibold border-b border-[#E7E2D8] pb-2">
                Monograph Specifications
              </h3>
              <dl className="space-y-3 text-xs font-mono divide-y divide-[#EFEBE3]">
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">Publisher</dt>
                  <dd className="text-[#14161A] font-medium">Meridian Press</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">ISBN-13</dt>
                  <dd className="text-[#14161A] font-medium">{book.isbn}</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">Edition</dt>
                  <dd className="text-[#14161A] font-medium">{book.edition}</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">Publication Date</dt>
                  <dd className="text-[#14161A] font-medium">{book.publishedDate}</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">Word Count</dt>
                  <dd className="text-[#14161A] font-medium">{book.wordCount.toLocaleString()} words</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">Rights</dt>
                  <dd className="text-[#14161A] font-medium">DRM-Free Perpetual</dd>
                </div>
                <div className="pt-2 flex justify-between">
                  <dt className="text-[#737680]">Included Formats</dt>
                  <dd className="text-[#14161A] font-medium">EPUB · PDF · MOBI</dd>
                </div>
              </dl>
            </div>

            {/* Tags */}
            <div className="p-6 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5] space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-[#737680]">
                Subject Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs font-mono rounded-[2px] bg-[#F4EFE6] text-[#5C5F68] border border-[#DDD6C9]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="pt-16 border-t border-[#E7E2D8] space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14161A]">
                Related Publications in {book.category}
              </h2>
              <Link
                href="/books"
                className="font-mono text-xs text-[#B85D19] hover:underline"
              >
                View full library →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBooks.map((relBook) => (
                <Link
                  key={relBook.id}
                  href={`/books/${relBook.slug}`}
                  className="p-5 rounded-sm border border-[#E7E2D8] bg-white hover:border-[#14161A] hover:shadow-xs transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex gap-4">
                    <BookCover book={relBook} size="sm" showSpine={false} />
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-[#B85D19]">
                        {relBook.category}
                      </span>
                      <h4 className="font-serif text-base font-medium text-[#14161A] group-hover:text-[#B85D19] leading-snug">
                        {relBook.title}
                      </h4>
                      <p className="font-serif italic text-xs text-[#737680]">
                        By {relBook.author.name}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#EFEBE3] flex items-center justify-between text-xs font-mono text-[#737680]">
                    <span>{relBook.pageCount} pp</span>
                    <span className="font-semibold text-[#14161A]">
                      {formatPrice(relBook.price, relBook.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {readerOpen && (
        <SampleReaderModal
          book={book}
          isOpen={readerOpen}
          onClose={() => setReaderOpen(false)}
        />
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          book={book}
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
}
