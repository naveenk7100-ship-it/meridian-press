"use client";

import { BookCategory } from "@/types/book";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES: (BookCategory | "All")[] = [
  "All",
  "Architecture & Systems",
  "Design Philosophy",
  "Craft of Writing",
  "Digital Epistemology",
  "Independent Thought",
  "Visual Arts & Typographics",
];

interface BookFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  sortBy: "newest" | "price-asc" | "price-desc" | "title";
  onSortChange: (sort: "newest" | "price-asc" | "price-desc" | "title") => void;
  totalResults: number;
}

export function BookFilter({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  totalResults,
}: BookFilterProps) {
  return (
    <div className="space-y-6">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737680]" />
          <input
            type="text"
            placeholder="Search monographs, authors, tags, ISBN..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#8C909B] focus:outline-none focus:ring-2 focus:ring-[#B85D19] focus:border-transparent font-sans shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737680] hover:text-[#14161A]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#737680]" />
            <span className="text-xs font-mono text-[#737680]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "newest" | "price-asc" | "price-desc" | "title")}
              className="px-2.5 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
            >
              <option value="newest">Latest Publications</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          <span className="text-xs font-mono text-[#737680] bg-[#F4EFE6] px-2.5 py-1 rounded-sm border border-[#E7E2D8]">
            {totalResults} {totalResults === 1 ? "monograph" : "monographs"}
          </span>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-sm transition-all flex-shrink-0 ${
                isSelected
                  ? "bg-[#14161A] text-[#FAF8F5] shadow-xs"
                  : "bg-[#F4EFE6] text-[#5C5F68] border border-[#DDD6C9] hover:bg-[#EAE3D6] hover:text-[#14161A]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
