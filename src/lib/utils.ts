import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: "INR" | "USD" | "EUR" | "GBP" = "INR"): string {
  const symbols = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  const sym = symbols[currency] || "₹";

  if (currency === "INR") {
    // Format whole numbers cleanly for INR, e.g. ₹799
    return Number.isInteger(amount)
      ? `${sym}${amount.toLocaleString("en-IN")}`
      : `${sym}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${sym}${amount.toFixed(2)}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function estimateReadingTime(words: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${minutes} min read`;
  }
  if (remainingMinutes === 0) {
    return `${hours} hr read`;
  }
  return `${hours} hr ${remainingMinutes} min read`;
}
