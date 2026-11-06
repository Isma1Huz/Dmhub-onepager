import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { UPLOAD } from "@/lib/config";
import { briefSchema, envelopeSchema } from "@/lib/brief-schema";
import { computePrice } from "@/lib/pricing";
import { dir, ensure, hash, newReference, readJson, writeJsonExclusive } from "@/lib/storage";
import { customerEmail, internalEmail } from "@/lib/emails";
import { dictionaries } from "@/lib/dictionaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── tiny in-memory rate limiter (replace with Redis/edge limiter in production) ── */
const hits = new Map<string, number[]>();
function limited(ip: string, max = 6, windowMs = 10 * 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

/* ── magic-byte check so a renamed file can't masquerade as an image/PDF ── */
function sniff(buf: Buffer): "image/jpeg" | "image/png" | "image/webp" | "application/pdf" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  return null;
}
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" } as const;

export async function POST(req: NextRequest) {
  // Refuse oversized requests before reading the body (max files x max size + overhead).
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > UPLOAD.maxFiles * UPLOAD.maxBytes + 2 * 1024 * 1024) {
    return NextResponse.json({ error: "validation", errors: { files: "tooBig:upload" } }, { status: 413 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const env = envelopeSchema.safeParse(raw);
  if (!env.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // Honeypot: pretend success, store nothing.
  if (env.data.company_website) return NextResponse.json({ reference: newReference() });

  const parsed = briefSchema(dictionaries.nl.brief.errors).safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return NextResponse.json({ error: "validation", errors }, { status: 422 });
  }
  const answers = parsed.data;

  /* uploads: validate type + size server-side */
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > UPLOAD.maxFiles) return NextResponse.json({ error: "validation", errors: { files: "tooMany" } }, { status: 422 });
  const prepared: { original: string; type: keyof typeof EXT; size: number; buf: Buffer }[] = [];
  for (const f of files) {
    if (f.size > UPLOAD.maxBytes) return NextResponse.json({ error: "validation", errors: { files: `tooBig:${f.name}` } }, { status: 422 });
    const buf = Buffer.from(await f.arrayBuffer());
    const type = sniff(buf);
    if (!type || !(UPLOAD.types as readonly string[]).includes(type)) {
      return NextResponse.json({ error: "validation", errors: { files: `badType:${f.name}` } }, { status: 422 });
    }
    prepared.push({ original: f.name.slice(0, 200), type, size: f.size, buf });
  }

  /* idempotency: a retry / double-click returns the same reference */
  await ensure("briefs");
  await ensure("idempotency");
  await ensure("outbox");
  const idemFile = dir("idempotency", `${hash(env.data.idempotencyKey)}.json`);
  const existing = await readJson<{ reference: string }>(idemFile);
  if (existing) return NextResponse.json({ reference: existing.reference });

  const reference = newReference();
  // Server recomputes everything; client-provided totals are never read.
  const price = computePrice(answers.addons);

  const assets: object[] = [];
  if (prepared.length) {
    await ensure("uploads", reference);
    for (const p of prepared) {
      const stored = `${crypto.randomUUID()}.${EXT[p.type]}`;
      await fs.writeFile(dir("uploads", reference, stored), p.buf, { mode: 0o600 });
      assets.push({ storageRef: `uploads/${reference}/${stored}`, originalFilename: p.original, type: p.type, size: p.size, uploadedAt: new Date().toISOString() });
    }
  }

  const record = {
    reference,
    status: "New brief",
    createdAt: new Date().toISOString(),
    interfaceLocale: env.data.interfaceLocale,
    answers,
    assets,
    price,
    notifications: { customer: "queued", internal: "queued" },
    consent: { marketingOptIn: answers.marketingOptIn },
  };

  // Persist FIRST. Only then report success; email trouble must never lose the enquiry.
  await writeJsonExclusive(dir("briefs", `${reference}.json`), record);
  await writeJsonExclusive(idemFile, { reference });

  try {
    const ctx = { reference, interfaceLocale: env.data.interfaceLocale, answers, price };
    await writeJsonExclusive(dir("outbox", `${reference}.customer.json`), { state: "queued", ...customerEmail(ctx) });
    await writeJsonExclusive(dir("outbox", `${reference}.internal.json`), { state: "queued", ...internalEmail(ctx) });
  } catch (e) {
    console.error("[brief] outbox write failed (brief is saved)", reference, e);
  }

  return NextResponse.json({ reference });
}
