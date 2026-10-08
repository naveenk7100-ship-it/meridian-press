"use client";

import { useState, useMemo } from "react";
import { Book } from "@/types/book";
import { BookCard } from "./BookCard";
import { BookFilter } from "./BookFilter";
import { BookOpen, RefreshCw } from "lucide-react";

interface BookGridProps {
  initialBooks: Book[];
  initialCategory?: string;
}

export function BookGrid({ initialBooks, initialCategory = "All" }: BookGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "title">("newest");

  const filteredBooks = useMemo(() => {
    let result = [...initialBooks];

    // Filter by Category
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.subtitle.toLowerCase().includes(q) ||
          b.author.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

    return result;
  }, [initialBooks, selectedCategory, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("newest");
  };

  return (
    <div className="space-y-8">
      {/* Filtering Toolbar */}
      <BookFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalResults={filteredBooks.length}
      />

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-sm border border-dashed border-[#DDD6C9] bg-[#F4EFE6]/50 space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EAE3D6] text-[#737680]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-medium text-[#14161A]">
              No monographs found
            </h3>
            <p className="text-sm text-[#5C5F68] max-w-sm mx-auto">
              We couldn’t find any publications matching your current query or category filter.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white hover:bg-[#F4EFE6] text-[#14161A] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
