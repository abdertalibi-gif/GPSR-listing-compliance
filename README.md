# GPSR Listing Compliance — SaaS Platform

Automated **EU General Product Safety Regulation (GPSR)** Listing Information Checks for e-commerce sellers. Identify missing product traceability, manufacturer, EU Responsible Person, identifier, and safety information before publishing products in the European market.

> **Disclaimer:** This platform provides automated **Listing Information Checks** and compliance support. It does **not** constitute legal advice, product certification, safety certification, or a guarantee of compliance with EU law. A `READY` status means *"Required listing information appears complete based on the supplied information."*

---

## Screenshots

### Landing Page & Instant Compliance Preview
![GPSR Listing Compliance Landing Page](docs/screenshots/landing.jpg)

### Compliance Dashboard & Product Monitoring
![Compliance Dashboard](docs/screenshots/dashboard.jpg)

### Audit-Ready GPSR Compliance Report & PDF Export
![GPSR Compliance Report](docs/screenshots/report.jpg)

---

## Key Features

- **Product Listing Check Engine** — Decoupled, rule-weighted validator (`src/services/gpsr/gpsr-validator.ts`) returning a transparent `0–100` score, status (`DRAFT`, `INCOMPLETE`, `NEEDS_REVIEW`, `READY`, `ARCHIVED`), passed checks, and ranked issues with fix recommendations.
- **6-Step Product Wizard** — Guided creation flow covering Basic Info, Manufacturer, Conditional EU Responsible Person, Safety Information, Private Document Uploads (staging + attachment), and Final Review.
- **Manufacturer & EU Responsible Person** — Collects complete traceability details; enforces EU Responsible Person details only when the manufacturer is established outside the EU.
- **Product Identification** — Validates SKU, Model Number, GTIN/EAN/UPC format, Barcode, Serial, and Batch identifiers.
- **Safety & Traceability** — Structured capture for safety warnings, usage instructions, age/usage restrictions, assembly, storage, and disposal guidance.
- **Document Center** — Validates file extensions (`PDF`, `DOC`, `DOCX`, `JPG`, `PNG`, `WebP`), MIME types, and 10 MB size limits with private storage keys (local or S3/R2-compatible).
- **Multilingual UI & PDF Reports (`EN` / `FR` / `AR`)** — Full RTL support for Arabic and multilingual PDF compliance reports generated via `jsPDF` with embedded Arabic font (`Amiri-Regular.ttf`), Report ID, score breakdown, and legal disclaimer.
- **Check History & Notifications** — Persists historical checks, audit logs, and user notifications.
- **Admin Panel** — User management, system-wide metrics, and configurable `SystemSettings` / `GpsrRule` tables.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Standalone Output) + React 19 + TypeScript |
| **Styling & UI** | Tailwind CSS 4 + Lucide React icons |
| **Database & ORM** | PostgreSQL + Prisma ORM 6.14 (with offline mock fallback in `src/lib/prisma.ts`) |
| **Authentication** | Auth.js (NextAuth v5 beta) — Credentials (bcrypt), Google & Facebook OAuth, JWT sessions |
| **Validation** | Zod + React Hook Form |
| **PDF & i18n** | jsPDF + custom i18n context (`en`, `fr`, `ar`) |
| **Testing** | Vitest |

---

## Project Structure

```text
├── prisma/
│   └── schema.prisma              # Database models (User, Product, Manufacturer, GpsrCheck, etc.)
├── docs/
│   └── screenshots/               # Application UI previews
├── public/
│   └── fonts/Amiri-Regular.ttf    # Arabic font for multilingual PDF export
├── src/
│   ├── app/
│   │   ├── api/                   # REST Route Handlers (auth, products, checks, documents, reports PDF)
│   │   ├── dashboard/             # Authenticated workspace (products, checks, reports, documents, settings)
│   │   ├── admin/                 # Admin console (users, settings)
│   │   └── (public pages)/        # Landing, features, pricing, FAQ, about, contact, legal pages
│   ├── components/                # Layout, UI primitives, reports, i18n switcher
│   ├── lib/
│   │   ├── auth.ts                # Auth.js configuration
│   │   ├── prisma.ts              # Prisma client + safe mock fallback when DB is offline
│   │   ├── storage.ts             # File validation & local/S3 storage helpers
│   │   ├── pdf/                   # PDF report generator & translations
│   │   └── validations/           # Zod schemas
│   └── services/gpsr/
│       ├── gpsr-validator.ts      # Core scoring & compliance evaluation engine
│       └── rules.ts               # Weighted GPSR rule definitions
└── tests/                         # Vitest unit tests (GPSR validator & PDF generation)
```

---

## Getting Started

### Prerequisites

- **Node.js 22+** and **npm**
- **PostgreSQL** (optional for local UI preview — the app falls back to an in-memory/mock Prisma proxy when `DATABASE_URL` is unset)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gpsr_compliance
AUTH_SECRET=replace-with-32-char-random-secret
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Optional Object Storage (S3 / R2 / Supabase)
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=gpsr-documents
```

### 3. Initialize Database (when using PostgreSQL)

```bash
npm run db:generate
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts & Testing

```bash
npm run dev         # Start Next.js dev server on 0.0.0.0:3000
npm run build       # Generate Prisma client and build production bundle
npm run start       # Start production server on 0.0.0.0:3000
npm run lint        # Run ESLint
npm run typecheck   # Run TypeScript compiler checks (tsc --noEmit)
npm test            # Run Vitest unit test suite (12 tests)
```

---

## Routes Overview

| Section | Routes |
|---|---|
| **Public** | `/`, `/features`, `/pricing`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/disclaimer` |
| **Auth** | `/login`, `/register`, `/forgot-password` |
| **Dashboard** | `/dashboard`, `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]`, `/dashboard/products/[id]/check` |
| **Compliance & Ops** | `/dashboard/checks`, `/dashboard/reports`, `/dashboard/reports/[id]`, `/dashboard/documents`, `/dashboard/notifications`, `/dashboard/settings/profile` |
| **Admin** | `/admin`, `/admin/users`, `/admin/settings` |
| **API** | `/api/products`, `/api/products/[id]`, `/api/products/[id]/check`, `/api/checks`, `/api/reports`, `/api/reports/[id]/pdf`, `/api/documents`, `/api/documents/staged`, `/api/notifications` |

---

## Legal Notice

This software is intended solely as an automated **Listing Information Check** tool. Always consult qualified legal counsel for EU regulatory compliance decisions.
