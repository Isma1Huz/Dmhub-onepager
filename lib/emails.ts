import type { Locale } from "./config";
import { SITE } from "./config";
import { money } from "./format";
import type { PriceSnapshot } from "./pricing";
import { getDict } from "./dictionaries";

type BriefLike = {
  reference: string;
  interfaceLocale: Locale;
  answers: { businessName: string; contactName: string; email: string; trade: string; description: string; websiteLanguage: string };
  price: PriceSnapshot;
};

export function customerEmail(b: BriefLike) {
  const l = b.interfaceLocale;
  const t = getDict(l);
  const nl = l === "nl";
  const extras = b.price.lines.map((x) => `- ${t.addons.items[x.id as keyof typeof t.addons.items].title} × ${x.qty}`).join("\n") || "-";
  const subject = nl ? "We hebben je websiteaanvraag ontvangen" : "We have received your website brief";
  const text = [
    nl ? `Hallo ${b.answers.contactName},` : `Hello ${b.answers.contactName},`,
    "",
    nl ? "Bedankt voor je aanvraag voor DM Hub Onepage." : "Thank you for your DM Hub Onepage brief.",
    `${nl ? "Referentie" : "Reference"}: ${b.reference}`,
    "",
    `${nl ? "Bedrijf" : "Business"}: ${b.answers.businessName}`,
    `${nl ? "Taal van de website" : "Website language"}: ${b.answers.websiteLanguage.toUpperCase()}`,
    `${nl ? "Gekozen extra's" : "Selected extras"}:\n${extras}`,
    "",
    `${nl ? "Indicatief eenmalig" : "Indicative one-off"}: ${money(b.price.setupTotal, l)}`,
    `${nl ? "Indicatief per maand" : "Indicative monthly"}: ${money(b.price.monthlyTotal, l)}`,
    b.price.providerCostsTbc.length ? (nl ? "Afspraakplanner: abonnement van de aanbieder nader te bevestigen." : "Appointment scheduler: provider subscription to be confirmed.") : "",
    nl ? "Prijzen exclusief btw. Definitieve scope en prijs bevestigen we tijdens de kennismaking." : "Prices exclude VAT. We confirm the final scope and price during the discovery call.",
    "",
    `${t.done.cta}: ${SITE.bookingUrl}`,
    `${nl ? "Vragen?" : "Questions?"} ${SITE.email}`,
  ].filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n");
  return { to: b.answers.email, subject, text };
}

export function internalEmail(b: BriefLike) {
  return {
    to: process.env.BRIEF_NOTIFY_TO ?? SITE.email,
    subject: `Nieuwe Onepage-aanvraag ${b.reference} — ${b.answers.businessName}`,
    // No private uploads or full answers in a broadly distributed email: reference only.
    text: [
      `Reference: ${b.reference}`,
      `Business: ${b.answers.businessName} (${b.answers.trade})`,
      `Locale: ${b.interfaceLocale} · website language: ${b.answers.websiteLanguage}`,
      `Indicative: ${money(b.price.setupTotal, "en")} + ${money(b.price.monthlyTotal, "en")}/month`,
      "Open the protected record in the project workflow (.data/briefs/<reference>.json).",
    ].join("\n"),
  };
}
