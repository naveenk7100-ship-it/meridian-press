"use client";

import { useState } from "react";
import Link from "next/link";
import { Book } from "@/types/book";
import { BookCover } from "@/components/books/BookCover";
import { SampleReaderModal } from "@/components/books/SampleReaderModal";
import { CheckoutModal } from "@/components/books/CheckoutModal";
import { formatPrice } from "@/lib/utils";
import { BookOpen, ArrowRight } from "lucide-react";

interface FeaturedBookProps {
  book: Book;
}

export function FeaturedBook({ book }: FeaturedBookProps) {
  const [readerOpen, setReaderOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E7E2D8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
              Flagship Publication · Editor’s Choice
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#14161A] tracking-tight">
              Featured Monograph
            </h2>
          </div>

          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#5C5F68] hover:text-[#14161A] transition-colors"
          >
            <span>View All {book.category} Titles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Featured Showcase Box */}
        <div className="relative rounded-md border border-[#E7E2D8] bg-[#F4EFE6] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Cover Stage */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group cursor-pointer" onClick={() => setReaderOpen(true)}>
                <BookCover book={book} size="xl" />
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737680] group-hover:text-[#B85D19] transition-colors">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Click cover to preview Chapter 1</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Book Metadata & Narrative */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category & ISBN */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#737680]">
                <span className="px-2.5 py-1 rounded-[2px] bg-[#FAF8F5] border border-[#DDD6C9] text-[#B85D19] font-medium">
                  {book.category}
                </span>
                <span>ISBN {book.isbn}</span>
                <span>·</span>
                <span>{book.edition}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <Link href={`/books/${book.slug}`}>
                  <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#14161A] leading-tight hover:text-[#B85D19] transition-colors">
                    {book.title}
                  </h3>
                </Link>
                <p className="font-sans text-base sm:text-lg text-[#5C5F68] font-light leading-relaxed">
                  {book.subtitle}
                </p>
              </div>

              {/* Synopsis */}
              <p className="font-sans text-sm text-[#383A42] leading-relaxed line-clamp-4">
                {book.synopsis}
              </p>

              {/* Author bio block */}
              <div className="flex items-center gap-3 p-3.5 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                <div className="space-y-0.5">
                  <div className="font-serif text-sm font-medium text-[#14161A]">
                    Written by {book.author.name}
                  </div>
                  <div className="text-xs text-[#737680] line-clamp-1">
                    {book.author.bio}
                  </div>
                </div>
              </div>

              {/* Specifications Matrix */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono text-[#5C5F68]">
                <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                  <div className="text-[#8C909B]">Extent</div>
                  <div className="text-sm font-semibold text-[#14161A] mt-0.5">{book.pageCount} Pages</div>
                </div>
                <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                  <div className="text-[#8C909B]">Read Time</div>
                  <div className="text-sm font-semibold text-[#14161A] mt-0.5">~{Math.round(book.readingTimeMinutes / 60)} Hours</div>
                </div>
                <div className="p-3 rounded-sm bg-[#FAF8F5] border border-[#E7E2D8]">
                  <div className="text-[#8C909B]">Delivery</div>
                  <div className="text-sm font-semibold text-[#14161A] mt-0.5">DRM-Free Bundle</div>
                </div>
              </div>

              {/* Price and CTAs */}
              <div className="pt-4 border-t border-[#DDD6C9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#737680] block">
                    Digital Bundle Price
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#14161A]">
                    {formatPrice(book.price, book.currency)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReaderOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] hover:bg-[#FAF8F5]/80 transition-colors active:scale-[0.99]"
                  >
                    <BookOpen className="h-4 w-4 text-[#B85D19]" />
                    <span>Read Excerpt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors active:scale-[0.99] shadow-sm"
                  >
                    <span>Acquire Monograph</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader & Checkout Modals */}
      {readerOpen && (
        <SampleReaderModal
          book={book}
          isOpen={readerOpen}
          onClose={() => setReaderOpen(false)}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          book={book}
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </section>
  );
}
