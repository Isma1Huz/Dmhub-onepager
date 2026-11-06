"use client";
import Link from "next/link";
import { LOCALES, type Locale } from "@/lib/config";
import { path, type PageKey } from "@/lib/routes";

export function LangSwitchClient({ locale, label, page = "landing" }: { locale: Locale; label: string; page?: PageKey }) {
  return (
    <nav aria-label={label} className="flex items-center text-[14px] font-semibold">
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 ? <span aria-hidden className="mx-2 h-4 w-px bg-line" /> : null}
          <Link
            href={path(l, page)}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={l === locale ? "text-brand" : "text-muted hover:text-ink"}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  );
}
