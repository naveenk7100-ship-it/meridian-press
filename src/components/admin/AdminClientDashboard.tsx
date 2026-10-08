"use client";

import { useState } from "react";
import { Book } from "@/types/book";
import { Order } from "@/types/database";
import { AdminHeader } from "./AdminHeader";
import { AdminBookTable } from "./AdminBookTable";
import { AdminOrdersTable } from "./AdminOrdersTable";
import { BookFormModal } from "./BookFormModal";
import { Search, Filter, CheckCircle2 } from "lucide-react";

interface AdminClientDashboardProps {
  initialBooks: Book[];
  initialOrders: Order[];
  initialMetrics: {
    totalRevenueINR: number;
    totalPaidOrders: number;
    totalPendingOrders: number;
  };
}

export function AdminClientDashboard({
  initialBooks,
  initialOrders,
  initialMetrics,
}: AdminClientDashboardProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [orders] = useState<Order[]>(initialOrders);
  const [metrics] = useState(initialMetrics);
  const [activeTab, setActiveTab] = useState<"books" | "orders">("books");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddNew = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleBookSaved = (savedBook: Book) => {
    setBooks((prev) => {
      const exists = prev.some((b) => b.id === savedBook.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBook.id ? savedBook : b));
      }
      return [savedBook, ...prev];
    });
    showToast(`Monograph "${savedBook.title}" successfully saved.`);
  };

  const handleBookDeleted = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast("Monograph removed from catalog.");
  };

  const handleTogglePublished = (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
    showToast(
      `"${updatedBook.title}" is now ${updatedBook.published ? "Live in Bookstore" : "Moved to Drafts"}.`
    );
  };

  // Filtered books list
  const filteredBooks = books.filter((b) => {
    const matchesCat = categoryFilter === "All" || b.category === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const publishedCount = books.filter((b) => b.published).length;
  const draftCount = books.length - publishedCount;

  return (
    <div className="space-y-8">
      {/* Toast alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-sm bg-[#14161A] text-[#FAF8F5] text-xs font-mono shadow-xl border border-white/20 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header with quick metrics and tab selector */}
      <AdminHeader
        totalBooks={books.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
        totalRevenueINR={metrics.totalRevenueINR}
        paidOrdersCount={metrics.totalPaidOrders}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddNew={handleAddNew}
      />

      {/* Content depending on active tab */}
      {activeTab === "books" ? (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-sm bg-[#F4EFE6] border border-[#E7E2D8]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737680]" />
              <input
                type="text"
                placeholder="Filter title, author or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#8C909B] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-[#737680]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              >
                <option value="All">All Categories</option>
                <option value="Architecture & Systems">Architecture & Systems</option>
                <option value="Design Philosophy">Design Philosophy</option>
                <option value="Craft of Writing">Craft of Writing</option>
                <option value="Digital Epistemology">Digital Epistemology</option>
                <option value="Independent Thought">Independent Thought</option>
                <option value="Visual Arts & Typographics">Visual Arts & Typographics</option>
              </select>
            </div>
          </div>

          {/* Admin Books Table */}
          <AdminBookTable
            books={filteredBooks}
            onEdit={handleEdit}
            onDeleted={handleBookDeleted}
            onTogglePublished={handleTogglePublished}
          />
        </div>
      ) : (
        /* Orders & Transactions View */
        <AdminOrdersTable orders={orders} />
      )}

      {/* Book Form Modal */}
      {isModalOpen && (
        <BookFormModal
          isOpen={isModalOpen}
          initialBook={editingBook}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleBookSaved}
        />
      )}
    </div>
  );
}
