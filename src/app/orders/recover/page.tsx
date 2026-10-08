"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowRight, Loader2, CheckCircle2, BookOpen } from "lucide-react";

export default function OrderRecoveryPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not process recovery request.");
      }

      setResultMessage(data.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-[#FAF8F5] min-h-[80vh] flex items-center justify-center text-[#14161A]">
      <div className="mx-auto max-w-lg w-full px-4">
        <div className="bg-white border border-[#E7E2D8] rounded-sm p-8 sm:p-10 shadow-xs space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center border-b border-[#E7E2D8] pb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#B85D19]/10 text-[#B85D19] text-xs font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Patron Library Retrieval</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
              Monograph Access Recovery
            </h1>
            <p className="text-xs text-[#5C5F68] font-sans max-w-sm mx-auto">
              Misplaced your files or need to download your EPUB, PDF, or MOBI to a new device? Enter your purchase email address below.
            </p>
          </div>

          {resultMessage ? (
            <div className="space-y-6 text-center py-4 animate-fadeIn">
              <div className="h-12 w-12 rounded-full bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB] flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-medium text-[#14161A]">
                  Recovery Dispatch Initiated
                </h3>
                <p className="text-xs text-[#5C5F68] leading-relaxed">
                  {resultMessage}
                </p>
                <p className="text-[11px] font-mono text-[#737680] pt-2">
                  Please check your inbox and spam folder. Download links contain secure single-patron access tokens.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E7E2D8] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setResultMessage(null);
                    setEmail("");
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-medium rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] hover:bg-[#F4EFE6] transition-colors"
                >
                  Retrieve Another Email
                </button>
                <Link
                  href="/books"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-mono text-[#B85D19] hover:underline pt-2"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Return to Catalog</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="recovery-email"
                  className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1.5"
                >
                  Purchase Email Address <span className="text-[#B85D19]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C909B]" />
                  <input
                    id="recovery-email"
                    type="email"
                    required
                    placeholder="patron@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] placeholder-[#9FA2AB] focus:outline-none focus:ring-2 focus:ring-[#B85D19] focus:bg-white transition-all font-sans"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-[#737680]">
                  The email address you entered when completing checkout.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-all disabled:opacity-60 active:scale-[0.99] shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#B85D19]" />
                      <span>Searching Patron Records...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Links</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-[#E7E2D8] flex items-center justify-between text-xs font-mono text-[#737680]">
                <Link href="/books" className="hover:text-[#B85D19] transition-colors">
                  ← Back to Books
                </Link>
                <Link href="/contact" className="hover:text-[#B85D19] transition-colors">
                  Need Help? Contact
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
