import type { Locale } from "./config";

/** Whole-euro amounts render like the design: €695, €1.163 (nl) / €1,163 (en). */
export function money(cents: number, locale: Locale): string {
  const whole = cents % 100 === 0;
  const s = new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
  return s.replace(/ /g, "").replace(/\s/g, "");
}
