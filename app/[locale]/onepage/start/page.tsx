import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { buildMetadata } from "@/lib/metadata";
import { BriefForm } from "@/components/brief/BriefForm";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return buildMetadata({ locale, page: "start", title: t.meta.startTitle, description: t.meta.description, index: false });
}

export default async function Start({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <BriefForm locale={locale} />;
}
