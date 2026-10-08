"use client";

import { useState } from "react";
import { Book, BookCategory } from "@/types/book";
import { X, Save, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

const CATEGORIES: BookCategory[] = [
  "Architecture & Systems",
  "Design Philosophy",
  "Craft of Writing",
  "Digital Epistemology",
  "Independent Thought",
  "Visual Arts & Typographics",
];

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (book: Book) => void;
  initialBook?: Book | null;
}

export function BookFormModal({
  isOpen,
  onClose,
  onSaved,
  initialBook,
}: BookFormModalProps) {
  const isEditing = Boolean(initialBook);

  const [title, setTitle] = useState(initialBook?.title || "");
  const [slug, setSlug] = useState(initialBook?.slug || "");
  const [subtitle, setSubtitle] = useState(initialBook?.subtitle || "");
  const [description, setDescription] = useState(initialBook?.description || "");
  const [synopsis, setSynopsis] = useState(initialBook?.synopsis || "");
  const [authorName, setAuthorName] = useState(initialBook?.author?.name || "");
  const [authorBio, setAuthorBio] = useState(initialBook?.author?.bio || "");
  const [category, setCategory] = useState<BookCategory>(
    initialBook?.category || "Architecture & Systems"
  );
  const [tags, setTags] = useState(initialBook?.tags?.join(", ") || "Architecture, Systems");
  const [price, setPrice] = useState(initialBook?.price?.toString() || "799");
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP">(
    initialBook?.currency || "INR"
  );
  const [coverImage, setCoverImage] = useState(
    initialBook?.coverImage ||
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85"
  );
  const [pageCount, setPageCount] = useState(initialBook?.pageCount?.toString() || "240");
  const [readingTimeMinutes, setReadingTimeMinutes] = useState(
    initialBook?.readingTimeMinutes?.toString() || "280"
  );
  const [isbn, setIsbn] = useState(
    initialBook?.isbn || "978-1-962045-07-0"
  );
  const [edition, setEdition] = useState(initialBook?.edition || "First Edition");
  const [publishedYear, setPublishedYear] = useState(
    initialBook?.publishedYear?.toString() || new Date().getFullYear().toString()
  );
  const [publishedDate, setPublishedDate] = useState(
    initialBook?.publishedDate || "2025-01-15"
  );
  const [sampleChapterTitle, setSampleChapterTitle] = useState(
    initialBook?.sampleChapter?.title || "Chapter 1: The Core Invariant"
  );
  const [sampleChapterSubtitle, setSampleChapterSubtitle] = useState(
    initialBook?.sampleChapter?.subtitle || "Why fundamentals outlive temporary abstractions"
  );
  const [sampleChapterContent, setSampleChapterContent] = useState(
    initialBook?.sampleChapter?.content ||
      "### 1.1 The Invariant Principle\n\nEvery enduring system starts with an uncompromising thesis about what does not change..."
  );
  const [tocText, setTocText] = useState(
    initialBook?.tableOfContents?.join("\n") ||
      "Introduction\nChapter 1: The Core Invariant\nChapter 2: Protocols & Boundaries\nChapter 3: Verification & Truth\nEpilogue"
  );
  const [isFeatured, setIsFeatured] = useState(initialBook?.isFeatured ?? false);
  const [isBestseller, setIsBestseller] = useState(initialBook?.isBestseller ?? false);
  const [published, setPublished] = useState(initialBook?.published ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      title,
      slug: slug || slugify(title),
      subtitle,
      description,
      synopsis: synopsis || description,
      author: {
        name: authorName,
        bio: authorBio,
        avatarUrl: initialBook?.author?.avatarUrl || "",
      },
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      price: parseFloat(price) || 0,
      currency,
      coverImage,
      coverColorTheme: initialBook?.coverColorTheme || {
        background: "#1c2321",
        accent: "#d4a373",
        textColor: "#fefae0",
      },
      pageCount: parseInt(pageCount) || 200,
      wordCount: (parseInt(pageCount) || 200) * 250,
      readingTimeMinutes: parseInt(readingTimeMinutes) || 250,
      isbn,
      edition,
      publishedYear: parseInt(publishedYear) || new Date().getFullYear(),
      publishedDate,
      formats: initialBook?.formats || [
        { type: "EPUB", size: "4.5 MB", drmFree: true, version: "3.2" },
        { type: "PDF", size: "12.0 MB", drmFree: true, version: "Print Master" },
        { type: "MOBI", size: "5.5 MB", drmFree: true, version: "KF8" },
      ],
      sampleChapter: {
        title: sampleChapterTitle,
        subtitle: sampleChapterSubtitle,
        content: sampleChapterContent,
      },
      tableOfContents: tocText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      digitalFileReference: initialBook?.digitalFileReference || {
        fileName: `${(slug || slugify(title))}-edition.zip`,
        fileSize: "22 MB",
      },
      isFeatured,
      isBestseller,
      published,
    };

    try {
      const url = isEditing && initialBook ? `/api/books/${initialBook.id}` : "/api/books";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save monograph.");
      }

      onSaved(data.book);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while saving.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-[#FAF8F5] border border-[#E7E2D8] rounded-md shadow-2xl overflow-hidden text-[#14161A]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D8] bg-[#F4EFE6]/70">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#14161A]">
              {isEditing && initialBook ? `Edit Monograph: ${initialBook.title}` : "Publish New Monograph"}
            </h3>
            <span className="font-mono text-xs text-[#737680]">
              {isEditing && initialBook ? `ID: ${initialBook.id}` : "Configure metadata, sample chapter, and format bundles"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#737680] hover:text-[#14161A] hover:bg-[#EAE3D6] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-3 text-xs rounded-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Section 1: Core Metadata */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              01 · Monograph Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Title <span className="text-[#B85D19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="The Architecture of Durable Systems"
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="the-architecture-of-durable-systems"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Thematic Category <span className="text-[#B85D19]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BookCategory)}
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Principles for software built to survive decades of technological churn"
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Author & Editorial Details */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              02 · Author & Synopsis
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Author Full Name <span className="text-[#B85D19]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Marcus Vance"
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Author Biographical Note
                </label>
                <input
                  type="text"
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Systems architect and former infrastructure fellow..."
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Full Synopsis
                </label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="In an industry obsessed with the ephemeral..."
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19] font-sans"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Short Description (for cards and previews)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A rigorous examination of software longevity..."
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19] font-sans"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing, Extent & Cover */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              03 · Pricing, Specifications & Cover Artwork
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Price <span className="text-[#B85D19]">*</span>
                </label>
                <div className="flex">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as "INR" | "USD" | "EUR" | "GBP")}
                    className="px-2.5 text-xs font-mono bg-[#F4EFE6] border border-r-0 border-[#DDD6C9] rounded-l-sm text-[#737680] focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-r-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Page Extent
                </label>
                <input
                  type="number"
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Reading Time (Mins)
                </label>
                <input
                  type="number"
                  value={readingTimeMinutes}
                  onChange={(e) => setReadingTimeMinutes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Edition
                </label>
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Publication Date
                </label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => {
                    setPublishedDate(e.target.value);
                    if (e.target.value) {
                      setPublishedYear(e.target.value.split("-")[0]);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Cover Artwork URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Architecture, Distributed Systems, Resilience"
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Sample Chapter & Table of Contents */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              04 · Sample Excerpt & Table of Contents
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                    Sample Chapter Title
                  </label>
                  <input
                    type="text"
                    value={sampleChapterTitle}
                    onChange={(e) => setSampleChapterTitle(e.target.value)}
                    placeholder="Chapter 1: The Geometry of Coupling"
                    className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                    Sample Chapter Subtitle
                  </label>
                  <input
                    type="text"
                    value={sampleChapterSubtitle}
                    onChange={(e) => setSampleChapterSubtitle(e.target.value)}
                    placeholder="Why dependencies behave like tectonic plates"
                    className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Sample Chapter Content (Markdown supported)
                </label>
                <textarea
                  rows={6}
                  value={sampleChapterContent}
                  onChange={(e) => setSampleChapterContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Table of Contents (One chapter per line)
                </label>
                <textarea
                  rows={4}
                  value={tocText}
                  onChange={(e) => setTocText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Publication Flags */}
          <div className="space-y-4 pt-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              05 · Publication & Visibility Controls
            </h4>

            <div className="flex flex-wrap gap-6 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded-xs text-[#B85D19] focus:ring-[#B85D19] accent-[#B85D19]"
                />
                <span className="text-sm font-medium text-[#14161A]">
                  Published & Live in Bookstore
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded-xs text-[#B85D19] focus:ring-[#B85D19] accent-[#B85D19]"
                />
                <span className="text-sm font-medium text-[#14161A]">
                  Highlight as Featured Monograph
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="h-4 w-4 rounded-xs text-[#B85D19] focus:ring-[#B85D19] accent-[#B85D19]"
                />
                <span className="text-sm font-medium text-[#14161A]">
                  Mark as Imprint Classic / Reader Favorite
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E7E2D8] bg-[#F4EFE6]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#5C5F68] hover:text-[#14161A] hover:bg-[#F4EFE6]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors disabled:opacity-50 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{isEditing ? "Update Monograph" : "Publish to Catalog"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
