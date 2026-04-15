# Parkir Nyalira

**DISCLAIMER: This is still a Proof-of-Concept Work-in-Progress. Use at your own risk!**

Self-service parking ticketing and payment PWA using QRIS (Indonesian QR payment standard). Users scan a QR code or open a URL to pay for parking without attendant interaction.

## Features

- **Multi-location parking** — Multiple parking locations, each with own pricing, balance, and admins
- **License plate auto-detection** — Regex rules from DB infer vehicle type from plate format
- **Flexible pricing** — Per-location, per-vehicle-type. Supports flat hourly or fixed daily rates
- **QRIS payment** — QR code generation with placeholder implementation; webhook callback architecture ready for real provider
- **Approval codes** — 4-digit approval code + 4-digit timeout code, displayed as both numeric and QR
- **Admin dashboard** — Full management of locations, pricing, vehicle rules, transactions, and team
- **PWA** — Installable on mobile, mobile-first responsive design

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Turbopack)
- **Language**: [TypeScript](https://typescriptlang.org) (strict)
- **Database**: [PostgreSQL](https://postgresql.org) via [Prisma ORM](https://prisma.io)
- **Auth**: [Better Auth](https://better-auth.com) (GitHub OAuth + email/password)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Validation**: [Zod](https://zod.dev)
- **Package Manager**: [Bun](https://bun.sh)
- **Testing**: [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) + [jsdom](https://github.com/jsdom/jsdom)
- **UI Language**: Indonesian (Bahasa Indonesia)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [PostgreSQL](https://postgresql.org) >= 14
- Node.js >= 20

### Setup

```bash
# Clone the repo
git clone https://github.com/kamilersz/Parkir-Nyalira && cd Parkir-Nyalira

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and auth secrets

# Push database schema
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

```bash
bun run dev            # Start dev server (Turbopack)
bun run build          # Production build
bun run check          # Lint + typecheck
bun run db:generate    # Create & apply migration
bun run db:push        # Push schema without migration
bun run db:studio      # Prisma Studio GUI
bun run typecheck      # TypeScript check only
bun run lint           # ESLint only
bun run lint:fix       # ESLint auto-fix
bun run test           # Run tests (watch mode)
bun run test:run       # Run tests (single run)
bun run test:coverage  # Run tests with coverage
```

## Architecture

```
src/
├── app/
│   ├── (parking)/          # User-facing parking flow
│   │   └── parkir/[slug]/  # Location-specific parking pages
│   ├── (auth)/             # Login/register pages
│   ├── (admin)/            # Admin dashboard
│   │   └── admin/
│   ├── api/
│   │   ├── locations/      # Location lookup API
│   │   ├── tickets/        # Parking ticket APIs
│   │   ├── payments/       # Payment & webhook APIs
│   │   ├── admin/          # Admin APIs
│   │   └── user/           # User plate management
│   └── tiket/[id]/         # Ticket status page
├── server/
│   ├── db.ts               # Prisma client singleton
│   └── better-auth/        # Auth config
├── lib/
│   ├── qris.ts             # QRIS QR code generation
│   ├── pricing.ts          # Price calculation engine
│   ├── plates.ts           # License plate utils
│   ├── approval-code.ts    # Approval code generation
│   └── utils.ts            # Shared utilities
├── components/
│   ├── parking/            # Parking flow components
│   ├── admin/              # Admin dashboard components
│   └── ui/                 # shadcn/ui components
└── styles/
    └── globals.css
```

## User Flow

1. User scans QR code or opens `/parkir/[location-slug]`
2. Inputs license plate — vehicle type auto-detected from regex rules
3. Selects parking duration
4. Reviews price summary and taps "Bayar Sekarang"
5. QRIS QR code displayed — user scans with e-wallet/banking app
6. Payment confirmed via webhook — approval code generated
7. User shows approval code (numeric or QR) at exit

## Testing

```bash
bun run test:run       # Run all 183 tests
bun run test:coverage  # Run with coverage report
```

Test suite includes:

- **Unit tests** (72) — Pricing engine, license plate utils, approval codes, QRIS payload
- **API tests** (55) — Locations, tickets, payments webhook, admin CRUD, user plates
- **Component tests** (56) — Parking flow components, admin dashboard components

## Implementation Plans

See `plans/` directory for detailed feature breakdowns:

- `01.schema.md` — Database schema design
- `02.parking-flow.md` — User parking flow
- `03.pricing.md` — Pricing engine
- `04.payment-qris.md` — QRIS payment integration
- `05.admin-dashboard.md` — Admin dashboard
- `06.auth-user.md` — Auth & user features
- `07.pwa.md` — PWA configuration
