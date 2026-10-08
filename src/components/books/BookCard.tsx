"use client";

import { useState } from "react";
import Link from "next/link";
import { Book } from "@/types/book";
import { BookCover } from "./BookCover";
import { FormatBadge } from "./FormatBadge";
import { formatPrice } from "@/lib/utils";
import { BookOpen, ArrowRight, Clock, FileText } from "lucide-react";
import { SampleReaderModal } from "./SampleReaderModal";

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

export function BookCard({ book, featured = false }: BookCardProps) {
  const [readerOpen, setReaderOpen] = useState(false);

  return (
    <>
      <article className="group relative flex flex-col bg-[#FAF8F5] border border-[#E7E2D8] rounded-sm p-5 sm:p-6 transition-all duration-300 hover:border-[#C4BDB0] hover:shadow-md hover:-translate-y-0.5">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Cover Container */}
          <Link
            href={`/books/${book.slug}`}
            className="flex-shrink-0 flex justify-center sm:justify-start"
            tabIndex={-1}
          >
            <BookCover book={book} size={featured ? "lg" : "md"} />
          </Link>

          {/* Book Details */}
          <div className="flex flex-col flex-grow justify-between space-y-4">
            <div className="space-y-2">
              {/* Category & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#737680]">
                <span className="text-[#B85D19] font-medium tracking-wide">
                  {book.category}
                </span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {book.pageCount} pp
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{Math.round(book.readingTimeMinutes / 60)}h
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <Link
                  href={`/books/${book.slug}`}
                  className="group-hover:text-[#B85D19] transition-colors"
                >
                  <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-tight text-[#14161A] leading-snug">
                    {book.title}
                  </h3>
                </Link>
                <p className="mt-1 font-sans text-sm text-[#5C5F68] line-clamp-2 leading-relaxed">
                  {book.subtitle}
                </p>
              </div>

              {/* Author & Synopsis snippet */}
              <div className="pt-1">
                <p className="font-serif italic text-sm text-[#383A42]">
                  By {book.author.name}
                </p>
                <p className="mt-2 text-xs text-[#737680] line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions & Price */}
            <div className="pt-4 border-t border-[#EFEBE3] space-y-3">
              <div className="flex items-center justify-between">
                <FormatBadge formats={book.formats} />
                <span className="font-mono text-base font-semibold text-[#14161A]">
                  {formatPrice(book.price, book.currency)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReaderOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm border border-[#DDD6C9] bg-[#F4EFE6] text-[#2B2D33] hover:bg-[#EAE3D6] transition-colors active:scale-[0.99]"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#B85D19]" />
                  <span>Read Excerpt</span>
                </button>

                <Link
                  href={`/books/${book.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors active:scale-[0.99]"
                >
                  <span>Monograph Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Interactive Sample Reader */}
      {readerOpen && (
        <SampleReaderModal
          book={book}
          isOpen={readerOpen}
          onClose={() => setReaderOpen(false)}
        />
      )}
    </>
  );
}
