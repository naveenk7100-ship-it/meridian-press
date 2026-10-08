"use client";

import { useState } from "react";
import Link from "next/link";
import { Book } from "@/types/book";
import { formatPrice } from "@/lib/utils";
import { BookCover } from "@/components/books/BookCover";
import {
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Loader2,
  Globe,
  FileCheck,
  Archive,
} from "lucide-react";

interface AdminBookTableProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDeleted: (bookId: string) => void;
  onTogglePublished: (book: Book) => void;
}

export function AdminBookTable({
  books,
  onEdit,
  onDeleted,
  onTogglePublished,
}: AdminBookTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        onDeleted(id);
      } else {
        alert(data.error || "Failed to delete monograph.");
      }
    } catch {
      alert("An error occurred during deletion.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleToggle = async (book: Book) => {
    setTogglingId(book.id);
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok && data.success) {
        onTogglePublished(data.book);
      }
    } catch {
      alert("Failed to toggle publication status.");
    } finally {
      setTogglingId(null);
    }
  };

  if (books.length === 0) {
    return (
      <div className="rounded-md border border-[#E7E2D8] bg-[#FAF8F5] p-12 text-center space-y-3">
        <p className="font-serif text-base text-[#14161A]">No monographs match your current filter.</p>
        <p className="font-mono text-xs text-[#737680]">
          Adjust search criteria or click &quot;Publish Monograph&quot; to add a new title.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[#E7E2D8] bg-[#FAF8F5] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="border-b border-[#E7E2D8] bg-[#F4EFE6] font-mono uppercase tracking-wider text-[#737680]">
            <tr>
              <th className="py-3 px-4">Monograph & Slug</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Price & Channels</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEBE3]">
            {books.map((book) => {
              const isToggling = togglingId === book.id;
              const isDeleting = deletingId === book.id;
              const isConfirming = confirmDeleteId === book.id;
              const isLive = book.status === "published" || (book.status === undefined && book.published);
              const isArchived = book.status === "archived";

              return (
                <tr
                  key={book.id}
                  className="hover:bg-[#F4EFE6]/50 transition-colors"
                >
                  {/* Monograph info & cover */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <BookCover book={book} size="sm" showSpine={false} className="w-10 h-14" />
                      </div>
                      <div className="max-w-xs sm:max-w-sm">
                        <div className="font-serif text-sm font-medium text-[#14161A] line-clamp-1">
                          {book.title}
                        </div>
                        <div className="font-mono text-[10px] text-[#737680] truncate">
                          /{book.slug}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {book.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[9px] text-[#B85D19]">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              Featured
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] text-[#737680]">
                            <FileCheck className="h-2.5 w-2.5" />
                            {book.formats?.length || 3} formats
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#5C5F68]">
                    {book.category}
                  </td>

                  {/* Author */}
                  <td className="py-3.5 px-4 font-serif italic text-[#383A42]">
                    {book.author.name}
                  </td>

                  {/* Price & Checkout channels */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-medium text-[#14161A]">
                      {formatPrice(book.price, book.currency)}
                    </div>
                    {book.gumroadUrl && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#737680] mt-0.5">
                        <Globe className="h-2.5 w-2.5 text-[#B85D19]" />
                        Gumroad Linked
                      </span>
                    )}
                  </td>

                  {/* Status Toggle Button */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggle(book)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                        isLive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : isArchived
                          ? "bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isLive ? (
                        <>
                          <Eye className="h-3 w-3 text-emerald-600" />
                          <span>Live</span>
                        </>
                      ) : isArchived ? (
                        <>
                          <Archive className="h-3 w-3 text-stone-600" />
                          <span>Archived</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-amber-600" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/books/${book.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-sm text-[#737680] hover:text-[#14161A] hover:bg-[#EAE3D6]"
                        title="View live storefront page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEdit(book)}
                        className="p-1.5 rounded-sm text-[#737680] hover:text-[#14161A] hover:bg-[#EAE3D6]"
                        title="Edit monograph details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(book.id)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-red-600 text-white rounded-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeleting ? "..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 text-[10px] font-mono bg-gray-200 text-gray-700 rounded-xs hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(book.id)}
                          className="p-1.5 rounded-sm text-[#737680] hover:text-red-600 hover:bg-red-50"
                          title="Delete monograph"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
