import { getPublishedBooks, getFeaturedBooks } from "@/lib/repositories/books-repo";
import { Hero } from "@/components/home/Hero";
import { FeaturedBook } from "@/components/home/FeaturedBook";
import { ThematicCollections } from "@/components/home/ThematicCollections";
import { PublishingManifesto } from "@/components/home/PublishingManifesto";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { BookCard } from "@/components/books/BookCard";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allBooks = await getPublishedBooks();
  const featuredBooks = await getFeaturedBooks();
  const flagship = featuredBooks.length > 0 ? featuredBooks[0] : allBooks[0];
  const recentMonographs = allBooks.slice(0, 4);

  return (
    <div className="space-y-0">
      {/* Editorial Hero */}
      <Hero />

      {/* Featured Flagship Monograph */}
      {flagship && <FeaturedBook book={flagship} />}

      {/* Recent Releases Section */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E7E2D8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-1">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
                Catalog Highlights
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#14161A] tracking-tight">
                Recent Monograph Releases
              </h2>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#14161A] hover:text-[#B85D19] transition-colors group"
            >
              <span>View complete library ({allBooks.length} titles)</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {recentMonographs.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-sm bg-[#14161A] text-[#FAF8F5] font-medium text-sm hover:bg-[#2B2D33] transition-all active:scale-[0.99] shadow-sm"
            >
              <Compass className="h-4 w-4" />
              <span>Browse Complete Digital Bookstore</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Thematic Collections */}
      <ThematicCollections />

      {/* The Meridian Manifesto & Publishing Ethos */}
      <PublishingManifesto />

      {/* Authentic Newsletter Dispatch */}
      <NewsletterSection />
    </div>
  );
}
