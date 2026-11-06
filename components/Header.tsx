"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import type { Locale } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { path } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { Logo } from "./Logo";
import { LangSwitchClient } from "./LangSwitchClient";

export function Header({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [open, setOpen] = useState(false);
  const cta = (
    <Link
      href={path(locale, "start")}
      onClick={() => track("cta_click", { locale, where: "header" })}
      className="btn-primary whitespace-nowrap !rounded-full !px-5 !py-2.5 text-[14px]"
    >
      {t.nav.cta} <ArrowRight size={16} aria-hidden />
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        {t.nav.skip}
      </a>
      <div className="container-x flex h-16 items-center justify-between gap-6 md:h-[72px]">
        <Logo locale={locale} />
        <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-7 whitespace-nowrap text-[14px] font-medium text-ink xl:flex">
          {t.nav.items.map((i) => (
            <a key={i.id} href={`#${i.id}`} className="hover:text-brand">
              {i.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <LangSwitchClient locale={locale} label={t.nav.language} />
          </div>
          <div className="hidden md:block">{cta}</div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.menu}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-white xl:hidden">
          <nav className="container-x flex flex-col py-3" aria-label="Menu">
            {t.nav.items.map((i) => (
              <a key={i.id} href={`#${i.id}`} onClick={() => setOpen(false)} className="border-b border-line/60 py-3.5 text-[16px] font-medium">
                {i.label}
              </a>
            ))}
            <div className="flex items-center justify-between py-4">
              <LangSwitchClient locale={locale} label={t.nav.language} />
              {cta}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
