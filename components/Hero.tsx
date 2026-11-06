import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Coins } from "lucide-react";
import type { Locale } from "@/lib/config";
import { PRICING } from "@/lib/config";
import type { Dict } from "@/lib/dictionaries";
import { money } from "@/lib/format";
import { path } from "@/lib/routes";
import { CtaLink } from "./CtaLink";

export function Hero({ locale, t }: { locale: Locale; t: Dict }) {
  const h = t.hero;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-canvas">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-24 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(0,102,255,0.10),transparent_65%)]" />
      <div className="container-x relative grid items-center gap-8 pb-10 pt-8 md:pt-12 lg:grid-cols-[1.3fr_1fr] lg:gap-2 lg:pb-14 lg:pt-14">
        <div>
          <span className="pill">
            <span aria-hidden className="h-2 w-2 rounded-full bg-brand" />
            {h.badge}
          </span>
          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.15] tracking-[-0.025em] text-ink md:text-[48px] lg:text-[46px] xl:text-[52px]">
            <span className="block">{h.title1}</span>
            <span className="block">
              {h.title1b}<br className={h.accentBreak ? "" : "sm:hidden"} /> <span className="text-brand">{h.title2}</span>
            </span>
          </h1>
          <p className="mt-5 max-w-[34rem] text-[16px] leading-[1.6] text-muted md:text-[18px]">{h.desc}</p>

          <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-tint-2/70 px-4 py-3 text-ink">
            <Coins size={22} className="text-brand" aria-hidden />
            <span className="text-[22px] font-bold tracking-tight">{money(PRICING.setup, locale)}</span>
            <span className="text-[15px] md:text-[16px]">
              {h.oneOff} + {money(PRICING.monthly, locale)}
              {h.perMonth} <span className="hidden sm:inline">{h.priceSuffix}</span>
            </span>
          </div>
          <p className="mt-2 text-[12px] text-muted">{h.tax}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaLink locale={locale} where="hero" href={path(locale, "start")} className="btn-primary px-7 py-4 text-[16px]">
              {h.cta} <ArrowRight size={18} aria-hidden />
            </CtaLink>
            <Link href="#examples" className="btn-ghost px-7 py-4 text-[16px]">
              {h.secondary}
            </Link>
          </div>
          <ul className="mt-6 flex flex-col gap-2 text-[14px] text-ink sm:flex-row sm:flex-wrap sm:gap-x-5">
            {h.chips.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand" aria-hidden /> {c}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] font-medium text-ink">{h.reassurance}</p>
        </div>

        <div className="relative mx-auto w-full max-w-[640px] lg:max-w-none">
          <Image
            src="/images/hero-laptop.png"
            alt={h.mockAlt}
            width={780}
            height={790}
            priority
            sizes="(min-width:1024px) 640px, 90vw"
            className="mx-auto h-auto w-full max-w-[600px] fade-edges lg:max-w-[620px]"
          />
          <p className="hand absolute right-2 top-2 hidden max-w-[11rem] text-right text-[22px] leading-[1.1] text-ink 2xl:block">
            {h.hand}
          </p>
          <ul className="absolute -right-28 bottom-28 hidden w-[200px] space-y-2.5 rounded-xl bg-white/95 p-4 text-[13px] text-ink shadow-pop 2xl:block" aria-label="Highlights">
            {h.floatChecks.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <Check size={15} className="text-success" aria-hidden /> {c}
              </li>
            ))}
          </ul>
          <p className="hand mt-1 text-center text-[20px] text-ink/80">{h.mockCaption}</p>
        </div>
      </div>
      <div className="border-t border-line bg-white">
        <div className="container-x grid gap-4 py-5 sm:grid-cols-3">
          {t.stats.map((s) => (
            <div key={s.value} className="flex items-baseline gap-3">
              <span className="font-display text-[22px] font-bold text-ink">{s.value}</span>
              <span className="text-[14px] text-muted">{s.label}</span>
            </div>
          ))}
        </div>
        <p className="container-x pb-4 text-[12px] text-muted">{h.delivery}</p>
      </div>
    </section>
  );
}
