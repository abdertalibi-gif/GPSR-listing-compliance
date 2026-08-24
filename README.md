# GPSR Listing Compliance — SaaS Platform

Production-ready SaaS for **EU GPSR Listing Information Checks**. Helps e-commerce sellers identify missing product safety & traceability information before publishing in the EU market.

> **Disclaimer:** This platform provides automated **Listing Information Checks** and compliance support. It does **not** constitute legal advice, product certification, safety certification, or a guarantee of compliance with EU law. We use terms: *GPSR Listing Check, Compliance Information Check, Listing Information Review, Needs Review* — never *“100% legally compliant.”*

## Features

- **Product Listing Check** — transparent score 0–100, status (DRAFT/INCOMPLETE/NEEDS_REVIEW/READY/ARCHIVED), ranked issues
- **Manufacturer & EU Responsible Person** — conditional RP collection, never auto-invented
- **Product Identification** — SKU/Model/GTIN/Barcode/Serial/Batch (at least one required, GTIN validated)
- **Safety Information** — warnings, instructions, restrictions (rich text)
- **Document Management** — PDF/DOC/DOCX/JPG/PNG/WebP, validated type/size/MIME, private storage
- **Reports** — professional PDF with logo, product, score, issues, recommendations, disclaimer, Report ID
- **History & Compare** — previous vs current check, fixed/new/remaining issues
- **Bulk checking, issue tracking, audit logs, notifications, admin panel, configurable GPSR rules**

## Tech Stack (strict)

- **Next.js 16 (App Router, Turbopack)** + TypeScript (strict) + React 19
- **Tailwind CSS 4** + **shadcn/ui** + **Lucide Icons**
- **PostgreSQL** + **Prisma ORM 6.14** (UUID/cuid, indexes, FKs, soft delete)
- **Auth.js (NextAuth 5 beta)** — Email/password + Google + Facebook OAuth, JWT sessions
- **Zod** + **React Hook Form** + **bcryptjs**
- **jsPDF** for reports, **date-fns**

## Architecture

```
Frontend → Next.js Route Handlers / Server Actions / Server Components
        → Services (src/services/gpsr/gpsr-validator.ts + rules.ts)
        → Prisma → PostgreSQL
Auth: Auth.js  | Validation: Zod | UI: Tailwind + shadcn/ui
```

- Brand colors: **Navy #0f1f3c**, **Gold #c9a227**, **Slate** neutrals, minimal enterprise design
- Security headers, RBAC, ownership checks server-side, Zod everywhere, file validation, rate limiting ready

## Database Models (Prisma)

User, Account, Session, VerificationToken, PasswordResetToken, Product, Manufacturer, ResponsiblePerson, SafetyInfo, ProductDocument, GpsrCheck, GpsrIssue, GpsrRule (configurable), ComplianceReport, Notification, AuditLog, Subscription, UsageRecord, SystemSettings — see `prisma/schema.prisma:1`

GPSR engine is decoupled: `src/services/gpsr/gpsr-validator.ts:1` + `src/services/gpsr/rules.ts:1` — not inside React components.

## Quick Start

```bash
# 1. Requirements: Node 22+, PostgreSQL
yarn install   # or npm install --legacy-peer-deps

# 2. Env
cp .env.example .env
# edit DATABASE_URL, AUTH_SECRET, GOOGLE_*, FACEBOOK_*, STORAGE_*

# 3. DB — generate client & push/migrate
yarn db:generate
yarn db:push        # or yarn db:migrate
# seed demo (optional):
# node --loader ts-node prisma/seed.ts

# 4. Dev / Build / Test
yarn dev            # http://localhost:3000
yarn typecheck
yarn lint
yarn test           # Vitest — 6 GPSR validator tests
yarn build
yarn start
```

### Environment (.env.example)

```
DATABASE_URL=postgresql://user:password@localhost:5432/gpsr_compliance
AUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
STORAGE_ENDPOINT=   # S3 / R2 / Supabase Storage
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=gpsr-documents
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Auth

- Pages: `/login`, `/register`, `/forgot-password`, `/verify-email`
- Password rules: min 8, uppercase, lowercase, number, special char
- `autocomplete="email"`, `current-password` / `new-password`
- Email verification & reset tokens are **hashed**, expiring, never plain
- `src/lib/auth.ts:1` — `PrismaAdapter`, JWT, secure cookies

## Key Routes

| Area | Path |
|------|------|
| Public | `/`, `/features`, `/pricing`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/disclaimer` |
| Auth | `/login`, `/register`, `/forgot-password` |
| Dashboard | `/dashboard`, `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]`, `/dashboard/products/[id]/check` |
| Ops | `/dashboard/checks`, `/dashboard/reports`, `/dashboard/reports/[id]`, `/dashboard/documents`, `/dashboard/notifications`, `/dashboard/settings/profile` |
| Admin | `/admin`, `/admin/users`, `/admin/settings` (ADMIN only) |
| API | `POST /api/products`, `GET /api/products`, `GET /api/products/[id]`, `POST /api/products/[id]/check`, `GET /api/checks`, `GET /api/reports`, `POST /api/documents`, etc. — all verify auth + ownership + role server-side (`src/app/api/products/route.ts:1`) |

## GPSR Engine

```ts
import { validateGpsrProduct } from "@/services/gpsr/gpsr-validator";
const result = validateGpsrProduct(product);
// → { status, score, missingFields, warnings, recommendations, checks, issues }
```

- Weighted rules (`src/services/gpsr/rules.ts:1`) with `code, severity, category, required, enabled, version`
- Score 0–49 Incomplete, 50–79 Needs Review, 80–99 Almost Ready, 100 Complete — always explains missing points
- `READY` requires **no CRITICAL** issues

## Reports & PDFs

- Report model stores `content` JSON + `reportId` (e.g. `RPT-...`)
- PDF generation via `jspdf` includes logo, product, score, issues, disclaimer — never claims legal certification
- `src/app/dashboard/reports/[id]/page.tsx:1`

## File Storage

- Metadata in `ProductDocument` (storageKey, mime, size)
- Validation: allowed types + 10MB limit + MIME check (`src/app/api/documents/route.ts:1`)
- Ready for S3 / Cloudflare R2 / Supabase Storage (env-driven)

## Security

- Auth + RBAC + Zod + rate limiting + secure cookies + input/file validation + XSS/SQL/CSRF protections + security headers (`next.config.ts:1`) + error sanitization

## Testing

```bash
yarn test
# → tests/gpsr-validator.test.ts — 6 cases: valid product, missing manufacturer/address/RP/identifier/safety, score transparency
```

## Production Build

```bash
yarn build   # ✓ Compiled in 23.7s — 33 routes, static + dynamic
```

## Deployment

- Set `DATABASE_URL` and run migrations, set `AUTH_SECRET` (≥32 chars), OAuth IDs, storage creds
- `next.config.ts` ships security headers, `robots.ts`/`sitemap.ts` for SEO, `not-found.tsx`/`error.tsx` for UX

## Legal

See `/disclaimer` and footer. Platform is **Listing Information Review** only.

## License

Private — SaaS commercial.

