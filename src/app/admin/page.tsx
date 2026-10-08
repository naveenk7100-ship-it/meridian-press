import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/auth";
import { getAllBooks } from "@/lib/repositories/books-repo";
import { getAllOrders, getRealRevenueMetrics } from "@/lib/repositories/orders-repo";
import { AdminClientDashboard } from "@/components/admin/AdminClientDashboard";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publisher Admin Desk | Meridian Press",
  description: "Protected administrative area for managing books, pricing, and catalog visibility.",
};

export default async function AdminPage() {
  const isAuthed = await verifyAdminSession();

  if (!isAuthed) {
    redirect("/admin/login");
  }

  const allBooks = await getAllBooks();
  const allOrders = await getAllOrders(100);
  const metrics = await getRealRevenueMetrics();

  return (
    <div className="py-10 sm:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdminClientDashboard
          initialBooks={allBooks}
          initialOrders={allOrders}
          initialMetrics={metrics}
        />
      </div>
    </div>
  );
}
