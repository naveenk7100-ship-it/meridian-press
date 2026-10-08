import { getPublishedBooks } from "@/lib/repositories/books-repo";
import { BookGrid } from "@/components/books/BookGrid";
import { Metadata } from "next";
import { BookOpen, ShieldCheck, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Library & Catalog",
  description:
    "Browse the complete catalog of DRM-free digital monographs published by Meridian Press.",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const initialCategory = params.category || "All";
  const books = await getPublishedBooks();

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Editorial Page Header */}
        <div className="border-b border-[#E7E2D8] pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#B85D19]">
            <BookOpen className="h-4 w-4" />
            <span>Meridian Press Imprint</span>
            <span>·</span>
            <span>{books.length} Available Monographs</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#14161A] tracking-tight">
            Library & Complete Catalog
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#5C5F68] max-w-3xl font-light">
            Every monograph is available as a DRM-free bundle including reflowable EPUB, vector PDF, and Kindle-compatible MOBI. Explore by thematic discipline or search directly.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-[#737680]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#B85D19]" />
              DRM-Free Perpetual License
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-[#B85D19]" />
              Immediate Multi-Format Download
            </span>
          </div>
        </div>

        {/* Filter & Book Grid */}
        <BookGrid initialBooks={books} initialCategory={initialCategory} />
      </div>
    </div>
  );
}
