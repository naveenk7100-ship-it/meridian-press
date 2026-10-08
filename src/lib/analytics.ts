/**
 * Meridian Press Privacy-First Analytics Telemetry
 * 
 * Dispatches structured, privacy-preserving events for product views, sample previews,
 * checkout interactions, and successful acquisitions.
 * Strictly avoids capturing Personally Identifiable Information (PII) or payment tokens.
 */

export type AnalyticsEventName =
  | "monograph_view"
  | "sample_reader_opened"
  | "checkout_initiated"
  | "checkout_completed"
  | "newsletter_subscribed"
  | "catalog_filter_applied";

export interface MonographViewPayload {
  bookId: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  currency: string;
}

export interface SampleReaderPayload {
  bookId: string;
  slug: string;
  title: string;
}

export interface CheckoutInitiatedPayload {
  bookId: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  channel: "razorpay" | "gumroad";
}

export interface CheckoutCompletedPayload {
  orderId: string;
  bookId: string;
  amount: number;
  currency: string;
}

export interface NewsletterSubscribedPayload {
  frequency: string;
}

export interface CatalogFilterPayload {
  category?: string;
  searchQuery?: string;
  sortBy?: string;
}

export type AnalyticsPayloadMap = {
  monograph_view: MonographViewPayload;
  sample_reader_opened: SampleReaderPayload;
  checkout_initiated: CheckoutInitiatedPayload;
  checkout_completed: CheckoutCompletedPayload;
  newsletter_subscribed: NewsletterSubscribedPayload;
  catalog_filter_applied: CatalogFilterPayload;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  payload: AnalyticsPayloadMap[T]
): void {
  if (typeof window === "undefined") return;

  const eventData: Record<string, unknown> = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...(payload as unknown as Record<string, unknown>),
  };

  // 1. Dispatch custom DOM event for lightweight client-side subscribers
  try {
    const customEvent = new CustomEvent("meridian:analytics", { detail: eventData });
    window.dispatchEvent(customEvent);
  } catch {
    // Ignore DOM event dispatch errors in edge environments
  }

  // 2. Integration with window.dataLayer for Google Tag Manager / GA4 if mounted
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventData);
  }

  // 3. Structured development console logging
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Telemetry · ${eventName}]`, eventData);
  }
}
