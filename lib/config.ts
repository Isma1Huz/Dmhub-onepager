export const LOCALES = ["nl", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/**
 * DRAFT commercial values (minor units, EUR, excl. VAT).
 * Must be approved by the business before public launch (brief §13).
 */
export const PRICING = {
  version: "2026-11-draft-1",
  currency: "EUR",
  setup: 69500,
  monthly: 3900,
  addons: {
    extraPage: { setup: 12500, max: 3 },
    mailbox: { setup: 2500, monthly: 700, max: 5 },
    scheduler: { setup: 14900 },
    secondLanguage: { setup: 19500 },
    gallery: { setup: 7500 },
    extraWork: { perBlock: 3500 },
  },
} as const;

export const firstYearTotal = () => PRICING.setup + PRICING.monthly * 12;

export const SITE = {
  name: "DM Hub",
  email: "hallo@dmhub.dev",
  url: "https://www.dmhub.dev",
  // Replace with the approved agency privacy / terms pages.
  privacyUrl: "https://www.dmhub.dev/privacy",
  termsUrl: "https://www.dmhub.dev/terms",
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "mailto:hallo@dmhub.dev?subject=Kennismaking%20DM%20Hub%20Onepage",
};

export const TRADES = ["painter", "gardener", "cleaner", "electrician", "handyman", "consultant", "other"] as const;
export type Trade = (typeof TRADES)[number];
export const DEMO_TRADES = ["painter", "gardener", "cleaner"] as const;
export type DemoTrade = (typeof DEMO_TRADES)[number];

export const UPLOAD = {
  maxFiles: 10,
  maxBytes: 10 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;
