"use client";

import { useState, useEffect } from "react";
import { Book } from "@/types/book";
import { formatPrice } from "@/lib/utils";
import { BookCover } from "./BookCover";
import {
  X,
  CheckCircle2,
  Download,
  ShieldCheck,
  FileCheck,
  Lock,
  Loader2,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CheckoutModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderResult {
  id: string;
  bookTitle: string;
  customerEmail: string;
  downloadToken: string;
  downloadUrl: string;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayFailureResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

// Helper to dynamically load the Razorpay checkout.js script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutModal({ book, isOpen, onClose }: CheckoutModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preload Razorpay script on open
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccessfulPayment = (result: OrderResult) => {
    setOrderResult(result);
    setIsSubmitting(false);
    setProcessingStatus("");

    // Subtle celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#B85D19", "#FAF8F5", "#14161A", "#DDD6C9"],
      });
    } catch {
      // Fallback gracefully
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setProcessingStatus("Initializing secure checkout...");

    try {
      // 1. Create order on server
      const createRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          bookSlug: book.slug,
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || "Failed to initiate payment order.");
      }

      const { order, razorpay } = createData;

      // 2. Ensure Razorpay checkout script is available
      setProcessingStatus("Launching Razorpay checkout modal...");
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded || !window.Razorpay) {
        // Fallback for offline development or sandbox testing without external script
        if (process.env.NODE_ENV !== "production" || razorpay.isTestMode) {
          setProcessingStatus("Dev sandbox: Verifying local test order...");
          const sandboxPaymentId = `pay_sandbox_${order.id.toLowerCase()}`;
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: razorpay.orderId,
              razorpay_payment_id: sandboxPaymentId,
              razorpay_signature: `sig_test_${order.id}`,
              order_id: order.id,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            handleSuccessfulPayment({
              id: order.id,
              bookTitle: book.title,
              customerEmail: email,
              downloadToken: verifyData.accessToken,
              downloadUrl: `/orders/${order.id}?token=${verifyData.accessToken}`,
            });
            return;
          }
        }
        throw new Error("Unable to load secure Razorpay gateway. Please check your internet connection.");
      }

      // 3. Launch Razorpay Modal
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency || "INR",
        name: "Meridian Press",
        description: `DRM-Free Monograph: ${book.title}`,
        image: "https://meridianpress.pub/favicon.ico",
        order_id: razorpay.orderId,
        prefill: {
          name: name || undefined,
          email: email,
        },
        theme: {
          color: "#B85D19",
          backdrop_color: "#14161A",
        },
        handler: async function (response: RazorpayPaymentResponse) {
          setProcessingStatus("Verifying cryptographic payment signature...");
          try {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: order.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            handleSuccessfulPayment({
              id: order.id,
              bookTitle: book.title,
              customerEmail: email,
              downloadToken: verifyData.accessToken,
              downloadUrl: `/orders/${order.id}?token=${verifyData.accessToken}`,
            });
          } catch (verifyErr: unknown) {
            const msg = verifyErr instanceof Error ? verifyErr.message : "Cryptographic payment verification failed.";
            setError(msg);
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setProcessingStatus("");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: RazorpayFailureResponse) {
        setError(response.error?.description || "Payment failed or was declined by issuing bank.");
        setIsSubmitting(false);
        setProcessingStatus("");
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please check your details.";
      setError(msg);
      setIsSubmitting(false);
      setProcessingStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] border border-[#E7E2D8] rounded-md shadow-2xl overflow-hidden text-[#14161A]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E2D8] bg-[#F4EFE6]/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#B85D19]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#737680]">
              {orderResult ? "Acquisition Confirmed" : "Direct Digital Acquisition · Razorpay Secure"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#737680] hover:text-[#14161A] hover:bg-[#EAE3D6] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
          {!orderResult ? (
            /* Checkout Form Step */
            <div className="space-y-6">
              {/* Product preview banner */}
              <div className="flex gap-4 p-4 rounded-sm bg-[#F4EFE6] border border-[#E7E2D8]">
                <div className="flex-shrink-0">
                  <BookCover book={book} size="sm" showSpine={false} />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#B85D19]">
                      {book.category}
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-medium leading-snug">
                      {book.title}
                    </h4>
                    <p className="font-serif italic text-xs text-[#5C5F68] mt-0.5">
                      By {book.author.name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#DDD6C9]">
                    <span className="font-mono text-xs text-[#737680]">
                      Complete DRM-Free Bundle
                    </span>
                    <span className="font-mono text-base font-semibold text-[#14161A]">
                      {formatPrice(book.price, book.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acquisition Guarantee Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[#5C5F68]">
                <div className="flex items-start gap-2 p-2.5 rounded-sm bg-white border border-[#E7E2D8]">
                  <CheckCircle2 className="h-4 w-4 text-[#B85D19] flex-shrink-0 mt-0.5" />
                  <span>Immediate EPUB, PDF & MOBI downloads</span>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-sm bg-white border border-[#E7E2D8]">
                  <CheckCircle2 className="h-4 w-4 text-[#B85D19] flex-shrink-0 mt-0.5" />
                  <span>Perpetual DRM-free personal license</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-xs rounded-sm bg-red-50 border border-red-200 text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="reader-email"
                    className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1.5"
                  >
                    Delivery Email Address <span className="text-[#B85D19]">*</span>
                  </label>
                  <input
                    id="reader-email"
                    type="email"
                    required
                    placeholder="your.name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#9FA2AB] focus:outline-none focus:ring-2 focus:ring-[#B85D19] focus:border-transparent font-sans disabled:opacity-60"
                  />
                  <p className="mt-1 text-[11px] text-[#737680]">
                    Your secure download links and tax invoice receipt will be delivered here.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="reader-name"
                    className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1.5"
                  >
                    Your Name (Optional)
                  </label>
                  <input
                    id="reader-name"
                    type="text"
                    placeholder="Marcus Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#9FA2AB] focus:outline-none focus:ring-2 focus:ring-[#B85D19] focus:border-transparent font-sans disabled:opacity-60"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-all disabled:opacity-60 active:scale-[0.99] shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#B85D19]" />
                        <span>{processingStatus || "Processing with Razorpay..."}</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 text-[#B85D19]" />
                        <span>
                          Pay with Razorpay · {formatPrice(book.price, book.currency)}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-center text-[11px] font-mono text-[#8C909B]">
                  <Lock className="h-3 w-3 text-[#B85D19]" />
                  <span>UPI · Cards · NetBanking · 14-Day Digital Product Policy</span>
                </div>
              </form>
            </div>
          ) : (
            /* Success / Delivery State */
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF7EE] text-[#1E7E34] mx-auto border border-[#C3E6CB]">
                <CheckCircle2 className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
                  Verified Order #{orderResult.id}
                </span>
                <h3 className="font-serif text-2xl font-medium tracking-tight">
                  Your Digital Monograph is Ready
                </h3>
                <p className="font-sans text-sm text-[#5C5F68] max-w-md mx-auto">
                  A receipt and perpetual access link have been dispatched to{" "}
                  <strong className="text-[#14161A]">{orderResult.customerEmail}</strong>.
                  You can download your copies immediately below.
                </p>
              </div>

              {/* Download buttons for each format */}
              <div className="space-y-2.5 pt-2 text-left">
                <a
                  href={`/api/download/${orderResult.downloadToken}?format=epub`}
                  className="flex items-center justify-between p-3.5 rounded-sm bg-white border border-[#DDD6C9] hover:border-[#B85D19] hover:bg-[#FDFBF7] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-[#B85D19]" />
                    <div>
                      <div className="font-medium text-sm text-[#14161A] group-hover:text-[#B85D19]">
                        EPUB Edition (Apple Books, Kobo, Reasily)
                      </div>
                      <div className="font-mono text-xs text-[#737680]">
                        Standard reflowable e-reader format
                      </div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-[#737680] group-hover:text-[#B85D19]" />
                </a>

                <a
                  href={`/api/download/${orderResult.downloadToken}?format=pdf`}
                  className="flex items-center justify-between p-3.5 rounded-sm bg-white border border-[#DDD6C9] hover:border-[#B85D19] hover:bg-[#FDFBF7] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-[#B85D19]" />
                    <div>
                      <div className="font-medium text-sm text-[#14161A] group-hover:text-[#B85D19]">
                        PDF Edition (High-DPI Desktop & Tablet Print Layout)
                      </div>
                      <div className="font-mono text-xs text-[#737680]">
                        Fixed optical geometry and vector typography
                      </div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-[#737680] group-hover:text-[#B85D19]" />
                </a>

                <a
                  href={`/api/download/${orderResult.downloadToken}?format=mobi`}
                  className="flex items-center justify-between p-3.5 rounded-sm bg-white border border-[#DDD6C9] hover:border-[#B85D19] hover:bg-[#FDFBF7] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-[#B85D19]" />
                    <div>
                      <div className="font-medium text-sm text-[#14161A] group-hover:text-[#B85D19]">
                        MOBI Edition (Amazon Kindle)
                      </div>
                      <div className="font-mono text-xs text-[#737680]">
                        Optimized for Send-to-Kindle & e-ink
                      </div>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-[#737680] group-hover:text-[#B85D19]" />
                </a>
              </div>

              <div className="pt-4 border-t border-[#E7E2D8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={orderResult.downloadUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#B85D19] hover:underline"
                >
                  <span>Open Dedicated Order Page</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33]"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
