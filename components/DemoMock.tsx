import Image from "next/image";
import { Handshake, Leaf, Paintbrush, ShieldCheck, Sprout, Scissors, LayoutGrid, Clock, Sparkles } from "lucide-react";
import type { DemoTrade } from "@/lib/config";
import type { Dict } from "@/lib/dictionaries";

const icons = {
  painter: [Paintbrush, ShieldCheck, Handshake],
  gardener: [Sprout, Scissors, LayoutGrid],
  cleaner: [ShieldCheck, Clock, Leaf],
} as const;

const theme = {
  painter: { btn: "bg-ink text-white", img: "/images/trade-painter.jpg", pos: "object-[70%_30%]", accent: "text-ink" },
  gardener: { btn: "bg-[#166534] text-white", img: "/images/trade-gardener.jpg", pos: "object-center", accent: "text-[#166534]" },
  cleaner: { btn: "bg-brand text-white", img: "/images/trade-cleaner.jpg", pos: "object-[50%_20%]", accent: "text-brand" },
} as const;

/** Visual-only miniature of a demo site (decorative). */
export function DemoMock({ trade, t }: { trade: DemoTrade; t: Dict }) {
  const c = t.examples.cards[trade];
  const th = theme[trade];
  const Icons = icons[trade];
  const dark = trade === "gardener";
  return (
    <div aria-hidden className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className={`flex items-center gap-1 whitespace-nowrap text-[8px] font-bold ${th.accent}`}>
          <Sparkles size={9} /> {c.logo}
        </span>
        <span className="hidden gap-2 whitespace-nowrap text-[6.5px] text-muted sm:flex">
          <span>Home</span><span>Diensten</span><span>Over ons</span><span>Contact</span>
        </span>
        <span className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[6.5px] font-semibold ${th.btn}`}>{c.primary}</span>
      </div>
      <div className="relative h-[168px] overflow-hidden">
        <div className={dark ? "absolute inset-0" : "absolute inset-y-0 right-0 w-[65%] [mask-image:linear-gradient(to_left,#000_55%,transparent_100%)]"}>
          <Image src={th.img} alt="" fill sizes="360px" className={`object-cover ${th.pos}`} />
        </div>
        {dark ? <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" /> : null}
        <div className={`relative z-10 flex h-full w-[62%] flex-col justify-center px-3.5 ${dark ? "text-white" : "text-ink"}`}>
          <p className="font-display text-[17px] font-bold leading-[1.1] tracking-tight">{c.headline}</p>
          <p className={`mt-1.5 line-clamp-3 text-[7px] leading-snug ${dark ? "text-white/85" : "text-muted"}`}>{c.sub}</p>
          <div className="mt-2.5 flex gap-1.5">
            <span className={`rounded px-2 py-1 text-[6.5px] font-semibold ${th.btn}`}>{c.primary}</span>
            <span className={`rounded border px-2 py-1 text-[6.5px] font-semibold ${dark ? "border-white/60 bg-white/90 text-ink" : "border-line bg-white text-ink"}`}>{c.secondary}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 border-t border-line px-2 py-2.5">
        {c.points.map((p, i) => {
          const I = Icons[i];
          return (
            <span key={p} className="flex flex-col items-center gap-1 text-center text-[6.5px] text-ink">
              <I size={11} className={th.accent} /> {p}
            </span>
          );
        })}
      </div>
    </div>
  );
}
