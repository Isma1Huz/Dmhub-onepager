import Link from "next/link";
import type { Locale } from "@/lib/config";
import { path } from "@/lib/routes";

export function Logo({ locale, tagline, className = "" }: { locale: Locale; tagline?: string; className?: string }) {
  return (
    <Link href={path(locale)} aria-label="DM Hub Onepage" className={`inline-flex flex-col whitespace-nowrap leading-none ${className}`}>
      <span className="font-display text-[26px] font-extrabold tracking-[-0.04em]">
        <span className="text-brand">DM</span> <span className="text-ink">Hub</span>
        <span className="ml-1.5 text-[18px] font-semibold tracking-[-0.02em] text-brand/90">Onepage</span>
      </span>
      {tagline ? (
        <span className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-muted">{tagline}</span>
      ) : null}
    </Link>
  );
}
