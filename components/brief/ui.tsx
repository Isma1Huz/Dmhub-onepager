"use client";
import type { ReactNode } from "react";

export function Field({
  id, label, hint, error, optional, optionalLabel, children,
}: {
  id: string; label: string; hint?: string; error?: string; optional?: boolean; optionalLabel?: string;
  children: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold text-ink">
        {label}
        {optional && optionalLabel ? <span className="ml-1.5 text-[13px] font-normal text-muted">({optionalLabel})</span> : null}
      </label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": describedBy })}
      {hint ? <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
      {error ? <p id={`${id}-err`} className="mt-1.5 text-[13px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export function RadioCards<T extends string>({
  name, legend, value, onChange, options, hint, cols = "sm:grid-cols-2",
}: {
  name: string; legend: string; value: string; onChange: (v: T) => void;
  options: { value: T; label: string }[]; hint?: string; cols?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[15px] font-semibold text-ink">{legend}</legend>
      <div className={`grid gap-2.5 ${cols}`}>
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-[14.5px] text-ink peer-checked:border-brand peer-checked:bg-tint peer-checked:font-semibold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
              <span aria-hidden className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 ${value === o.value ? "border-brand" : "border-slate-300"}`}>
                {value === o.value ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
              </span>
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </fieldset>
  );
}

export function Check({ id, checked, onChange, children, error }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: ReactNode; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-snug text-ink">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#0066ff]" />
        <span>{children}</span>
      </label>
      {error ? <p id={`${id}-err`} className="mt-1.5 text-[13px] font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
