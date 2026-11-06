"use client";
/**
 * Privacy-safe conversion events. NEVER pass names, emails, form text or files.
 * Plug in the agency's approved analytics (e.g. Plausible) by defining window.plausible.
 */
type EventName = "cta_click" | "brief_start" | "brief_complete" | "booking_click";
export function track(event: EventName, props: { locale: string; where?: string }) {
  try {
    const w = window as unknown as { plausible?: (e: string, o?: { props: Record<string, string> }) => void };
    w.plausible?.(event, { props: { locale: props.locale, ...(props.where ? { where: props.where } : {}) } });
  } catch {
    /* analytics must never break the page */
  }
}
