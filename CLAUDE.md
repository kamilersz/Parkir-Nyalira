# Parkir Nyalira - Project Guidelines

## Overview

Self-service parking ticketing and payment PWA using QRIS (Indonesian QR payment standard).
Users scan a QR code or open a URL to pay for parking without attendant interaction.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Better Auth (GitHub OAuth + email/password)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Package Manager**: Bun
- **UI Language**: Indonesian (Bahasa Indonesia)

## Architecture

- **Multi-location**: Multiple parking locations, each with own pricing, balance, and admins
- **URL-based location**: `/parkir/[locationSlug]` — slug identifies the parking location
- **PWA**: Installable on mobile, offline-capable for viewing active tickets
- **QRIS Payment**: Placeholder implementation for now; webhook callback architecture ready for real provider

## Directory Structure

```
src/
├── app/
│   ├── (parking)/          # User-facing parking flow
│   │   └── parkir/[slug]/  # Location-specific parking pages
│   ├── (auth)/             # Login/register pages
│   ├── (admin)/            # Admin dashboard
│   │   └── admin/
│   ├── api/
│   │   ├── parking/        # Parking ticket APIs
│   │   ├── payments/       # Payment & webhook APIs
│   │   └── admin/          # Admin APIs
│   └── tiket/[id]/         # Ticket status page
├── server/
│   ├── db.ts               # Prisma client singleton
│   ├── better-auth/        # Auth config
│   ├── parking/            # Parking business logic
│   └── payments/           # Payment logic
├── lib/
│   ├── qris.ts             # QRIS QR code generation
│   ├── pricing.ts          # Price calculation engine
│   ├── plates.ts           # License plate utils
│   └── approval-code.ts    # Approval code generation
├── components/
│   ├── parking/            # Parking flow components
│   ├── admin/              # Admin dashboard components
│   └── ui/                 # shadcn/ui components
└── styles/
    └── globals.css
```

## Key Business Rules

- **License plate auto-detection**: Regex rules from DB infer vehicle type from plate format
- **Pricing**: Per-location, per-vehicle-type. Supports flat hourly or fixed daily (configurable)
- **Approval code**: 4-digit approval code + 4-digit timeout code. Displayed as both numeric and QR
- **Payment flow**: Create ticket → Generate QRIS → User pays → Webhook confirms → Generate approval code
- **Location balance**: Successful payments add to the location's balance

## Conventions

- Use `~/` path alias for `src/` imports
- Server-only code in `src/server/`, never import in client components
- Use React Server Components by default; client components only when needed (`"use client"`)
- API routes use Zod for request validation
- All monetary values stored as integers (Rp, no decimals)
- Use `@password1234` style password for dev seed data
- Follow existing file naming: kebab-case for files, PascalCase for components

## Commands

```bash
bun run dev          # Start dev server (Turbopack)
bun run build        # Production build
bun run check        # Lint + typecheck
bun run db:generate  # Create & apply migration
bun run db:push      # Push schema without migration
bun run db:studio    # Prisma Studio GUI
bun run typecheck    # TypeScript check only
bun run lint         # ESLint only
bun run lint:fix     # ESLint auto-fix
bun run test         # Run tests (watch mode)
bun run test:run     # Run tests (single run)
bun run test:coverage # Run tests with coverage
```

## Implementation Plans

See `plans/` directory for detailed feature breakdowns:

- `01.schema.md` — Database schema design
- `02.parking-flow.md` — User parking flow
- `03.pricing.md` — Pricing engine
- `04.payment-qris.md` — QRIS payment integration
- `05.admin-dashboard.md` — Admin dashboard
- `06.auth-user.md` — Auth & user features
- `07.pwa.md` — PWA configuration
