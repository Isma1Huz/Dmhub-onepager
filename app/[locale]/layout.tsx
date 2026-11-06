import type { Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource-variable/inter";
import "@fontsource/caveat/500.css";
import "../globals.css";
import { LOCALES, isLocale } from "@/lib/config";

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
