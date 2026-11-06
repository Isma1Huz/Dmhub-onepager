import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ArrowRight, Info } from "lucide-react";
import { DEMO_TRADES, LOCALES, isLocale, type DemoTrade } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { buildMetadata } from "@/lib/metadata";
import { path } from "@/lib/routes";
import { LangSwitchClient } from "@/components/LangSwitchClient";

type P = { params: Promise<{ locale: string; trade: string }> };
const isTrade = (v: string): v is DemoTrade => (DEMO_TRADES as readonly string[]).includes(v);

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => DEMO_TRADES.map((trade) => ({ locale, trade })));
}
export const dynamicParams = false;

const skin = {
  painter: { img: "/images/trade-painter.jpg", accent: "bg-ink", text: "text-ink", soft: "bg-slate-50", pos: "object-[70%_30%]" },
  gardener: { img: "/images/trade-gardener.jpg", accent: "bg-[#166534]", text: "text-[#166534]", soft: "bg-green-50", pos: "object-center" },
  cleaner: { img: "/images/trade-cleaner.jpg", accent: "bg-brand", text: "text-brand", soft: "bg-tint", pos: "object-[50%_20%]" },
} as const;

export async function generateMetadata({ params }: P) {
  const { locale, trade } = await params;
  if (!isLocale(locale) || !isTrade(trade)) return {};
  const t = getDict(locale);
  // Demos are examples, not real businesses: keep them out of the index.
  return { ...buildMetadata({ locale, page: "landing", title: `${t.examples.cards[trade].name} — ${t.meta.demoTitle}`, description: t.demo.banner, index: false }) };
}

export default async function Demo({ params }: P) {
  const { locale, trade } = await params;
  if (!isLocale(locale) || !isTrade(trade)) notFound();
  const t = getDict(locale);
  const c = t.examples.cards[trade];
  const d = t.demo.trades[trade];
  const s = skin[trade];
  const mono = trade === "gardener";
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-40 bg-ink px-4 py-2.5 text-[13px] text-white">
        <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-1 !px-0">
          <p className="flex items-center gap-2"><Info size={15} aria-hidden /> {t.demo.banner}</p>
          <div className="flex items-center gap-5">
            <Link href={path(locale)} className="underline-offset-2 hover:underline">{t.demo.back}</Link>
            <div className="[&_a]:!text-white/70 [&_a[aria-current]]:!text-white"><LangSwitchClient locale={locale} label={t.nav.language} page="landing" /></div>
          </div>
        </div>
      </div>

      <header className="border-b border-line">
        <div className="container-x flex h-16 items-center justify-between">
          <span className={`font-display text-[20px] font-extrabold tracking-tight ${s.text}`}>{c.logo}</span>
          <nav className="hidden gap-6 text-[14px] md:flex" aria-label="Demo">
            <a href="#diensten">{t.demo.servicesTitle}</a><a href="#over">{t.demo.aboutTitle}</a><a href="#werk">{t.demo.workTitle}</a><a href="#contact">Contact</a>
          </nav>
          <a href="#contact" className={`rounded-lg px-4 py-2 text-[14px] font-semibold text-white ${s.accent}`}>{c.primary}</a>
        </div>
      </header>

      <section className={`relative overflow-hidden ${mono ? "min-h-[460px]" : s.soft}`}>
        {mono ? (
          <>
            <Image src={s.img} alt="" fill priority sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          </>
        ) : null}
        <div className={`container-x relative grid items-center gap-8 py-12 md:py-20 ${mono ? "" : "md:grid-cols-2"}`}>
          <div className={mono ? "max-w-xl text-white" : ""}>
            <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${mono ? "text-white/80" : s.text}`}>{d.tagline}</p>
            <h1 className="mt-3 text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">{c.headline}</h1>
            <p className={`mt-4 max-w-lg text-[17px] leading-relaxed ${mono ? "text-white/90" : "text-muted"}`}>{c.sub}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#contact" className={`btn ${mono ? "bg-white !text-ink" : `${s.accent} text-white`}`}>{c.primary} <ArrowRight size={16} aria-hidden /></a>
              <a href="#diensten" className="btn border border-line bg-white text-ink">{c.secondary}</a>
            </div>
          </div>
          {mono ? null : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-pop">
              <Image src={s.img} alt="" fill priority sizes="(min-width:768px) 50vw, 100vw" className={`object-cover ${s.pos}`} />
            </div>
          )}
        </div>
      </section>

      <section id="diensten" className="container-x py-14">
        <h2 className="h2">{t.demo.servicesTitle}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.services.map((x) => (
            <li key={x.t} className="card p-5">
              <h3 className="text-[16px] font-semibold">{x.t}</h3>
              <p className="mt-1.5 text-[14px] text-muted">{x.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="over" className={`${s.soft} py-14`}>
        <div className="container-x grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 className="h2">{t.demo.aboutTitle}</h2>
          <p className="lead">{d.about}</p>
        </div>
      </section>

      <section id="werk" className="container-x py-14">
        <h2 className="h2">{t.demo.workTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-line bg-canvas text-center text-[13px] text-muted">
              {t.demo.workNote}
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className={`${s.soft} py-14`}>
        <div className="container-x grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="h2">{t.demo.contactTitle}</h2>
            <p className="mt-4 flex items-center gap-2 text-muted"><Phone size={16} aria-hidden /> 06 00 00 00 00 (demo)</p>
          </div>
          <form onSubmit={undefined} className="card space-y-3 p-5" aria-label={t.demo.contactTitle}>
            <fieldset disabled className="space-y-3">
              <label className="block text-[14px] font-medium">{t.demo.name}<input className="field mt-1" /></label>
              <label className="block text-[14px] font-medium">{t.demo.phone}<input className="field mt-1" /></label>
              <label className="block text-[14px] font-medium">{t.demo.message}<textarea rows={3} className="field mt-1" /></label>
              <button type="button" className={`btn w-full cursor-not-allowed opacity-60 ${s.accent} text-white`}>{t.demo.send}</button>
            </fieldset>
          </form>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center">
        <Link href={path(locale, "start")} className="btn-primary">{t.demo.cta} <ArrowRight size={16} aria-hidden /></Link>
      </footer>
    </div>
  );
}
