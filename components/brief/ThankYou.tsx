"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SITE, type Locale } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { path } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { REF_KEY } from "@/lib/brief-store";
import { Logo } from "../Logo";
import { LangSwitchClient } from "../LangSwitchClient";

/** The reference comes from sessionStorage, never from the URL (no personal data in the address bar). */
export function ThankYou({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const d = t.done;
  const [ref, setRef] = useState<string | null>(null);
  useEffect(() => {
    try { setRef(sessionStorage.getItem(REF_KEY)); } catch { /* noop */ }
  }, []);
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="container-x flex h-[72px] items-center justify-between">
          <Logo locale={locale} />
          <LangSwitchClient locale={locale} label={t.nav.language} page="done" />
        </div>
      </header>
      <main id="main" className="container-x py-14 md:py-20">
        <div className="card mx-auto max-w-2xl p-7 text-center md:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-success"><CheckCircle2 size={36} aria-hidden /></span>
          <h1 className="mt-5 text-[30px] font-extrabold leading-tight tracking-tight md:text-[38px]">{d.heading}</h1>
          <p className="mt-3 text-[17px] text-muted">{d.text}</p>
          {ref ? (
            <p className="mt-5 inline-block rounded-lg bg-tint px-4 py-2 text-[14px]">{d.reference}: <b className="font-mono">{ref}</b></p>
          ) : null}
          <div className="mt-7">
            <a href={SITE.bookingUrl} onClick={() => track("booking_click", { locale })} className="btn-primary px-7 py-4 text-[16px]">
              {d.cta} <ArrowRight size={18} aria-hidden />
            </a>
          </div>
          <div className="mt-10 border-t border-line pt-6 text-left">
            <h2 className="text-[16px] font-bold">{d.next}</h2>
            <ol className="mt-3 space-y-2.5 text-[14.5px] text-muted">
              {d.steps.map((s, i) => (
                <li key={s} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[12px] font-bold text-white">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
          <Link href={path(locale)} className="mt-8 inline-block text-[14px] font-semibold text-brand-600 hover:underline">{d.back}</Link>
        </div>
      </main>
    </div>
  );
}
