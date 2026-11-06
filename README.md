# DM Hub Onepage

Bilingual (NL/EN) landing page + 5-step enquiry brief for the **DM Hub Onepage** productised website service.
Built with Next.js (App Router), React, Tailwind CSS v4, TypeScript and zod. Implements
`dmhub-onepage-development-brief.md` and the visual design in `dmhub_design_system_and_specs.md`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000  ->  redirects to /nl/onepage
npm run build && npm start
```

## Routes

| Route | Purpose |
| --- | --- |
| `/nl/onepage` · `/en/onepage` | Landing page |
| `/nl/onepage/start` · `/en/onepage/start` | 5-step brief |
| `/nl/onepage/bedankt` · `/en/onepage/thank-you` | Confirmation (no personal data in URL) |
| `/{nl,en}/onepage/demo/{painter,gardener,cleaner}` | Clearly labelled demo sites (form disabled, `noindex`) |
| `POST /api/brief` | Server-side validation, pricing recalculation, persistence |

## Where things live

- `lib/config.ts` — **draft** prices/terms (minor units, EUR, excl. VAT). Change prices here only.
- `lib/dictionaries.ts` — all NL/EN copy (je/jouw). Needs native Dutch editorial review before launch.
- `lib/pricing.ts` — the one pricing function used by the browser summary AND the server.
- `lib/brief-schema.ts` — zod schema shared by client step validation and the server.
- `app/api/brief/route.ts` — validation, idempotency, rate limit, honeypot, magic-byte upload checks.
- `public/images/` — hero laptop + sidebar devices (cropped from the approved designs), three trade photos.
- `app/globals.css` — design tokens (colours, fonts, shadows) from the design system.

## Enquiry storage (first release)

Briefs are saved **before** success is reported, as JSON in `.data/` (git-ignored, never under `public/`):

```
.data/briefs/<ref>.json        brief + pricing snapshot (server-calculated)
.data/uploads/<ref>/<uuid>.ext private uploads
.data/outbox/<ref>.customer|internal.json  queued acknowledgement + internal notification
.data/idempotency/             prevents duplicate briefs on retry / double-click
```

Email is **queued, not sent**: wire `.data/outbox` (or `lib/emails.ts`) to your approved mail provider; a failed
send never loses the enquiry. For production replace `lib/storage.ts` with your database/CRM + private object
storage, and replace the in-memory rate limiter in the route with Redis/edge limiting.
Set `BRIEF_DATA_DIR` to store outside the project folder.

## Environment (`.env.local`)

See `.env.example`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BOOKING_URL` (discovery-call link), `BRIEF_NOTIFY_TO`.

## Before public launch (brief §13)

- Approve final prices/terms in `lib/config.ts`; confirm VAT treatment and cancellation copy.
- Native Dutch review of `lib/dictionaries.ts`.
- Set real privacy/terms URLs (`SITE.privacyUrl/termsUrl`) and the booking link.
- Confirm provider costs for the appointment scheduler (currently shown as "to be confirmed").
- Add authorised client proof to the About section only once confirmed — no invented testimonials/stats.
- Hook up approved analytics (`lib/analytics.ts` sends no personal data; define `window.plausible`).

## Notes on the design

- The hero laptop mock is cropped from the supplied design (`public/images/hero-laptop.png`). It contains
  sample text from the design (e.g. a sample rating); it is labelled "Voorbeeldwebsite / Example website".
- The three demo previews are rebuilt in HTML around the supplied trade photos so they stay sharp.
- The design's "250+ clients / 4.9 rating" stats and the mobile testimonial were **not** reproduced, because the
  brief forbids invented client results; the stats strip shows factual package facts instead.
# Dmhub-onepager
