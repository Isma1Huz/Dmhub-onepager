import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { doneSlug } from "@/lib/routes";
import { buildMetadata } from "@/lib/metadata";
import { ThankYou } from "@/components/brief/ThankYou";

type P = { params: Promise<{ locale: string; done: string }> };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale, done: doneSlug(locale) }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: P) {
  const { locale, done } = await params;
  if (!isLocale(locale) || done !== doneSlug(locale)) return {};
  const t = getDict(locale);
  return buildMetadata({ locale, page: "done", title: t.meta.doneTitle, description: t.meta.description, index: false });
}

export default async function Done({ params }: P) {
  const { locale, done } = await params;
  if (!isLocale(locale) || done !== doneSlug(locale)) notFound();
  return <ThankYou locale={locale} />;
}
