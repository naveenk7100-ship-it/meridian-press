import { notFound } from "next/navigation";
import { getBookBySlug, getRelatedBooks } from "@/lib/repositories/books-repo";
import { BookDetailClient } from "@/components/books/BookDetailClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://meridianpress.pub";

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
      description: "The requested monograph could not be located in the Meridian Press catalog.",
    };
  }

  const pageTitle = book.seoTitle || `${book.title} — ${book.author.name}`;
  const pageDescription = book.seoDescription || book.description || book.subtitle;
  const canonicalUrl = `${BASE_URL}/books/${book.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${book.title} | Meridian Press`,
      description: book.subtitle || pageDescription,
      url: canonicalUrl,
      siteName: "Meridian Press",
      images: book.coverImage
        ? [
            {
              url: book.coverImage.startsWith("http") ? book.coverImage : `${BASE_URL}${book.coverImage}`,
              width: 1200,
              height: 1800,
              alt: `${book.title} book cover`,
            },
          ]
        : [],
      type: "book",
      authors: [book.author.name],
      isbn: book.isbn,
      releaseDate: book.publishedDate,
      tags: book.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: book.coverImage ? [book.coverImage] : [],
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

  // Schema.org Structured Data for Book & Digital Product
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "@id": `${BASE_URL}/books/${book.slug}#book`,
        name: book.title,
        headline: book.subtitle,
        description: book.description,
        isbn: book.isbn,
        numberOfPages: book.pageCount,
        bookEdition: book.edition,
        bookFormat: "https://schema.org/EBook",
        inLanguage: "en-US",
        datePublished: book.publishedDate,
        image: book.coverImage.startsWith("http") ? book.coverImage : `${BASE_URL}${book.coverImage}`,
        author: {
          "@type": "Person",
          name: book.author.name,
          description: book.author.bio,
        },
        publisher: {
          "@type": "Organization",
          name: "Meridian Press",
          url: BASE_URL,
        },
      },
      {
        "@type": "Product",
        "@id": `${BASE_URL}/books/${book.slug}#product`,
        name: `${book.title} (DRM-Free Multi-Format Digital Edition)`,
        description: book.description,
        image: book.coverImage.startsWith("http") ? book.coverImage : `${BASE_URL}${book.coverImage}`,
        sku: `MER-${book.slug.toUpperCase().slice(0, 10)}`,
        offers: {
          "@type": "Offer",
          price: book.price,
          priceCurrency: book.currency || "INR",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/books/${book.slug}`,
          seller: {
            "@type": "Organization",
            name: "Meridian Press",
          },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookDetailClient book={book} relatedBooks={relatedBooks} />
    </>
  );
}
