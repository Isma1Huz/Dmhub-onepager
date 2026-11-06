import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE, type Locale } from "@/lib/config";
import type { Dict } from "@/lib/dictionaries";
import { Logo } from "./Logo";
import { LangSwitchClient } from "./LangSwitchClient";

export function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <footer className="border-t border-line bg-white pb-24 md:pb-0">
      <div className="container-x flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <Logo locale={locale} tagline={t.footer.tagline} />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink">
          {t.nav.items.map((i) => (
            <Link key={i.id} href={`/${locale}/onepage#${i.id}`} className="hover:text-brand">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-5 text-[14px]">
          <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 text-ink hover:text-brand">
            <Mail size={16} className="text-brand" aria-hidden /> {SITE.email}
          </a>
          <LangSwitchClient locale={locale} label={t.footer.languageLinks} />
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line py-5 text-[13px] text-muted md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} DM Hub. {t.footer.rights}
        </p>
        <p className="flex gap-5">
          <a href={SITE.privacyUrl} className="hover:text-ink">{t.footer.privacy}</a>
          <a href={SITE.termsUrl} className="hover:text-ink">{t.footer.terms}</a>
        </p>
      </div>
    </footer>
  );
}
