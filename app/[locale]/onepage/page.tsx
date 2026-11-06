import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { buildMetadata } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Examples, Included, Process, Pricing, Addons, About, Faq, FinalCta } from "@/components/Sections";
import { Footer } from "@/components/Footer";
import { StickyCta } from "@/components/StickyCta";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return buildMetadata({ locale, page: "landing", title: t.meta.title, description: t.meta.description });
}

export default async function Landing({ params }: P) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <>
      <Header locale={locale} />
      <main id="main">
        <Hero locale={locale} t={t} />
        <Examples locale={locale} t={t} />
        <Included t={t} />
        <Process t={t} />
        <Pricing locale={locale} t={t} />
        <Addons locale={locale} t={t} />
        <About t={t} />
        <Faq t={t} />
        <FinalCta locale={locale} t={t} />
      </main>
      <Footer locale={locale} t={t} />
      <StickyCta locale={locale} t={t} />
    </>
  );
}
