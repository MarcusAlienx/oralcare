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
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion, react-helmet-async

## Artifacts

### `artifacts/oralcare` — A&E OralCare Landing Page
- **Preview path**: `/`
- **Description**: Full landing page for A&E OralCare dental clinic in Guadalajara, Mexico
- **Sections**: Hero, Nosotros, Servicios, Equipo, Testimonios, Contacto
- **Features**: AI chat widget (OpenAI SSE streaming), WhatsApp CTA, motion animations, SEO/JSON-LD

### `artifacts/api-server` — API Server
- **Preview path**: `/api`
- **Routes**: `/api/healthz`, `/api/openai/conversations/*`
- **Database tables**: `conversations`, `messages`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Key Files

- `artifacts/oralcare/src/pages/home.tsx` — main landing page content
- `artifacts/oralcare/src/components/chat/ChatWidget.tsx` — AI chat widget
- `artifacts/oralcare/src/components/layout/Navbar.tsx` — navigation bar
- `artifacts/oralcare/src/components/layout/Footer.tsx` — footer
- `artifacts/api-server/src/routes/openai/conversations.ts` — AI chat API routes
- `lib/db/src/schema/conversations.ts` — conversations table
- `lib/db/src/schema/messages.ts` — messages table

## Important Notes

- `lib/api-zod/src/index.ts` should only export from `./generated/api` (not types/ which causes duplicates)
- `lib/api-spec/orval.config.ts` — removed schemas option to prevent duplicate type generation
- Google Fonts @import must come BEFORE other @imports in index.css

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
