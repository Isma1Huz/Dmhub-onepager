import { PRICING } from "./config";

export type AddonSelection = {
  extraPages: number;
  mailboxes: number;
  scheduler: boolean;
  secondLanguage: boolean;
  gallery: boolean;
};

const clamp = (n: unknown, max: number) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) ? Math.min(Math.max(v, 0), max) : 0;
};

export function normaliseAddons(a: Partial<AddonSelection> | undefined): AddonSelection {
  return {
    extraPages: clamp(a?.extraPages, PRICING.addons.extraPage.max),
    mailboxes: clamp(a?.mailboxes, PRICING.addons.mailbox.max),
    scheduler: !!a?.scheduler,
    secondLanguage: !!a?.secondLanguage,
    gallery: !!a?.gallery,
  };
}

export type PriceSnapshot = {
  pricingVersion: string;
  currency: "EUR";
  setupBase: number;
  monthlyBase: number;
  lines: { id: string; qty: number; setup: number; monthly: number }[];
  setupTotal: number;
  monthlyTotal: number;
  providerCostsTbc: string[];
  vatIncluded: false;
};

/** Single source of truth used by the browser summary AND the server. */
export function computePrice(input: Partial<AddonSelection> | undefined): PriceSnapshot {
  const a = normaliseAddons(input);
  const A = PRICING.addons;
  const lines: PriceSnapshot["lines"] = [];
  if (a.extraPages) lines.push({ id: "extraPage", qty: a.extraPages, setup: a.extraPages * A.extraPage.setup, monthly: 0 });
  if (a.mailboxes)
    lines.push({ id: "mailbox", qty: a.mailboxes, setup: a.mailboxes * A.mailbox.setup, monthly: a.mailboxes * A.mailbox.monthly });
  if (a.scheduler) lines.push({ id: "scheduler", qty: 1, setup: A.scheduler.setup, monthly: 0 });
  if (a.secondLanguage) lines.push({ id: "secondLanguage", qty: 1, setup: A.secondLanguage.setup, monthly: 0 });
  if (a.gallery) lines.push({ id: "gallery", qty: 1, setup: A.gallery.setup, monthly: 0 });
  return {
    pricingVersion: PRICING.version,
    currency: "EUR",
    setupBase: PRICING.setup,
    monthlyBase: PRICING.monthly,
    lines,
    setupTotal: PRICING.setup + lines.reduce((s, l) => s + l.setup, 0),
    monthlyTotal: PRICING.monthly + lines.reduce((s, l) => s + l.monthly, 0),
    providerCostsTbc: a.scheduler ? ["scheduler"] : [],
    vatIncluded: false,
  };
}
