import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Private, file-based persistence for the first release.
 * Lives OUTSIDE /public so nothing here is ever served. Swap for the agency's
 * existing database/CRM + private object storage when available.
 */
export const DATA_DIR = process.env.BRIEF_DATA_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".data");
export const dir = (...p: string[]) => path.join(DATA_DIR, ...p);

export async function ensure(...p: string[]) {
  await fs.mkdir(dir(...p), { recursive: true, mode: 0o700 });
}

export const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 32);

export function newReference(): string {
  const d = new Date();
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rnd = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `DMH-${ymd}-${rnd}`;
}

export async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function writeJsonExclusive(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), { flag: "wx", mode: 0o600 });
}
