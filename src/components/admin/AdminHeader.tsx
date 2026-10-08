"use client";

import { useRouter } from "next/navigation";
import { Plus, LogOut, ShieldCheck, BookOpen, CheckCircle, IndianRupee, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AdminHeaderProps {
  totalBooks: number;
  publishedCount: number;
  draftCount: number;
  totalRevenueINR: number;
  paidOrdersCount: number;
  activeTab: "books" | "orders";
  onTabChange: (tab: "books" | "orders") => void;
  onAddNew: () => void;
}

export function AdminHeader({
  totalBooks,
  publishedCount,
  draftCount,
  totalRevenueINR,
  paidOrdersCount,
  activeTab,
  onTabChange,
  onAddNew,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2D8]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-mono text-[#B85D19] bg-[#B85D19]/10 px-2 py-0.5 rounded-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Authenticated Publisher Session
            </span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-[#14161A] tracking-tight">
            Editorial Management Desk
          </h1>
          <p className="text-xs text-[#737680] font-sans">
            Manage monographs, pricing, sample chapters, format bundles, and real patron acquisitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Monograph</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#5C5F68] hover:text-[#14161A] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5]">
          <div className="flex items-center justify-between text-xs font-mono text-[#737680]">
            <span>Total Catalog</span>
            <BookOpen className="h-4 w-4 text-[#B85D19]" />
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold text-[#14161A]">
            {totalBooks} Titles
          </div>
          <div className="text-[10px] font-mono text-[#737680] mt-1">
            {publishedCount} Live · {draftCount} Drafts
          </div>
        </div>

        <div className="p-4 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5]">
          <div className="flex items-center justify-between text-xs font-mono text-[#737680]">
            <span>Captured Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold text-emerald-700">
            {formatPrice(totalRevenueINR, "INR")}
          </div>
          <div className="text-[10px] font-mono text-[#737680] mt-1">
            Real Database Transactions
          </div>
        </div>

        <div className="p-4 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5]">
          <div className="flex items-center justify-between text-xs font-mono text-[#737680]">
            <span>Paid Acquisitions</span>
            <ShoppingBag className="h-4 w-4 text-[#B85D19]" />
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold text-[#14161A]">
            {paidOrdersCount} Orders
          </div>
          <div className="text-[10px] font-mono text-[#737680] mt-1">
            Razorpay Verified
          </div>
        </div>

        <div className="p-4 rounded-sm border border-[#E7E2D8] bg-[#FAF8F5]">
          <div className="flex items-center justify-between text-xs font-mono text-[#737680]">
            <span>Live in Catalog</span>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold text-emerald-700">
            {publishedCount} Published
          </div>
          <div className="text-[10px] font-mono text-[#737680] mt-1">
            Available to readers
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E7E2D8] text-xs font-mono">
        <button
          type="button"
          onClick={() => onTabChange("books")}
          className={`px-4 py-2.5 font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === "books"
              ? "border-[#B85D19] text-[#14161A] bg-white"
              : "border-transparent text-[#737680] hover:text-[#14161A]"
          }`}
        >
          Monograph Catalog ({totalBooks})
        </button>

        <button
          type="button"
          onClick={() => onTabChange("orders")}
          className={`px-4 py-2.5 font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
            activeTab === "orders"
              ? "border-[#B85D19] text-[#14161A] bg-white"
              : "border-transparent text-[#737680] hover:text-[#14161A]"
          }`}
        >
          Orders &amp; Transactions ({paidOrdersCount})
        </button>
      </div>
    </div>
  );
}
