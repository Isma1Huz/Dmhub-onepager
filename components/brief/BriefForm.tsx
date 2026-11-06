"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check as CheckIcon, Clock, Database, Minus, Monitor, Plus, ShieldCheck, Trash2, Upload, Users, X } from "lucide-react";
import { PRICING, SITE, TRADES, UPLOAD, type Locale } from "@/lib/config";
import { getDict } from "@/lib/dictionaries";
import { briefSchema, STEP_FIELDS } from "@/lib/brief-schema";
import { computePrice } from "@/lib/pricing";
import { money } from "@/lib/format";
import { path } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { clear, defaults, fileStore, load, newKey, REF_KEY, save, type BriefState } from "@/lib/brief-store";
import { Logo } from "../Logo";
import { LangSwitchClient } from "../LangSwitchClient";
import { Check, Field, RadioCards } from "./ui";

const TOTAL = 5;

export function BriefForm({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = dict.brief;
  const router = useRouter();
  const schema = useMemo(() => briefSchema(t.errors), [t]);

  const [a, setA] = useState<BriefState>(() => defaults(locale));
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [ready, setReady] = useState(false);
  const keyRef = useRef("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  /* restore answers (kept across NL/EN switches and Back navigation) */
  useEffect(() => {
    const s = load();
    if (s) {
      setA({ ...defaults(locale), ...s.answers, addons: { ...defaults(locale).addons, ...s.answers.addons } });
      setStep(Math.min(Math.max(s.step, 1), TOTAL));
      keyRef.current = s.key;
    } else {
      keyRef.current = newKey();
      track("brief_start", { locale });
    }
    setFiles(fileStore.get());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ready) save({ answers: a, step, key: keyRef.current });
  }, [a, step, ready]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const set = useCallback(<K extends keyof BriefState>(k: K, v: BriefState[K]) => {
    setA((p) => ({ ...p, [k]: v }));
    setErrors((p) => {
      if (!p[k as string]) return p;
      const n = { ...p };
      delete n[k as string];
      return n;
    });
  }, []);

  /* ── validation ── */
  const validateFields = (fields: string[]) => {
    const out: Record<string, string> = {};
    const shape = schema.shape as Record<string, { safeParse: (v: unknown) => { success: boolean; error?: { issues: { message: string }[] } } }>;
    for (const f of fields) {
      const r = shape[f].safeParse((a as unknown as Record<string, unknown>)[f]);
      if (!r.success) out[f] = r.error?.issues[0]?.message ?? t.errors.required;
    }
    return out;
  };

  const focusFirst = (errs: Record<string, string>) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      (document.getElementById(`f-${first}`) ?? document.querySelector<HTMLElement>(`[name="${first}"]`))?.focus();
    });
  };

  const next = () => {
    const errs = validateFields(STEP_FIELDS[step - 1]);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirst(errs);
    setStep((s) => Math.min(s + 1, TOTAL));
  };
  const back = () => setStep((s) => Math.max(s - 1, 1));

  /* ── files ── */
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const errs: string[] = [];
    const merged = [...files];
    for (const f of Array.from(list)) {
      if (merged.length >= UPLOAD.maxFiles) { errs.push(t.errors.tooMany); break; }
      if (!(UPLOAD.types as readonly string[]).includes(f.type)) { errs.push(t.errors.badType(f.name)); continue; }
      if (f.size > UPLOAD.maxBytes) { errs.push(t.errors.tooBig(f.name)); continue; }
      merged.push(f);
    }
    setFileErrors(errs);
    setFiles(merged);
    fileStore.set(merged);
  };
  const removeFile = (i: number) => {
    const n = files.filter((_, x) => x !== i);
    setFiles(n);
    fileStore.set(n);
  };

  /* ── submit ── */
  const submit = async () => {
    if (status === "submitting") return; // double-click guard
    const all: Record<string, string> = {};
    let firstBad = 0;
    STEP_FIELDS.forEach((fields, i) => {
      const e = validateFields(fields);
      if (Object.keys(e).length && !firstBad) firstBad = i + 1;
      Object.assign(all, e);
    });
    setErrors(all);
    if (firstBad) {
      setStep(firstBad);
      return focusFirst(all);
    }
    setStatus("submitting");
    setServerError("");
    try {
      const fd = new FormData();
      fd.append("payload", JSON.stringify({ ...a, services: a.services.map((s) => s.trim()).filter(Boolean), interfaceLocale: locale, idempotencyKey: keyRef.current }));
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/brief", { method: "POST", body: fd });
      if (res.status === 429) throw new Error("rate");
      if (res.status === 422) {
        const data = (await res.json()) as { errors?: Record<string, string> };
        const errs = data.errors ?? {};
        if (errs.files) setFileErrors([errs.files.startsWith("tooMany") ? t.errors.tooMany : errs.files.startsWith("tooBig") ? t.errors.tooBig(errs.files.split(":")[1] ?? "") : t.errors.badType(errs.files.split(":")[1] ?? "")]);
        setErrors(errs);
        setStatus("error");
        setServerError(t.errors.submit);
        const stepWithErr = STEP_FIELDS.findIndex((f) => f.some((k) => errs[k])) + 1;
        setStep(errs.files ? 3 : stepWithErr || 1);
        return;
      }
      if (!res.ok) throw new Error("server");
      const data = (await res.json()) as { reference: string };
      try { sessionStorage.setItem(REF_KEY, data.reference); } catch { /* noop */ }
      clear();
      fileStore.clear();
      track("brief_complete", { locale });
      router.push(path(locale, "done"));
    } catch (e) {
      setStatus("error");
      setServerError((e as Error).message === "rate" ? t.errors.rate : t.errors.submit);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < TOTAL) next();
    else submit();
  };

  const price = computePrice(a.addons);
  const submitting = status === "submitting";
  const errCount = Object.keys(errors).length;
  const nextLabel = step < TOTAL ? `${t.nextTo} ${t.steps[step]}` : t.submit;

  const inputProps = (k: keyof BriefState, extra: Record<string, unknown> = {}) => ({
    name: k as string,
    className: "field",
    value: a[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value as never),
    ...extra,
  });

  return (
    <div className="min-h-screen bg-canvas">
      {/* top bar */}
      <header className="border-b border-line bg-white">
        <div className="container-x flex h-[72px] items-center justify-between gap-4 !px-4 md:!px-10">
          <Logo locale={locale} />
          <div className="flex items-center gap-6">
            <p className="hidden text-[13px] text-muted lg:block">{t.topTagline}</p>
            <ul className="hidden items-center gap-3 text-[13px] text-muted md:flex" aria-label="Trust">
              <li><ShieldCheck size={18} className="inline text-brand" aria-hidden /></li>
              {t.topTrust.map((x, i) => (<li key={x} className="flex items-center gap-3">{i > 0 ? <span aria-hidden>•</span> : null}{x}</li>))}
            </ul>
            <LangSwitchClient locale={locale} label={dict.nav.language} page="start" />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 md:px-8 md:pt-8">
        {/* stepper */}
        <nav aria-label={t.stepOf(step, TOTAL)} className="mx-auto mb-6 max-w-4xl">
          <ol className="flex items-start">
            {t.stepsShort.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const current = n === step;
              return (
                <li key={label} className="relative flex flex-1 flex-col items-center" aria-current={current ? "step" : undefined}>
                  {i > 0 ? <span aria-hidden className={`absolute right-1/2 top-5 h-0.5 w-full ${n <= step ? "bg-brand" : "bg-line"}`} /> : null}
                  <span className={`relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-[16px] font-semibold ${current || done ? "border-brand bg-brand text-white" : "border-line bg-white text-muted"}`}>
                    {done ? <CheckIcon size={18} aria-hidden /> : n}
                  </span>
                  <span className={`mt-2 hidden text-center text-[14px] sm:block ${current ? "font-semibold text-brand" : "text-muted"}`}>{label}</span>
                  {done || current ? <span className="sr-only">{done ? "✓" : ""}</span> : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <form noValidate onSubmit={onSubmit} className="card p-5 md:p-9" aria-labelledby="step-title">
            <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-brand">{t.stepOf(step, TOTAL)}</p>
            <h1 id="step-title" ref={headingRef} tabIndex={-1} className="mt-2 text-[28px] font-extrabold leading-tight tracking-tight outline-none md:text-[36px]">
              {step === 1 ? t.s1.title : step === 2 ? t.s2.title : step === 3 ? t.s3.title : step === 4 ? t.s4.title : t.s5.title}
            </h1>
            {step === 1 ? <p className="mt-2 text-[16px] text-muted">{t.noAccount}</p> : null}
            {step === 3 ? <p className="mt-2 text-[16px] text-muted">{t.s3.intro}</p> : null}

            {errCount > 0 ? (
              <div role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden /> {t.errors.summary}
              </div>
            ) : null}

            <div className="mt-6 space-y-5">
              {/* ───────── step 1 ───────── */}
              {step === 1 && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field id="f-businessName" label={t.s1.businessName} error={errors.businessName}>
                      {(p) => <input {...p} {...inputProps("businessName", { autoComplete: "organization", required: true })} />}
                    </Field>
                    <Field id="f-trade" label={t.s1.trade} error={errors.trade}>
                      {(p) => (
                        <select {...p} {...inputProps("trade", { required: true })}>
                          <option value="">{t.s1.tradePlaceholder}</option>
                          {TRADES.map((x) => (<option key={x} value={x}>{t.s1.trades[x]}</option>))}
                        </select>
                      )}
                    </Field>
                  </div>
                  <Field id="f-contactName" label={t.s1.contactName} error={errors.contactName}>
                    {(p) => <input {...p} {...inputProps("contactName", { autoComplete: "name", required: true })} />}
                  </Field>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field id="f-email" label={t.s1.email} error={errors.email}>
                      {(p) => <input {...p} {...inputProps("email", { type: "email", autoComplete: "email", inputMode: "email", required: true })} />}
                    </Field>
                    <Field id="f-phone" label={t.s1.phone} optional optionalLabel={t.optional} error={errors.phone}>
                      {(p) => <input {...p} {...inputProps("phone", { type: "tel", autoComplete: "tel" })} />}
                    </Field>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field id="f-town" label={t.s1.town} optional optionalLabel={t.optional} error={errors.town}>
                      {(p) => <input {...p} {...inputProps("town", { autoComplete: "address-level2" })} />}
                    </Field>
                    <Field id="f-serviceArea" label={t.s1.serviceArea} optional optionalLabel={t.optional} hint={t.s1.serviceAreaHint} error={errors.serviceArea}>
                      {(p) => <input {...p} {...inputProps("serviceArea")} />}
                    </Field>
                  </div>
                </>
              )}

              {/* ───────── step 2 ───────── */}
              {step === 2 && (
                <>
                  <fieldset>
                    <legend className="mb-2 text-[15px] font-semibold">{t.s2.services}</legend>
                    <div className="space-y-2.5">
                      {a.services.map((s, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            id={i === 0 ? "f-services" : undefined}
                            className="field"
                            value={s}
                            maxLength={80}
                            aria-label={t.s2.servicePlaceholder(i + 1)}
                            placeholder={t.s2.servicePlaceholder(i + 1)}
                            onChange={(e) => set("services", a.services.map((x, j) => (j === i ? e.target.value : x)))}
                          />
                          {a.services.length > 1 ? (
                            <button type="button" aria-label={`${t.s2.removeService} ${i + 1}`} onClick={() => set("services", a.services.filter((_, j) => j !== i))} className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-lg border border-line text-muted hover:text-ink">
                              <X size={16} aria-hidden />
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {a.services.length < 5 ? (
                      <button type="button" onClick={() => set("services", [...a.services, ""])} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:underline">
                        <Plus size={16} aria-hidden /> {t.s2.addService}
                      </button>
                    ) : null}
                    {errors.services ? <p className="mt-1.5 text-[13px] font-medium text-red-600">{errors.services}</p> : null}
                  </fieldset>
                  <Field id="f-description" label={t.s2.description} hint={t.s2.descriptionHint} error={errors.description}>
                    {(p) => <textarea {...p} {...inputProps("description", { rows: 5, required: true, maxLength: 1500 })} />}
                  </Field>
                  <RadioCards name="primaryAction" legend={t.s2.primaryAction} value={a.primaryAction} onChange={(v) => set("primaryAction", v)}
                    options={(Object.keys(t.s2.actions) as (keyof typeof t.s2.actions)[]).map((k) => ({ value: k, label: t.s2.actions[k] }))} />
                </>
              )}

              {/* ───────── step 3 ───────── */}
              {step === 3 && (
                <>
                  <div>
                    <label htmlFor="f-files" className="mb-1.5 block text-[15px] font-semibold">
                      {t.s3.files} <span className="ml-1 text-[13px] font-normal text-muted">({t.optional})</span>
                    </label>
                    <label htmlFor="f-files" className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line bg-canvas px-4 py-7 text-center text-[14px] text-muted hover:border-brand focus-within:border-brand">
                      <Upload size={22} className="text-brand" aria-hidden />
                      <span>{t.s3.filesHint}</span>
                    </label>
                    <input id="f-files" type="file" multiple accept={UPLOAD.types.join(",")} className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} aria-describedby={fileErrors.length ? "files-err" : undefined} />
                    {fileErrors.length ? (
                      <ul id="files-err" role="alert" className="mt-2 space-y-1 text-[13px] font-medium text-red-600">{fileErrors.map((x) => (<li key={x}>{x}</li>))}</ul>
                    ) : null}
                    {files.length ? (
                      <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-white text-[14px]">
                        {files.map((f, i) => (
                          <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
                            <span className="truncate">{f.name} <span className="text-muted">({(f.size / 1024 / 1024).toFixed(1)} MB)</span></span>
                            <button type="button" onClick={() => removeFile(i)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-red-600">
                              <Trash2 size={14} aria-hidden /> {t.s3.filesRemove}<span className="sr-only"> {f.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <Field id="f-existingSite" label={t.s3.existingSite} optional optionalLabel={t.optional} error={errors.existingSite}>
                    {(p) => <input {...p} {...inputProps("existingSite", { type: "text", inputMode: "url", autoComplete: "url" })} />}
                  </Field>
                  <Field id="f-reviews" label={t.s3.reviews} optional optionalLabel={t.optional} hint={t.s3.reviewsHint} error={errors.reviews}>
                    {(p) => <textarea {...p} {...inputProps("reviews", { rows: 4 })} />}
                  </Field>
                  <Field id="f-differentiators" label={t.s3.differentiators} optional optionalLabel={t.optional} error={errors.differentiators}>
                    {(p) => <textarea {...p} {...inputProps("differentiators", { rows: 3 })} />}
                  </Field>
                  <Check id="f-needHelp" checked={a.needHelp} onChange={(v) => set("needHelp", v)}>{t.s3.needHelp}</Check>
                </>
              )}

              {/* ───────── step 4 ───────── */}
              {step === 4 && (
                <>
                  <RadioCards name="layout" legend={t.s4.layout} value={a.layout} onChange={(v) => set("layout", v)}
                    options={(Object.keys(t.s4.layouts) as (keyof typeof t.s4.layouts)[]).map((k) => ({ value: k, label: t.s4.layouts[k] }))} />
                  <RadioCards name="colours" legend={t.s4.colours} value={a.colours} onChange={(v) => set("colours", v)} cols="grid-cols-2 sm:grid-cols-3"
                    options={(Object.keys(t.s4.colourOptions) as (keyof typeof t.s4.colourOptions)[]).map((k) => ({ value: k, label: t.s4.colourOptions[k] }))} />
                  <RadioCards name="websiteLanguage" legend={t.s4.websiteLanguage} hint={t.s4.websiteLanguageHint} value={a.websiteLanguage} onChange={(v) => set("websiteLanguage", v)}
                    options={(["nl", "en"] as const).map((k) => ({ value: k, label: t.s4.languages[k] }))} />
                  <RadioCards name="domainStatus" legend={t.s4.domain} value={a.domainStatus} onChange={(v) => set("domainStatus", v)} cols="sm:grid-cols-1"
                    options={(Object.keys(t.s4.domains) as (keyof typeof t.s4.domains)[]).map((k) => ({ value: k, label: t.s4.domains[k] }))} />

                  <fieldset className="rounded-xl border border-line bg-canvas p-4 md:p-5">
                    <legend className="px-1 text-[15px] font-semibold">{t.s4.addonsTitle}</legend>
                    <p className="mb-3 text-[13px] text-muted">{t.s4.addonsHint}</p>
                    <div className="space-y-3">
                      <Qty id="q-extraPages" label={dict.addons.items.extraPage.title} sub={`${money(PRICING.addons.extraPage.setup, locale)} ${dict.addons.perPage} · max. ${PRICING.addons.extraPage.max}`} value={a.addons.extraPages} max={PRICING.addons.extraPage.max} qty={t.s4.qty}
                        onChange={(v) => set("addons", { ...a.addons, extraPages: v })} />
                      <Qty id="q-mailboxes" label={dict.addons.items.mailbox.title} sub={`${money(PRICING.addons.mailbox.setup, locale)} + ${money(PRICING.addons.mailbox.monthly, locale)}${dict.hero.perMonth} ${dict.addons.perMailbox}`} value={a.addons.mailboxes} max={PRICING.addons.mailbox.max} qty={t.s4.qty}
                        onChange={(v) => set("addons", { ...a.addons, mailboxes: v })} />
                      <Check id="a-scheduler" checked={a.addons.scheduler} onChange={(v) => set("addons", { ...a.addons, scheduler: v })}>
                        <b>{dict.addons.items.scheduler.title}</b> — {money(PRICING.addons.scheduler.setup, locale)} <span className="text-muted">({dict.addons.providerTbc})</span>
                      </Check>
                      <Check id="a-lang" checked={a.addons.secondLanguage} onChange={(v) => set("addons", { ...a.addons, secondLanguage: v })}>
                        <b>{dict.addons.items.secondLanguage.title}</b> — {money(PRICING.addons.secondLanguage.setup, locale)}
                      </Check>
                      <Check id="a-gallery" checked={a.addons.gallery} onChange={(v) => set("addons", { ...a.addons, gallery: v })}>
                        <b>{dict.addons.items.gallery.title}</b> — {money(PRICING.addons.gallery.setup, locale)}
                      </Check>
                    </div>
                  </fieldset>
                </>
              )}

              {/* ───────── step 5 ───────── */}
              {step === 5 && (
                <>
                  <dl className="divide-y divide-line rounded-xl border border-line">
                    <Summary title={t.steps[0]} onEdit={() => setStep(1)} edit={t.s5.edit} rows={[
                      [t.s1.businessName, a.businessName], [t.s1.trade, a.trade ? t.s1.trades[a.trade as keyof typeof t.s1.trades] : ""],
                      [t.s1.contactName, a.contactName], [t.s1.email, a.email], [t.s1.phone, a.phone], [`${t.s1.town} / ${t.s1.serviceArea}`, [a.town, a.serviceArea].filter(Boolean).join(" · ")],
                    ]} empty={t.s5.empty} />
                    <Summary title={t.steps[1]} onEdit={() => setStep(2)} edit={t.s5.edit} rows={[
                      [t.s2.services, a.services.map((s) => s.trim()).filter(Boolean).join(", ")], [t.s2.description, a.description],
                      [t.s2.primaryAction, t.s2.actions[a.primaryAction as keyof typeof t.s2.actions]],
                    ]} empty={t.s5.empty} />
                    <Summary title={t.steps[2]} onEdit={() => setStep(3)} edit={t.s5.edit} rows={[
                      [t.s5.files, files.map((f) => f.name).join(", ")], [t.s3.existingSite, a.existingSite], [t.s3.differentiators, a.differentiators], [t.s3.needHelp, a.needHelp ? "✓" : ""],
                    ]} empty={t.s5.empty} />
                    <Summary title={t.steps[3]} onEdit={() => setStep(4)} edit={t.s5.edit} rows={[
                      [t.s4.layout, t.s4.layouts[a.layout as keyof typeof t.s4.layouts]], [t.s4.colours, t.s4.colourOptions[a.colours as keyof typeof t.s4.colourOptions]],
                      [t.s4.websiteLanguage, t.s4.languages[a.websiteLanguage]], [t.s4.domain, t.s4.domains[a.domainStatus as keyof typeof t.s4.domains]],
                      [t.s4.addonsTitle, price.lines.map((l) => `${dict.addons.items[l.id as keyof typeof dict.addons.items].title}${l.qty > 1 ? ` × ${l.qty}` : ""}`).join(", ")],
                    ]} empty={t.s5.empty} />
                  </dl>

                  <div className="rounded-xl bg-tint p-5">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-brand">{t.s5.indicative}</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      <p className="text-[15px]">{t.s5.setupTotal}<br /><b className="font-display text-[28px]">{money(price.setupTotal, locale)}</b></p>
                      <p className="text-[15px]">{t.s5.monthlyTotal}<br /><b className="font-display text-[28px]">{money(price.monthlyTotal, locale)}</b></p>
                    </div>
                    {price.providerCostsTbc.length ? <p className="mt-2 text-[13px] text-ink">{t.s5.providerTbc}</p> : null}
                    <p className="mt-2 text-[13px] text-muted">{t.s5.finalNote}</p>
                  </div>

                  {/* honeypot: hidden from people and assistive tech */}
                  <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>Website<input tabIndex={-1} autoComplete="off" value={a.company_website} onChange={(e) => set("company_website", e.target.value)} name="company_website" /></label>
                  </div>

                  <Check id="f-acknowledged" checked={a.acknowledged} onChange={(v) => set("acknowledged", v)} error={errors.acknowledged}>{t.s5.ack}</Check>
                  <Check id="f-marketing" checked={a.marketingOptIn} onChange={(v) => set("marketingOptIn", v)}>{t.s5.marketing}</Check>
                  <p className="text-[13px]"><a href={SITE.privacyUrl} target="_blank" rel="noopener" className="font-semibold text-brand-600 underline-offset-2 hover:underline">{t.s5.privacy}</a></p>

                  {serverError ? (
                    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden /> {serverError}
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              {step > 1 ? (
                <button type="button" onClick={back} disabled={submitting} className="btn-ghost !px-6">{t.back}</button>
              ) : null}
              <button type="submit" disabled={submitting} aria-busy={submitting} className="btn-primary px-7 py-4 text-[16px] disabled:cursor-wait disabled:opacity-70">
                {submitting ? t.submitting : nextLabel} {!submitting ? <ArrowRight size={18} aria-hidden /> : null}
              </button>
            </div>
          </form>

          {/* ───────── sidebar ───────── */}
          <aside className="space-y-5" aria-label={t.sidebar.title}>
            <div className="card p-6">
              <h2 className="text-[22px] font-bold tracking-tight">{t.sidebar.title}</h2>
              <dl className="mt-5 space-y-3.5 text-[15px]">
                <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-3"><Monitor size={20} className="text-brand" aria-hidden />{t.sidebar.website}</dt><dd className="font-bold">{money(PRICING.setup, locale)}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="flex items-center gap-3"><Database size={20} className="text-brand" aria-hidden />{t.sidebar.hosting}</dt><dd className="font-bold">{money(PRICING.monthly, locale)}{dict.hero.perMonth}</dd></div>
                {price.lines.map((l) => (
                  <div key={l.id} className="flex items-start justify-between gap-3 text-[14px]">
                    <dt className="pl-8 text-muted">{dict.addons.items[l.id as keyof typeof dict.addons.items].title}{l.qty > 1 ? ` × ${l.qty}` : ""}</dt>
                    <dd className="text-right font-semibold">{money(l.setup, locale)}{l.monthly ? ` + ${money(l.monthly, locale)}${dict.hero.perMonth}` : ""}</dd>
                  </div>
                ))}
                <div className="flex items-start justify-between gap-3 border-t border-line pt-3.5"><dt className="flex items-center gap-3"><Clock size={20} className="text-ink" aria-hidden />{t.sidebar.lead}</dt><dd className="text-right text-muted">{t.sidebar.leadValue}</dd></div>
              </dl>
              {price.lines.length ? (
                <p className="mt-3 flex justify-between border-t border-line pt-3 text-[14px] font-bold"><span>{t.s5.indicative}</span><span>{money(price.setupTotal, locale)} + {money(price.monthlyTotal, locale)}{dict.hero.perMonth}</span></p>
              ) : null}
              <p className="mt-3 text-[12px] text-muted">{t.sidebar.leadNote} {dict.hero.tax}</p>
              <ul className="mt-4 space-y-2 rounded-xl bg-green-50 p-4 text-[15px] font-medium">
                {[t.sidebar.free, t.sidebar.payLater].map((x) => (
                  <li key={x} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-success text-white"><CheckIcon size={14} aria-hidden /></span>{x}</li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-tint p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-brand">{t.sidebar.promoEyebrow}</p>
              <p className="mt-2 font-display text-[22px] font-bold leading-tight">{t.sidebar.promoTitle}</p>
              <ul className="mt-3 space-y-2 text-[14px]">
                {t.sidebar.promoPoints.map((x) => (<li key={x} className="flex items-center gap-2"><CheckIcon size={16} className="text-brand" aria-hidden />{x}</li>))}
              </ul>
              <Image src="/images/brief-devices.png" alt="" width={324} height={223} className="mt-3 h-auto w-full rounded-lg" />
            </div>
            <p className="flex items-center gap-3 rounded-xl bg-tint-2 px-4 py-3 text-[14px] font-medium"><Users size={20} className="text-brand" aria-hidden />{t.sidebar.chip}</p>
            <Link href={path(locale)} className="block text-center text-[13px] text-muted hover:text-ink">← DM Hub Onepage</Link>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Qty({ id, label, sub, value, max, qty, onChange }: { id: string; label: string; sub: string; value: number; max: number; qty: string; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3">
      <div id={`${id}-l`}>
        <p className="text-[14.5px] font-semibold">{label}</p>
        <p className="text-[12.5px] text-muted">{sub}</p>
      </div>
      <div role="group" aria-labelledby={`${id}-l`} className="flex items-center gap-2">
        <button type="button" aria-label={`${label}: −1`} disabled={value <= 0} onClick={() => onChange(value - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line disabled:opacity-40"><Minus size={16} aria-hidden /></button>
        <output id={id} aria-label={qty} className="w-6 text-center text-[15px] font-bold">{value}</output>
        <button type="button" aria-label={`${label}: +1`} disabled={value >= max} onClick={() => onChange(value + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line disabled:opacity-40"><Plus size={16} aria-hidden /></button>
      </div>
    </div>
  );
}

function Summary({ title, rows, onEdit, edit, empty }: { title: string; rows: [string, string][]; onEdit: () => void; edit: string; empty: string }) {
  return (
    <div className="p-4 md:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">{title}</h2>
        <button type="button" onClick={onEdit} className="text-[13px] font-semibold text-brand-600 hover:underline">{edit}<span className="sr-only"> — {title}</span></button>
      </div>
      <div className="space-y-1 text-[14px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[130px_1fr] gap-3 sm:grid-cols-[180px_1fr]"><dt className="text-muted">{k}</dt><dd className="break-words">{v || empty}</dd></div>
        ))}
      </div>
    </div>
  );
}
