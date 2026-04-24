# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI Chat**: OpenAI via Replit AI Integrations (gpt-5-mini, SSE streaming)
- **Frontend**: React + Vite, Tailwind CSS v4, Framer Motion, react-helmet-async

## Artifacts

### `artifacts/oralcare` — A&E OralCare Landing Page
- **Preview path**: `/`
- **Description**: Premium landing page for A&E OralCare dental clinic in Zapopan, Guadalajara, Mexico
- **Sections**: Hero (parallax + animated blobs), Nosotros, Servicios (with modal popups), Equipo, Testimonios, Contacto (Google Maps embed + Waze/GMaps links)
- **Features**:
  - AI chat widget (OpenAI SSE streaming, concise appointment-focused)
  - WhatsApp floating button
  - Service card modals with detailed info (shadcn Dialog)
  - Contact form → saves leads to backend DB
  - Page visit tracking (auto on load)
  - Framer Motion: parallax hero, stagger+rotate service cards, animated background blobs, hero button shimmer
  - SEO/JSON-LD schema markup (Dentist type)
  - Admin panel hidden at `/admin`

### `artifacts/api-server` — API Server
- **Preview path**: `/api`
- **Routes**:
  - `/api/healthz` — health check
  - `/api/openai/conversations/*` — AI chat (SSE streaming)
  - `/api/leads` (GET, POST) — lead management
  - `/api/leads/:id` (PATCH) — update lead status
  - `/api/admin/stats` — dashboard analytics
  - `/api/admin/track-visit` — track page visits
- **Database tables**: `conversations`, `messages`, `leads`, `page_visits`

## Admin Panel
- URL: `/admin` (not linked in public nav)
- Shows: total leads, leads today, total visits, visits today, chat conversations
- Visits chart (last 7 days)
- Leads table with status management (nuevo → contactado → cita_agendada → completado)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec (also auto-fixes index.ts files)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Key Files

- `artifacts/oralcare/src/pages/home.tsx` — main landing page (all sections, services with modals, team, contact form)
- `artifacts/oralcare/src/pages/admin.tsx` — admin dashboard
- `artifacts/oralcare/src/components/chat/ChatWidget.tsx` — AI chat widget
- `artifacts/oralcare/src/components/layout/Navbar.tsx` — navigation bar (dark text at top, white when scrolled)
- `artifacts/api-server/src/routes/openai/conversations.ts` — AI chat routes + concise system prompt
- `artifacts/api-server/src/routes/leads.ts` — lead CRUD routes
- `artifacts/api-server/src/routes/admin.ts` — analytics + visit tracking routes
- `lib/db/src/schema/` — all DB schemas (conversations, messages, leads, pageVisits)
- `lib/api-spec/openapi.yaml` — OpenAPI contract

## Important Notes

- `lib/api-zod/src/index.ts` must only export from `./generated/api` (not api.schemas — file doesn't exist)
- `lib/api-client-react/src/index.ts` must NOT export from `./generated/api.schemas` (file doesn't exist)
- The codegen script auto-fixes both index files after orval runs
- Google Fonts @import must come BEFORE other @imports in index.css
- Use framer-motion (NOT motion/react) for animations
- Use react-helmet-async (NOT react-helmet) with HelmetProvider already in App.tsx

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
