"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Invalid authentication passcode.");
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5]">
      <div className="w-full max-w-md space-y-8 p-8 rounded-sm bg-white border border-[#E7E2D8] shadow-md">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-[#14161A] text-[#FAF8F5] mx-auto">
            <BookOpen className="h-6 w-6 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#14161A] tracking-tight">
              Publisher Admin Desk
            </h2>
            <p className="font-mono text-xs text-[#737680] uppercase tracking-wider">
              Meridian Press Protected Imprint
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-sm bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="admin-passcode"
              className="block text-xs font-mono uppercase tracking-wider text-[#5C5F68] mb-1.5"
            >
              Editorial Access Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C909B]" />
              <input
                id="admin-passcode"
                type="password"
                required
                placeholder="Enter access passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-sm border border-[#DDD6C9] bg-[#FAF8F5] text-[#14161A] placeholder-[#8C909B] focus:outline-none focus:ring-2 focus:ring-[#B85D19]"
              />
            </div>
            <p className="mt-2 text-[11px] font-mono text-[#737680]">
              Default access key: <code className="bg-[#F4EFE6] px-1 py-0.5 rounded text-[#B85D19]">meridian2025</code> (Configurable via <code>ADMIN_SECRET</code>)
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm bg-[#14161A] text-[#FAF8F5] hover:bg-[#2B2D33] transition-colors disabled:opacity-50 active:scale-[0.99] shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Editorial Desk</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#EFEBE3]">
          <span className="text-xs font-mono text-[#8C909B]">
            Meridian Press Core Management System
          </span>
        </div>
      </div>
    </div>
  );
}
