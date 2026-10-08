export type BookCategory =
  | "Architecture & Systems"
  | "Design Philosophy"
  | "Craft of Writing"
  | "Digital Epistemology"
  | "Independent Thought"
  | "Visual Arts & Typographics";

export interface BookFormat {
  type: "EPUB" | "PDF" | "MOBI";
  size: string;
  drmFree: boolean;
  version?: string;
  filePath?: string;
}

export interface Chapter {
  number: number;
  title: string;
  summary?: string;
  content: string;
}

export type BookStatus = "draft" | "published" | "archived";

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  synopsis: string;
  author: {
    name: string;
    bio: string;
    avatarUrl?: string;
  };
  category: BookCategory;
  tags: string[];
  price: number; // in INR by default (e.g. 799, 999)
  currency: "INR" | "USD" | "EUR" | "GBP";
  coverImage: string;
  coverColorTheme?: {
    background: string;
    accent: string;
    textColor: string;
  };
  pageCount: number;
  wordCount: number;
  readingTimeMinutes: number;
  isbn: string;
  edition: string;
  publishedYear: number;
  publishedDate: string;
  formats: BookFormat[];
  sampleChapter: {
    title: string;
    subtitle?: string;
    content: string;
  };
  tableOfContents: string[];
  digitalFileReference: {
    fileName: string;
    fileSize: string;
    checksum?: string;
  };
  status?: BookStatus;
  gumroadUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  isFeatured: boolean;
  isBestseller?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BookCreateInput = Omit<Book, "id" | "createdAt" | "updatedAt">;
export type BookUpdateInput = Partial<BookCreateInput>;

