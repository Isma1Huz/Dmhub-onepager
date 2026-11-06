import Link from "next/link";
import {
  ArrowRight, Calendar, CheckCircle2, ChevronDown, Cloud, FileText, Globe, Image as ImageIcon, LayoutGrid,
  Mail, Monitor, PenLine, Smartphone, Wrench, Check,
} from "lucide-react";
import { DEMO_TRADES, PRICING, SITE, firstYearTotal, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/dictionaries";
import { money } from "@/lib/format";
import { demoPath, path } from "@/lib/routes";
import { CtaLink } from "./CtaLink";
import { DemoMock } from "./DemoMock";

/* ───────── Examples ───────── */
export function Examples({ locale, t }: { locale: Locale; t: Dict }) {
  const e = t.examples;
  return (
    <section id="examples" className="bg-tint py-14 md:py-16">
      <div className="container-x">
        <p className="eyebrow">{e.eyebrow}</p>
        <h2 className="h2 mt-2">{e.heading}</h2>
        <p className="lead mt-3">{e.sub}</p>
        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {DEMO_TRADES.map((trade) => {
            const c = e.cards[trade];
            return (
              <li key={trade} className="card relative w-[82%] shrink-0 snap-center p-3 sm:w-[60%] md:w-auto">
                <DemoMock trade={trade} t={t} />
                <div className="px-1 pb-1 pt-4">
                  <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[12px] font-medium text-sky-700">{e.demoLabel}</span>
                  <h3 className="mt-2 text-[18px] font-bold">{c.name}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{c.desc}</p>
                  <Link href={demoPath(locale, trade)} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:underline">
                    {e.viewDemo} <ArrowRight size={15} aria-hidden />
                    <span className="sr-only"> — {c.name}</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[13px] text-muted">{e.note}</p>
      </div>
    </section>
  );
}

/* ───────── Included ───────── */
const benefitIcons = [Monitor, Smartphone, LayoutGrid, Mail, PenLine, Cloud];
export function Included({ t }: { t: Dict }) {
  const s = t.included;
  return (
    <section id="included" className="py-14 md:py-16">
      <div className="container-x">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 className="h2 mt-2 max-w-3xl">{s.heading}</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.benefits.map((b, i) => {
            const I = benefitIcons[i];
            return (
              <li key={b.title} className="card flex items-start gap-4 p-5">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-tint-2 text-brand">
                  <I size={26} strokeWidth={1.6} aria-hidden />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold leading-snug">{b.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{b.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 rounded-2xl border border-line bg-white p-5 md:p-6">
          <h3 className="text-[16px] font-semibold">{s.scopeTitle}</h3>
          <ul className="mt-4 grid gap-x-8 gap-y-2.5 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
            {s.scope.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden /> {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ───────── Process ───────── */
export function Process({ t }: { t: Dict }) {
  const p = t.process;
  return (
    <section id="process" className="py-14 md:py-16">
      <div className="container-x">
        <p className="eyebrow">{p.eyebrow}</p>
        <h2 className="h2 mt-2">{p.heading}</h2>
        <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-brand/25 md:block" />
          <span aria-hidden className="absolute bottom-6 left-5 top-6 w-px bg-brand/25 md:hidden" />
          {p.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-[16px] font-bold text-white ring-4 ring-canvas">
                {i + 1}
              </span>
              <div>
                <h3 className="text-[17px] font-bold">{s.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">
                  <strong className="font-semibold text-ink">{s.lead}</strong> {s.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 flex items-start gap-2 rounded-xl bg-tint-2/70 p-4 text-[14px] text-ink md:mx-auto md:max-w-3xl">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          {t.hero.delivery.replace(/^\*\s*/, "")}
        </p>
      </div>
    </section>
  );
}

/* ───────── Pricing ───────── */
export function Pricing({ locale, t }: { locale: Locale; t: Dict }) {
  const p = t.pricing;
  return (
    <section id="pricing" className="px-0 py-4 md:px-4">
      <div className="mx-auto max-w-[1280px] bg-tint py-12 md:rounded-3xl md:py-14">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,460px)]">
          <div>
            <p className="eyebrow">{p.eyebrow}</p>
            <h2 className="h2 mt-2 max-w-md">{p.heading}</h2>
            <p className="lead mt-3">{p.sub}</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-[15px] font-semibold">{p.billingTitle}</h3>
                <ul className="mt-3 space-y-2 text-[14px] text-ink">
                  {p.billing.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold">{p.maintenanceTitle}</h3>
                <ul className="mt-3 space-y-2 text-[14px] text-ink">
                  {p.maintenance.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-[14px] leading-relaxed text-muted">{p.cancel}</p>
            <p className="hand mt-6 hidden text-[22px] leading-tight text-ink/80 lg:block">
              {p.hand[0]}
              <br />
              {p.hand[1]}
            </p>
          </div>

          <div className="relative rounded-2xl border border-line bg-white p-6 shadow-pop md:p-7">
            <span className="absolute -top-3 right-5 rounded-full bg-brand px-3.5 py-1 text-[12px] font-semibold text-white">{p.badge}</span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-muted">{p.packageName}</p>
            <p className="mt-2 font-display text-[56px] font-extrabold leading-none tracking-tight">{money(PRICING.setup, locale)}</p>
            <p className="mt-2 text-[18px] font-bold">
              {p.oneOffLabel} + {money(PRICING.monthly, locale)}
              {t.hero.perMonth}
            </p>
            <p className="text-[13px] text-muted">{p.monthlyLabel}</p>
            <ul className="mt-5 space-y-2.5 text-[14px]">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-tint px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold">{p.firstYear}</p>
                <p className="text-[12px] text-muted">{p.firstYearNote}</p>
              </div>
              <p className="font-display text-[22px] font-bold">{money(firstYearTotal(), locale)}</p>
            </div>
            <CtaLink locale={locale} where="pricing" href={path(locale, "start")} className="btn-primary mt-5 w-full">
              {p.cta} <ArrowRight size={18} aria-hidden />
            </CtaLink>
            <ul className="mt-4 flex flex-wrap justify-between gap-2 text-[12px] text-muted">
              {p.trust.map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check size={13} className="text-success" aria-hidden /> {x}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12px] text-muted">{p.tax}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Add-ons ───────── */
const addonIcons = { extraPage: FileText, mailbox: Mail, scheduler: Calendar, secondLanguage: Globe, gallery: ImageIcon, extraWork: Wrench } as const;
export function Addons({ locale, t }: { locale: Locale; t: Dict }) {
  const a = t.addons;
  const A = PRICING.addons;
  const rows: Record<keyof typeof addonIcons, { setup: string; monthly: string }> = {
    extraPage: { setup: `${money(A.extraPage.setup, locale)} ${a.perPage}`, monthly: a.included },
    mailbox: { setup: `${money(A.mailbox.setup, locale)} ${a.perMailbox}`, monthly: `${money(A.mailbox.monthly, locale)} ${a.perMailbox}` },
    scheduler: { setup: money(A.scheduler.setup, locale), monthly: a.providerTbc },
    secondLanguage: { setup: money(A.secondLanguage.setup, locale), monthly: a.included },
    gallery: { setup: money(A.gallery.setup, locale), monthly: a.included },
    extraWork: { setup: `${money(A.extraWork.perBlock, locale)} ${a.per30}`, monthly: a.none },
  };
  return (
    <section id="addons" className="py-14 md:py-16">
      <div className="container-x">
        <p className="eyebrow">{a.eyebrow}</p>
        <h2 className="h2 mt-2">{a.heading}</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(addonIcons) as (keyof typeof addonIcons)[]).map((id) => {
            const I = addonIcons[id];
            const item = a.items[id];
            return (
              <li key={id} className="card flex flex-col p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-tint-2 text-brand">
                    <I size={22} strokeWidth={1.6} aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-semibold">{item.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{item.text}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-1.5 border-t border-line pt-3 text-[14px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{a.setup}</dt>
                    <dd className="text-right font-bold">{rows[id].setup}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{a.monthly}</dt>
                    <dd className="text-right font-semibold">{rows[id].monthly}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[13px] text-muted">{a.note}</p>
      </div>
    </section>
  );
}

/* ───────── About ───────── */
export function About({ t }: { t: Dict }) {
  const a = t.about;
  return (
    <section id="about" className="py-4 md:py-8">
      <div className="container-x">
        <div className="card grid gap-4 p-6 md:grid-cols-[1fr_2fr] md:p-8">
          <div>
            <p className="eyebrow">{a.eyebrow}</p>
            <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-tight md:text-[28px]">{a.heading}</h2>
          </div>
          <div>
            <p className="lead">{a.text}</p>
            <a href={SITE.url} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:underline">
              {a.link} <ArrowRight size={15} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── FAQ ───────── */
export function Faq({ t }: { t: Dict }) {
  const f = t.faq;
  return (
    <section id="faq" className="py-14 md:py-16">
      <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">{f.eyebrow}</p>
          <h2 className="h2 mt-2">{f.heading}</h2>
        </div>
        <div className="space-y-2.5">
          {f.items.map((i) => (
            <details key={i.q} className="group card px-5 py-4 open:shadow-pop">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                {i.q}
                <ChevronDown size={18} className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{i.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Final CTA ───────── */
export function FinalCta({ locale, t }: { locale: Locale; t: Dict }) {
  const c = t.finalCta;
  return (
    <section className="px-4 pb-14 pt-2 md:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 rounded-3xl bg-brand p-7 text-white shadow-pop md:flex-row md:items-center md:p-10">
        <div>
          <h2 className="text-[24px] font-bold leading-tight tracking-tight md:text-[30px]">{c.heading}</h2>
          <p className="mt-2 text-[15px] text-white/90">{c.text}</p>
        </div>
        <CtaLink locale={locale} where="final" href={path(locale, "start")} className="btn !bg-white !text-brand-600 px-7 py-4 text-[16px] hover:!bg-tint md:shrink-0">
          {c.cta} <ArrowRight size={18} aria-hidden />
        </CtaLink>
      </div>
    </section>
  );
}
