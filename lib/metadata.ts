import type { Metadata } from "next";
import { LOCALES, SITE, type Locale } from "./config";
import { path, type PageKey } from "./routes";

export function buildMetadata(opts: {
  locale: Locale;
  page: PageKey;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  const url = (l: Locale) => `${SITE.baseUrl}${path(l, opts.page)}`;
  return {
    metadataBase: new URL(SITE.baseUrl),
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url(opts.locale),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, url(l)])), "x-default": url("nl") },
    },
    robots: opts.index === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title: opts.title, description: opts.description, url: url(opts.locale), siteName: "DM Hub", locale: opts.locale === "nl" ? "nl_NL" : "en_IE", type: "website" },
  };
}
