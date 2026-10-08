"use client";

import { useState, useMemo } from "react";
import { Book } from "@/types/book";
import { Order } from "@/types/database";
import { AdminHeader } from "./AdminHeader";
import { AdminBookTable } from "./AdminBookTable";
import { AdminOrdersTable } from "./AdminOrdersTable";
import { BookFormModal } from "./BookFormModal";
import { Search, Filter, CheckCircle2, ArrowUpDown } from "lucide-react";

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
  const [statusFilter, setStatusFilter] = useState<"All" | "published" | "draft" | "archived">("All");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "price-desc" | "price-asc">("newest");
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
    const isLive = updatedBook.status === "published" || (updatedBook.status === undefined && updatedBook.published);
    showToast(
      `"${updatedBook.title}" is now ${isLive ? "Live in Bookstore" : "Moved to Drafts"}.`
    );
  };

  // Filtered & Sorted books list
  const filteredBooks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let result = books.filter((b) => {
      const matchesCat = categoryFilter === "All" || b.category === categoryFilter;
      const currentStatus = b.status || (b.published ? "published" : "draft");
      const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;

      const matchesSearch =
        !query ||
        b.title.toLowerCase().includes(query) ||
        b.subtitle?.toLowerCase().includes(query) ||
        b.author.name.toLowerCase().includes(query) ||
        b.slug.toLowerCase().includes(query) ||
        b.isbn?.toLowerCase().includes(query) ||
        b.tags?.some((t) => t.toLowerCase().includes(query));

      return matchesCat && matchesStatus && matchesSearch;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "price-asc") return a.price - b.price;
      return new Date(b.createdAt || b.publishedDate).getTime() - new Date(a.createdAt || a.publishedDate).getTime();
    });

    return result;
  }, [books, categoryFilter, statusFilter, searchQuery, sortBy]);

  const publishedCount = books.filter((b) => b.status === "published" || (b.status === undefined && b.published)).length;
  const draftCount = books.filter((b) => b.status === "draft" || (b.status === undefined && !b.published)).length;

  return (
    <div className="space-y-8">
      {/* Toast alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-sm bg-[#14161A] text-[#FAF8F5] text-xs font-mono shadow-xl border border-white/20 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Header with metrics and tab selector */}
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
          {/* Search, Filter & Sort Toolbar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-sm bg-[#F4EFE6] border border-[#E7E2D8]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737680]" />
              <input
                type="text"
                placeholder="Filter title, author, slug, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#8C909B] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
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

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "All" | "published" | "draft" | "archived")}
                  className="px-2.5 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                >
                  <option value="All">All Statuses</option>
                  <option value="published">Live Only</option>
                  <option value="draft">Drafts Only</option>
                  <option value="archived">Archived Only</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-[#737680]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "title" | "price-desc" | "price-asc")}
                  className="px-2.5 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
                >
                  <option value="newest">Newest Added</option>
                  <option value="title">Title (A-Z)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="price-asc">Price (Low to High)</option>
                </select>
              </div>
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
