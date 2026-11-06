import { z } from "zod";
import { TRADES } from "./config";

export type BriefMessages = { required: string; email: string; descShort: string; ack: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Shared by the browser (step validation) and the server (authoritative validation). */
export function briefSchema(m: BriefMessages) {
  return z.object({
    // Step 1
    businessName: z.string().trim().min(2, m.required).max(120),
    trade: z.enum(TRADES, { error: m.required }),
    contactName: z.string().trim().min(2, m.required).max(120),
    email: z.string().trim().max(200).regex(EMAIL, m.email),
    phone: z.string().trim().max(40),
    town: z.string().trim().max(100),
    serviceArea: z.string().trim().max(200),
    // Step 2
    services: z.array(z.string().trim().max(80)).max(5),
    description: z.string().trim().min(10, m.descShort).max(1500),
    primaryAction: z.enum(["quote", "call", "whatsapp", "email", "notSure"]),
    // Step 3
    existingSite: z.string().trim().max(200),
    reviews: z.string().trim().max(2000),
    differentiators: z.string().trim().max(1000),
    needHelp: z.boolean(),
    // Step 4
    layout: z.enum(["painter", "gardener", "cleaner", "notSure"]),
    colours: z.enum(["blue", "green", "orange", "dark", "notSure"]),
    websiteLanguage: z.enum(["nl", "en"], { error: m.required }),
    domainStatus: z.enum(["have", "need", "notSure"]),
    addons: z.object({
      extraPages: z.number().int().min(0).max(3),
      mailboxes: z.number().int().min(0).max(5),
      scheduler: z.boolean(),
      secondLanguage: z.boolean(),
      gallery: z.boolean(),
    }),
    // Step 5
    acknowledged: z.literal(true, { error: m.ack }),
    marketingOptIn: z.boolean(),
  });
}

export const STEP_FIELDS: string[][] = [
  ["businessName", "trade", "contactName", "email", "phone", "town", "serviceArea"],
  ["services", "description", "primaryAction"],
  ["existingSite", "reviews", "differentiators"],
  ["layout", "colours", "websiteLanguage", "domainStatus"],
  ["acknowledged"],
];

/** Server wrapper adds non-form fields. */
export const envelopeSchema = z.object({
  interfaceLocale: z.enum(["nl", "en"]),
  idempotencyKey: z.string().min(8).max(80).regex(/^[A-Za-z0-9-]+$/),
  company_website: z.string().max(200).optional(), // honeypot
});
