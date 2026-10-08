import { notFound } from "next/navigation";
import { getBookBySlug, getRelatedBooks } from "@/lib/repositories/books-repo";
import { BookDetailClient } from "@/components/books/BookDetailClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return {
      title: "Monograph Not Found | Meridian Press",
    };
  }

  return {
    title: `${book.title} — ${book.author.name}`,
    description: book.description,
    openGraph: {
      title: `${book.title} | Meridian Press`,
      description: book.subtitle,
      images: book.coverImage ? [book.coverImage] : [],
      type: "book",
      authors: [book.author.name],
      isbn: book.isbn,
    },
  };
}

export default async function BookSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const relatedBooks = await getRelatedBooks(book, 3);

  return <BookDetailClient book={book} relatedBooks={relatedBooks} />;
}
