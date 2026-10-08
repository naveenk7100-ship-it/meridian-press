"use client";

import { useState, useRef } from "react";
import { Book, BookCategory, BookStatus, BookFormat } from "@/types/book";
import {
  X,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Globe,
  ShieldCheck,
} from "lucide-react";
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

  // Form State
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
    initialBook?.publishedDate || new Date().toISOString().split("T")[0]
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
  const [status, setStatus] = useState<BookStatus>(
    initialBook?.status || (initialBook?.published === false ? "draft" : "published")
  );
  const [gumroadUrl, setGumroadUrl] = useState(initialBook?.gumroadUrl || "");
  const [seoTitle, setSeoTitle] = useState(initialBook?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialBook?.seoDescription || "");
  const [isFeatured, setIsFeatured] = useState(initialBook?.isFeatured ?? false);
  const [isBestseller, setIsBestseller] = useState(initialBook?.isBestseller ?? false);

  // Digital formats state
  const [formats, setFormats] = useState<BookFormat[]>(
    initialBook?.formats || [
      { type: "EPUB", size: "4.5 MB", drmFree: true, version: "3.2" },
      { type: "PDF", size: "12.0 MB", drmFree: true, version: "Print Master" },
      { type: "MOBI", size: "5.5 MB", drmFree: true, version: "KF8" },
    ]
  );

  // Upload States
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadingFormat, setUploadingFormat] = useState<string | null>(null);
  const [uploadSuccessMessages, setUploadSuccessMessages] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const epubFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const mobiFileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  // Handle Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload/cover", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload cover image.");
      }

      setCoverImage(data.url);
      setUploadSuccessMessages((prev) => ({
        ...prev,
        cover: `Cover uploaded successfully (${data.size})`,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error uploading cover.";
      setError(msg);
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  // Handle Digital Book File Upload (EPUB, PDF, MOBI)
  const handleDigitalFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    formatType: "EPUB" | "PDF" | "MOBI"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentSlug = slug || slugify(title) || "untitled-monograph";
    setUploadingFormat(formatType);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", formatType.toLowerCase());
    formData.append("slug", currentSlug);

    try {
      const res = await fetch("/api/upload/book-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to upload ${formatType} file.`);
      }

      // Update formats array state
      setFormats((prev) => {
        const existingIdx = prev.findIndex((f) => f.type === formatType);
        const updatedFormat: BookFormat = {
          type: formatType,
          size: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          drmFree: true,
          version: formatType === "PDF" ? "Print Master" : formatType === "EPUB" ? "3.2" : "KF8",
          filePath: `storage/private/books/${currentSlug}/${currentSlug}.${formatType.toLowerCase()}`,
        };

        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = updatedFormat;
          return next;
        }
        return [...prev, updatedFormat];
      });

      setUploadSuccessMessages((prev) => ({
        ...prev,
        [formatType]: `${formatType} master secured (${data.fileSize})`,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Error uploading ${formatType}.`;
      setError(msg);
    } finally {
      setUploadingFormat(null);
      if (formatType === "EPUB" && epubFileInputRef.current) epubFileInputRef.current.value = "";
      if (formatType === "PDF" && pdfFileInputRef.current) pdfFileInputRef.current.value = "";
      if (formatType === "MOBI" && mobiFileInputRef.current) mobiFileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const finalSlug = slug || slugify(title);

    const payload = {
      title,
      slug: finalSlug,
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
      formats,
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
        fileName: `${finalSlug}-edition.zip`,
        fileSize: "22 MB",
      },
      status,
      published: status === "published",
      gumroadUrl: gumroadUrl.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      isFeatured,
      isBestseller,
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
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D8] bg-[#F4EFE6]/70">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#14161A]">
              {isEditing && initialBook ? `Edit Monograph: ${initialBook.title}` : "Publish New Monograph"}
            </h3>
            <span className="font-mono text-xs text-[#737680]">
              {isEditing && initialBook
                ? `ID: ${initialBook.id} · Status: ${status.toUpperCase()}`
                : "Configure editorial metadata, upload artwork and private digital assets"}
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
            <div className="p-3.5 text-xs rounded-sm bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Identity & Publication Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-1">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium">
                01 · Monograph Identity & Publication Status
              </h4>
              <span className="font-mono text-[10px] text-[#737680]">Required fields marked *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Publishing Lifecycle Status <span className="text-[#B85D19]">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookStatus)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                >
                  <option value="published">Live / Published</option>
                  <option value="draft">Draft / Work in Progress</option>
                  <option value="archived">Archived / Hidden</option>
                </select>
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

              <div className="sm:col-span-2">
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

              <div className="sm:col-span-3">
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

          {/* SECTION 2: Cover Artwork Uploader & Digital Assets */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              02 · Cover Artwork & Private Digital Master Files
            </h4>

            {/* Cover Image Uploader Stage */}
            <div className="p-4 rounded-sm border border-[#DDD6C9] bg-[#F4EFE6] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-16 h-24 object-cover rounded-xs border border-[#DDD6C9] shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-16 h-24 rounded-xs border border-dashed border-[#DDD6C9] bg-white flex items-center justify-center text-[#737680]">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-medium text-[#14161A] block">
                      Cover Artwork Asset
                    </span>
                    <p className="font-sans text-xs text-[#5C5F68]">
                      Upload JPG, PNG, or WebP (recommended 1200x1800 px, max 8MB).
                    </p>
                    {uploadSuccessMessages.cover && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        {uploadSuccessMessages.cover}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingCover}
                    onClick={() => coverFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white hover:bg-[#FAF8F5] text-[#14161A] transition-colors disabled:opacity-50"
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B85D19]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 text-[#B85D19]" />
                        <span>Upload Artwork Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#737680] mb-1">
                  Or Specify Direct Artwork URL:
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>
            </div>

            {/* Digital Master Files Dropzones (EPUB, PDF, MOBI) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#5C5F68] font-medium">
                  Protected Digital Formats (Saved to private storage vault)
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#737680]">
                  <ShieldCheck className="h-3 w-3 text-[#B85D19]" />
                  Never served via public URLs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* EPUB Uploader */}
                <div className="p-3.5 rounded-sm border border-[#E7E2D8] bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#14161A]">
                      EPUB Monograph
                    </span>
                    <span className="text-[10px] font-mono text-[#737680]">.epub</span>
                  </div>
                  <p className="text-[11px] text-[#737680] line-clamp-2">
                    Reflowable standard edition for Apple Books, Kobo, and Reasily.
                  </p>
                  <input
                    type="file"
                    ref={epubFileInputRef}
                    accept=".epub"
                    onChange={(e) => handleDigitalFileUpload(e, "EPUB")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingFormat === "EPUB"}
                    onClick={() => epubFileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#14161A] transition-colors disabled:opacity-50"
                  >
                    {uploadingFormat === "EPUB" ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#B85D19]" />
                    ) : (
                      <Upload className="h-3 w-3 text-[#B85D19]" />
                    )}
                    <span>{uploadingFormat === "EPUB" ? "Vaulting..." : "Upload EPUB"}</span>
                  </button>
                  {uploadSuccessMessages.EPUB && (
                    <div className="font-mono text-[10px] text-emerald-700 truncate">
                      ✓ {uploadSuccessMessages.EPUB}
                    </div>
                  )}
                </div>

                {/* PDF Master Uploader */}
                <div className="p-3.5 rounded-sm border border-[#E7E2D8] bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#14161A]">
                      PDF Master Print
                    </span>
                    <span className="text-[10px] font-mono text-[#737680]">.pdf</span>
                  </div>
                  <p className="text-[11px] text-[#737680] line-clamp-2">
                    Fixed optical geometry, high-DPI desktop & tablet layout.
                  </p>
                  <input
                    type="file"
                    ref={pdfFileInputRef}
                    accept=".pdf"
                    onChange={(e) => handleDigitalFileUpload(e, "PDF")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingFormat === "PDF"}
                    onClick={() => pdfFileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#14161A] transition-colors disabled:opacity-50"
                  >
                    {uploadingFormat === "PDF" ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#B85D19]" />
                    ) : (
                      <Upload className="h-3 w-3 text-[#B85D19]" />
                    )}
                    <span>{uploadingFormat === "PDF" ? "Vaulting..." : "Upload PDF"}</span>
                  </button>
                  {uploadSuccessMessages.PDF && (
                    <div className="font-mono text-[10px] text-emerald-700 truncate">
                      ✓ {uploadSuccessMessages.PDF}
                    </div>
                  )}
                </div>

                {/* MOBI Uploader */}
                <div className="p-3.5 rounded-sm border border-[#E7E2D8] bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#14161A]">
                      Kindle MOBI
                    </span>
                    <span className="text-[10px] font-mono text-[#737680]">.mobi / .zip</span>
                  </div>
                  <p className="text-[11px] text-[#737680] line-clamp-2">
                    KF8 compatible monograph for Send-to-Kindle & e-ink readers.
                  </p>
                  <input
                    type="file"
                    ref={mobiFileInputRef}
                    accept=".mobi,.zip"
                    onChange={(e) => handleDigitalFileUpload(e, "MOBI")}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingFormat === "MOBI"}
                    onClick={() => mobiFileInputRef.current?.click()}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] hover:bg-[#F4EFE6] text-[#14161A] transition-colors disabled:opacity-50"
                  >
                    {uploadingFormat === "MOBI" ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#B85D19]" />
                    ) : (
                      <Upload className="h-3 w-3 text-[#B85D19]" />
                    )}
                    <span>{uploadingFormat === "MOBI" ? "Vaulting..." : "Upload MOBI"}</span>
                  </button>
                  {uploadSuccessMessages.MOBI && (
                    <div className="font-mono text-[10px] text-emerald-700 truncate">
                      ✓ {uploadSuccessMessages.MOBI}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Author & Synopsis */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              03 · Author & Editorial Synopsis
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
                  Full Synopsis (Detailed overview on book page)
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
                  Short Description (For catalog cards and previews)
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

          {/* SECTION 4: Pricing, Gumroad & Specifications */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              04 · Pricing, Checkout Channels & Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Direct Price <span className="text-[#B85D19]">*</span>
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Optional Gumroad Product URL (Dual-Checkout)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737680]" />
                  <input
                    type="url"
                    value={gumroadUrl}
                    onChange={(e) => setGumroadUrl(e.target.value)}
                    placeholder="https://meridianpress.gumroad.com/l/monograph-slug"
                    className="w-full pl-8 pr-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
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
                  ISBN-13
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

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Subject Tags (Comma separated)
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

          {/* SECTION 5: Sample Chapter & Table of Contents */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              05 · Sample Excerpt & Table of Contents
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                    Sample Excerpt Title
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
                    Sample Excerpt Subtitle
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
                  Sample Excerpt Markdown
                </label>
                <textarea
                  rows={5}
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
                  rows={3}
                  value={tocText}
                  onChange={(e) => setTocText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Search Engine Optimization (SEO) */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              06 · Search Engine Optimization (SEO & Social Sharing)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Custom SEO Title Tag
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="The Architecture of Durable Systems — Marcus Vance"
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1">
                  Custom Meta Description
                </label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Read the acclaimed monograph on software longevity and durable system architecture."
                  className="w-full px-3.5 py-2 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: Curation & Highlights */}
          <div className="space-y-4 pt-2">
            <h4 className="font-mono text-xs uppercase tracking-wider text-[#B85D19] font-medium border-b border-[#E7E2D8] pb-1">
              07 · Storefront Highlights
            </h4>

            <div className="flex flex-wrap gap-6 pt-1">
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
                <span>Saving Monograph...</span>
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
