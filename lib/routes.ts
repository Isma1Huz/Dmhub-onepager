import type { Locale } from "./config";

export type PageKey = "landing" | "start" | "done";
export const doneSlug = (l: Locale) => (l === "nl" ? "bedankt" : "thank-you");

export function path(locale: Locale, page: PageKey = "landing", hash = ""): string {
  const base = `/${locale}/onepage`;
  if (page === "start") return `${base}/start`;
  if (page === "done") return `${base}/${doneSlug(locale)}`;
  return base + hash;
}
export const demoPath = (locale: Locale, trade: string) => `/${locale}/onepage/demo/${trade}`;
