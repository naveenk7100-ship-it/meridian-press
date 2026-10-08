"use client";
 
import { useState } from "react";
import { CheckCircle2, Loader2, Feather } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "quarterly">("monthly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, frequency }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        trackEvent("newsletter_subscribed", { frequency });
        setStatus("success");
        setMessage(data.message || "Thank you. You are subscribed to the Meridian Dispatch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please verify your email.");
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#F4EFE6] border-b border-[#E7E2D8]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-md border border-[#DDD6C9] bg-[#FAF8F5] p-8 sm:p-12 shadow-xs text-center space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[#14161A] text-[#FAF8F5] mx-auto">
            <Feather className="h-6 w-6 stroke-[1.5]" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-[#B85D19] font-medium">
              Literary & Technical Dispatch
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[#14161A] tracking-tight">
              The Meridian Letter
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#5C5F68] leading-relaxed">
              We publish occasional long-form essays, typography studies, and advance notices of upcoming monographs. Delivered at most once per month. No promotions, no sales gimmicks.
            </p>
          </div>

          {status === "success" ? (
            <div className="p-4 rounded-sm bg-[#EBF7EE] border border-[#C3E6CB] text-[#1E7E34] text-sm font-sans flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-[#5C5F68] pb-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    value="monthly"
                    checked={frequency === "monthly"}
                    onChange={() => setFrequency("monthly")}
                    className="accent-[#B85D19]"
                  />
                  <span>Monthly Digest</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="freq"
                    value="quarterly"
                    checked={frequency === "quarterly"}
                    onChange={() => setFrequency("quarterly")}
                    className="accent-[#B85D19]"
                  />
                  <span>Quarterly Review</span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="reader@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow px-4 py-3 text-sm rounded-sm border border-[#DDD6C9] bg-white text-[#14161A] placeholder-[#8C909B] focus:outline-none focus:ring-2 focus:ring-[#B85D19] focus:border-transparent font-sans"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors disabled:opacity-50 active:scale-[0.99]"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </div>

              {status === "error" && (
                <p className="text-xs text-red-600 font-sans text-left">{message}</p>
              )}

              <div className="flex items-center justify-center gap-4 text-xs font-mono text-[#737680] pt-1">
                <span>Direct RSS feed also available</span>
                <span>·</span>
                <span>One-click unsubscribe anytime</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
