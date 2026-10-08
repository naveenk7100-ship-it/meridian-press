import { Book, BookCreateInput, BookUpdateInput } from "@/types/book";
import {
  getAllBooks as repoGetAllBooks,
  getPublishedBooks as repoGetPublishedBooks,
  getFeaturedBooks as repoGetFeaturedBooks,
  getBookBySlug as repoGetBookBySlug,
  getBookById as repoGetBookById,
  getRelatedBooks as repoGetRelatedBooks,
  createBookRecord,
  updateBookRecord,
  deleteBookRecord,
  toggleBookPublishRecord,
} from "./repositories/books-repo";

/**
 * Unified book store interface delegating to database/file repositories.
 * Fully supports asynchronous operations across PostgreSQL and local fallback.
 */

export async function getAllBooks(): Promise<Book[]> {
  return repoGetAllBooks();
}

export async function getPublishedBooks(): Promise<Book[]> {
  return repoGetPublishedBooks();
}

export async function getFeaturedBooks(): Promise<Book[]> {
  return repoGetFeaturedBooks();
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  return repoGetBookBySlug(slug);
}

export async function getBookById(id: string): Promise<Book | null> {
  return repoGetBookById(id);
}

export async function getRelatedBooks(currentBook: Book, limit = 3): Promise<Book[]> {
  return repoGetRelatedBooks(currentBook, limit);
}

export async function createBook(input: BookCreateInput): Promise<Book> {
  return createBookRecord(input);
}

export async function updateBook(id: string, input: BookUpdateInput): Promise<Book | null> {
  return updateBookRecord(id, input);
}

export async function deleteBook(id: string): Promise<boolean> {
  return deleteBookRecord(id);
}

export async function toggleBookPublish(id: string): Promise<Book | null> {
  return toggleBookPublishRecord(id);
}
