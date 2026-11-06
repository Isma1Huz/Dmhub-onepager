"use client";
import type { AddonSelection } from "./pricing";

export type BriefState = {
  businessName: string;
  trade: string;
  contactName: string;
  email: string;
  phone: string;
  town: string;
  serviceArea: string;
  services: string[];
  description: string;
  primaryAction: string;
  existingSite: string;
  reviews: string;
  differentiators: string;
  needHelp: boolean;
  layout: string;
  colours: string;
  websiteLanguage: "nl" | "en";
  domainStatus: string;
  addons: AddonSelection;
  acknowledged: boolean;
  marketingOptIn: boolean;
  company_website: string; // honeypot
};

export const defaults = (lang: "nl" | "en"): BriefState => ({
  businessName: "", trade: "", contactName: "", email: "", phone: "", town: "", serviceArea: "",
  services: ["", "", ""], description: "", primaryAction: "quote",
  existingSite: "", reviews: "", differentiators: "", needHelp: false,
  layout: "notSure", colours: "notSure", websiteLanguage: lang, domainStatus: "notSure",
  addons: { extraPages: 0, mailboxes: 0, scheduler: false, secondLanguage: false, gallery: false },
  acknowledged: false, marketingOptIn: false, company_website: "",
});

const KEY = "dmhub-onepage-brief-v1";
export const REF_KEY = "dmhub-onepage-ref";

type Stored = { answers: BriefState; step: number; key: string };

export function load(): Stored | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}
export function save(s: Stored) {
  try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
}
export function clear() {
  try { sessionStorage.removeItem(KEY); } catch { /* noop */ }
}
export const newKey = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/**
 * Files cannot go in sessionStorage. A module-level store survives client-side
 * navigation (e.g. switching NL/EN) so uploads are not lost when the language changes.
 */
let files: File[] = [];
export const fileStore = {
  get: () => files,
  set: (f: File[]) => { files = f; },
  clear: () => { files = []; },
};
