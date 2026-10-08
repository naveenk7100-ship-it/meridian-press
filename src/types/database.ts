export interface Customer {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string; // e.g. "MER-2025-ABCD"
  customerId: string;
  customerEmail: string;
  customerName?: string | null;
  bookId: string;
  bookTitle: string;
  bookSlug: string;
  amount: number; // in currency base units (e.g. 799 for ₹799)
  currency: "INR" | "USD" | "EUR" | "GBP";
  status: OrderStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: "razorpay";
  providerPaymentId: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  status: "captured" | "failed" | "refunded";
  method?: string;
  fee?: number;
  tax?: number;
  createdAt: string;
}

export interface DownloadEntitlement {
  id: string;
  orderId: string;
  bookId: string;
  customerEmail: string;
  accessToken: string;
  expiresAt: string;
  maxDownloads: number;
  downloadCount: number;
  formatAccess: "ALL" | "EPUB" | "PDF" | "MOBI";
  isRevoked: boolean;
  lastDownloadedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  frequency: "monthly" | "quarterly";
  interests?: string[];
  createdAt: string;
}

export interface ContactInquiry {
  id: string;
  referenceId: string;
  name: string;
  email: string;
  topic: string;
  subject?: string;
  message: string;
  createdAt: string;
}
