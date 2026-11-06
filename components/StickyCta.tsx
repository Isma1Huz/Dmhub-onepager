import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRICING, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/dictionaries";
import { money } from "@/lib/format";
import { path } from "@/lib/routes";

/** Mobile-only bar. Shows setup AND monthly amounts. Not rendered on the brief page. */
export function StickyCta({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-2xl md:hidden">
      <p className="text-[15px] font-bold leading-tight">
        {money(PRICING.setup, locale)}{" "}
        <span className="text-[13px] font-semibold text-white/85">
          + {money(PRICING.monthly, locale)}
          {t.hero.perMonth}
        </span>
      </p>
      <Link href={path(locale, "start")} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[14px] font-semibold text-white">
        {t.sticky.cta} <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  );
}
