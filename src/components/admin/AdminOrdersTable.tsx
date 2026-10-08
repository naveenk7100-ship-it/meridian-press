"use client";

import { useState } from "react";
import { Order } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  CreditCard,
  Mail,
  BookOpen,
} from "lucide-react";

interface AdminOrdersTableProps {
  orders: Order[];
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.bookTitle.toLowerCase().includes(q) ||
      (order.razorpayPaymentId && order.razorpayPaymentId.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-sm bg-[#F4EFE6] border border-[#E7E2D8]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#737680]" />
          <input
            type="text"
            placeholder="Search by order ID, email, book, or payment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#8C909B] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[#737680]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="paid">
              Paid ({orders.filter((o) => o.status === "paid").length})
            </option>
            <option value="pending">
              Pending ({orders.filter((o) => o.status === "pending").length})
            </option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E7E2D8] rounded-sm overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-[#737680] space-y-2">
            <CreditCard className="h-8 w-8 mx-auto text-[#DDD6C9]" />
            <p className="font-serif text-base">No transaction records found</p>
            <p className="text-xs font-mono">
              {searchQuery
                ? "Try adjusting your search query."
                : "Real customer purchases will appear here as they are captured."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E2D8] bg-[#FAF8F5] text-[#737680] font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Patron</th>
                  <th className="py-3 px-4">Monograph</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Gateway Reference</th>
                  <th className="py-3 px-4 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D8]">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF8F5] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-[#14161A]">
                        {order.id}
                      </div>
                      <div className="text-[10px] text-[#737680] font-mono">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[#14161A]">
                        <Mail className="h-3 w-3 text-[#B85D19]" />
                        <span className="font-medium">{order.customerEmail}</span>
                      </div>
                      {order.customerName && (
                        <div className="text-[10px] text-[#737680]">
                          {order.customerName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[#14161A] font-medium max-w-xs truncate">
                        <BookOpen className="h-3 w-3 text-[#737680] flex-shrink-0" />
                        <span title={order.bookTitle}>{order.bookTitle}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-[#14161A]">
                      {formatPrice(order.amount, order.currency)}
                    </td>

                    <td className="py-3 px-4">
                      {order.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#EBF7EE] text-[#1E7E34] font-mono text-[10px] font-medium uppercase border border-[#C3E6CB]">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-amber-50 text-amber-700 font-mono text-[10px] font-medium uppercase border border-amber-200">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#5C5F68]">
                      {order.razorpayPaymentId ? (
                        <span className="bg-[#F4EFE6] px-1.5 py-0.5 rounded-xs border border-[#DDD6C9]">
                          {order.razorpayPaymentId}
                        </span>
                      ) : (
                        <span className="text-[#8C909B] italic">Awaiting Capture</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={`/orders/${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#B85D19] hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
