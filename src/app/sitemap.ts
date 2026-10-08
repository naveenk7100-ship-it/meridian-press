import { MetadataRoute } from "next";
import { getPublishedBooks } from "@/lib/repositories/books-repo";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://meridianpress.pub";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedBooks = await getPublishedBooks();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/books`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/refunds`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const bookPages: MetadataRoute.Sitemap = publishedBooks.map((book) => ({
    url: `${BASE_URL}/books/${book.slug}`,
    lastModified: new Date(book.updatedAt || book.publishedDate),
    changeFrequency: "weekly",
    priority: book.isFeatured ? 0.9 : 0.8,
  }));

  return [...staticPages, ...bookPages];
}
