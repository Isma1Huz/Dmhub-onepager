"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

export function CtaLink({
  locale,
  where,
  href,
  className,
  children,
}: {
  locale: string;
  where: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track("cta_click", { locale, where })}>
      {children}
    </Link>
  );
}
