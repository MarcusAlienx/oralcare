# A&E OralCare — Centro de Odontología Especializada

Sitio web premium para clínica dental ubicada en Zapopan, Guadalajara, México. Construido como monorepo fullstack con React + Vite en el frontend, Express 5 en el backend, PostgreSQL con Drizzle ORM, y un chat de IA integrado via OpenAI SSE streaming.

---

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Base de Datos](#4-base-de-datos)
5. [API — Endpoints del Backend](#5-api--endpoints-del-backend)
6. [Frontend — Páginas y Componentes](#6-frontend--páginas-y-componentes)
7. [Sistema de Diseño](#7-sistema-de-diseño)
8. [Chat de IA](#8-chat-de-ia)
9. [Panel de Administración](#9-panel-de-administración)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Comandos Clave](#11-comandos-clave)
12. [Configuración Local (IDE)](#12-configuración-local-ide)
13. [Flujo de Codegen (OpenAPI → Hooks)](#13-flujo-de-codegen-openapi--hooks)
14. [Gotchas y Reglas Críticas](#14-gotchas-y-reglas-críticas)

---

## 1. Arquitectura General

```
Browser / Mobile
       │
       ▼
┌─────────────────────────────────┐
│   React + Vite SPA              │
│   artifacts/oralcare            │
│   Puerto dinámico (PORT env)    │
│   Preview path: /               │
└────────────┬────────────────────┘
             │ fetch → /api/*
             ▼
┌─────────────────────────────────┐
│   Express 5 API Server          │
│   artifacts/api-server          │
│   Puerto 8080                   │
│   Preview path: /api            │
└────────────┬────────────────────┘
             │ Drizzle ORM
             ▼
┌─────────────────────────────────┐
│   PostgreSQL (Replit managed)   │
│   DATABASE_URL env variable     │
│   4 tablas activas              │
└─────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   OpenAI (via Replit AI         │
│   Integrations Proxy)           │
│   Modelo: gpt-5-mini            │
│   SSE streaming                 │
└─────────────────────────────────┘
```

Este es un monorepo gestionado con **pnpm workspaces**. Los paquetes se comunican entre sí como dependencias de workspace (`@workspace/*`).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime | Node.js | 24 |
| Package Manager | pnpm | 10.x |
| Lenguaje | TypeScript | ~5.9.2 |
| Frontend Framework | React | 19.1.0 |
| Bundler Frontend | Vite | ^7.3.2 |
| CSS | Tailwind CSS | ^4.1.14 |
| Animaciones | Framer Motion | ^12.23.24 |
| Routing (SPA) | Wouter | ^3.3.5 |
| UI Components | Radix UI + shadcn/ui | varios |
| Iconos | Lucide React | ^0.545.0 |
| SEO | react-helmet-async | ^3.0.0 |
| Backend Framework | Express | ^5 |
| ORM | Drizzle ORM | ^0.45.2 |
| DB Driver | pg (node-postgres) | ^8.20.0 |
| Validación | Zod | ^3.25.76 |
| API Contract | OpenAPI 3.1 (YAML) | — |
| Codegen | Orval | ^8.5.2 |
| HTTP Client (gen) | TanStack React Query | ^5.90.21 |
| Logger | Pino + pino-http | ^9/^10 |
| Build Backend | esbuild | 0.27.3 |
| IA Chat | OpenAI API (proxy Replit) | gpt-5-mini |
| Fechas | date-fns | ^3.6.0 |
| Gráficas | Recharts | ^2.15.2 |

---

## 3. Estructura del Proyecto

```
/ (raíz del workspace)
├── pnpm-workspace.yaml          # Define packages: artifacts/*, lib/*, scripts
├── pnpm-lock.yaml
├── package.json                 # Scripts globales: typecheck, build
├── tsconfig.base.json           # Config TypeScript base compartida
├── tsconfig.json                # Referencias a todos los lib/*
│
├── artifacts/
│   ├── oralcare/                # Frontend SPA — A&E OralCare landing page
│   │   ├── package.json         # @workspace/oralcare
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── components.json      # shadcn/ui config
│   │   ├── index.html
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   ├── opengraph.jpg
│   │   │   └── images/
│   │   │       ├── hero.png           # Hero section background
│   │   │       ├── about.png          # Nosotros section image
│   │   │       ├── service-ortho.png  # Servicio: Ortodoncia
│   │   │       ├── service-implants.png # Servicio: Implantes
│   │   │       ├── service-whitening.png # Servicio: Blanqueamiento
│   │   │       ├── patient_1.jpg      # Testimonio 1
│   │   │       ├── patient_2.jpg      # Testimonio 2
│   │   │       ├── patient_3.jpg      # Testimonio 3
│   │   │       ├── team-1.jpg         # Doctor 1 (backup)
│   │   │       └── team-2.jpg         # Doctor 2 (backup)
│   │   └── src/
│   │       ├── App.tsx               # Root: QueryClient, Router, HelmetProvider
│   │       ├── main.tsx              # React DOM render entry
│   │       ├── index.css             # Tailwind + variables CSS + Google Fonts
│   │       ├── lib/utils.ts          # cn() helper (clsx + tailwind-merge)
│   │       ├── pages/
│   │       │   ├── home.tsx          # Landing page completa (todas las secciones)
│   │       │   ├── admin.tsx         # Panel de administración (/admin)
│   │       │   └── not-found.tsx     # Página 404
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Navbar.tsx    # Navbar sticky con scroll detection
│   │       │   │   └── Footer.tsx    # Footer con links y datos de contacto
│   │       │   ├── chat/
│   │       │   │   └── ChatWidget.tsx # Widget de chat IA flotante (SSE)
│   │       │   └── ui/               # ~40 componentes shadcn/ui
│   │       └── hooks/
│   │           ├── use-toast.ts
│   │           └── use-mobile.tsx
│   │
│   └── api-server/              # Backend Express 5
│       ├── package.json         # @workspace/api-server
│       ├── tsconfig.json
│       ├── build.mjs            # Script build esbuild (ESM bundle)
│       └── src/
│           ├── index.ts         # Entry point: puerto, señales
│           ├── app.ts           # Express app: middlewares, cors, rutas
│           ├── lib/
│           │   └── logger.ts    # Pino logger config
│           └── routes/
│               ├── index.ts     # Router principal (monta todos)
│               ├── health.ts    # GET /api/healthz
│               ├── leads.ts     # GET/POST /api/leads, PATCH /api/leads/:id
│               ├── admin.ts     # GET /api/admin/stats, POST /api/admin/track-visit
│               └── openai/
│                   └── conversations.ts # Todas las rutas de chat IA + SSE
│
├── lib/
│   ├── db/                      # Paquete: @workspace/db
│   │   ├── package.json
│   │   ├── drizzle.config.ts    # Config Drizzle Kit (push/migrate)
│   │   └── src/
│   │       ├── index.ts         # export { db, pool } + re-export schema
│   │       └── schema/
│   │           ├── index.ts     # Barril: exporta todas las tablas
│   │           ├── conversations.ts
│   │           ├── messages.ts
│   │           ├── leads.ts
│   │           └── pageVisits.ts
│   │
│   ├── api-spec/                # Paquete: @workspace/api-spec
│   │   ├── openapi.yaml         # Contrato OpenAPI 3.1 — FUENTE DE VERDAD
│   │   ├── orval.config.ts      # Config Orval: genera api-client-react y api-zod
│   │   └── package.json         # Script: codegen (orval + fix index + typecheck)
│   │
│   ├── api-client-react/        # Paquete: @workspace/api-client-react (generado)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts         # Re-exporta generated/api + custom-fetch utils
│   │       ├── custom-fetch.ts  # fetch wrapper: maneja base URL y auth tokens
│   │       └── generated/
│   │           └── api.ts       # Hooks React Query + funciones fetch (AUTO-GENERADO)
│   │
│   ├── api-zod/                 # Paquete: @workspace/api-zod (generado)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts         # Solo: export * from "./generated/api"
│   │       └── generated/
│   │           └── api.ts       # Schemas Zod para validación (AUTO-GENERADO)
│   │
│   ├── integrations-openai-ai-server/  # Paquete: OpenAI server utils
│   │   ├── src/
│   │   │   ├── client.ts        # openai = new OpenAI(Replit proxy)
│   │   │   ├── batch/utils.ts   # Batch processing con rate limiting
│   │   │   ├── image/client.ts  # generateImageBuffer(), editImages()
│   │   │   └── audio/client.ts  # Audio helpers
│   │   └── package.json
│   │
│   └── integrations-openai-ai-react/   # Paquete: OpenAI react hooks
│       ├── src/audio/           # Hooks para audio/voz
│       └── package.json
│
└── scripts/
    ├── post-merge.sh            # Script post-merge para reconciliar entorno
    └── src/hello.ts
```

---

## 4. Base de Datos

### Motor
PostgreSQL 16.10, gestionado por Replit. Acceso via `DATABASE_URL` (env var).
ORM: **Drizzle ORM** con driver `pg`. Gestión de schema via `drizzle-kit push`.

### Diagrama de Relaciones

```
conversations (1) ──────< messages (N)
                          (conversation_id FK → cascade delete)

leads                    (independiente)
page_visits              (independiente)
```

### Schema SQL Completo

```sql
-- ==========================================
-- TABLA: conversations
-- Almacena conversaciones del chat de IA
-- ==========================================
CREATE TABLE public.conversations (
    id          INTEGER NOT NULL DEFAULT nextval('conversations_id_seq'),
    title       TEXT    NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

-- ==========================================
-- TABLA: messages
-- Mensajes dentro de cada conversación
-- role: 'user' | 'assistant' | 'system'
-- ==========================================
CREATE TABLE public.messages (
    id               INTEGER NOT NULL DEFAULT nextval('messages_id_seq'),
    conversation_id  INTEGER NOT NULL,
    role             TEXT    NOT NULL,
    content          TEXT    NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_conversations_id_fk
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);

-- ==========================================
-- TABLA: leads
-- Formulario de contacto / solicitudes de cita
-- status: 'nuevo' | 'contactado' | 'cita_agendada' | 'completado'
-- ==========================================
CREATE TABLE public.leads (
    id          INTEGER NOT NULL DEFAULT nextval('leads_id_seq'),
    name        TEXT    NOT NULL,
    email       TEXT,                           -- opcional
    phone       TEXT    NOT NULL,
    service     TEXT,                           -- opcional: ortodoncia, implantes, etc.
    message     TEXT,                           -- opcional
    status      TEXT    NOT NULL DEFAULT 'nuevo',
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- ==========================================
-- TABLA: page_visits
-- Tracking de visitas a la página
-- Se registra automáticamente al cargar el sitio
-- ==========================================
CREATE TABLE public.page_visits (
    id          INTEGER NOT NULL DEFAULT nextval('page_visits_id_seq'),
    page        TEXT    NOT NULL,               -- ej: "/"
    referrer    TEXT,                           -- opcional: URL de origen
    user_agent  TEXT,                           -- opcional: browser/device
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT page_visits_pkey PRIMARY KEY (id)
);
```

### Archivos Drizzle (source de verdad en TypeScript)

**`lib/db/src/schema/conversations.ts`**
```typescript
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**`lib/db/src/schema/messages.ts`**
```typescript
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),       // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**`lib/db/src/schema/leads.ts`**
```typescript
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),               // nullable
  phone: text("phone").notNull(),
  service: text("service"),           // nullable
  message: text("message"),           // nullable
  status: text("status").notNull().default("nuevo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**`lib/db/src/schema/pageVisits.ts`**
```typescript
export const pageVisits = pgTable("page_visits", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  referrer: text("referrer"),         // nullable
  userAgent: text("user_agent"),      // nullable
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### Comandos de Base de Datos

```bash
# Sincronizar schema (desarrollo) — NO genera migraciones, aplica directo
pnpm --filter @workspace/db run push

# Forzar push si hay conflictos no destructivos
pnpm --filter @workspace/db run push-force
```

---

## 5. API — Endpoints del Backend

Base URL: `/api` (proxy via Replit en desarrollo, `/api` en producción)

### Health

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/healthz` | Health check del servidor |

**Response:**
```json
{ "status": "ok" }
```

---

### Chat IA (OpenAI SSE)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/openai/conversations` | Listar todas las conversaciones |
| POST | `/api/openai/conversations` | Crear nueva conversación |
| GET | `/api/openai/conversations/:id` | Obtener conversación + mensajes |
| DELETE | `/api/openai/conversations/:id` | Eliminar conversación |
| GET | `/api/openai/conversations/:id/messages` | Listar mensajes |
| POST | `/api/openai/conversations/:id/messages` | **Enviar mensaje (SSE streaming)** |

**SSE Streaming** — `POST /api/openai/conversations/:id/messages`:
- Content-Type: `text/event-stream`
- Cada chunk: `data: {"content": "texto parcial"}\n\n`
- Finalización: `data: {"done": true}\n\n`

**System Prompt del Asistente:**
```
Eres la asistente dental de A&E OralCare en Zapopan, Guadalajara.
Eres directa, cálida y eficiente — tu objetivo es agendar citas.

REGLAS:
- Respuestas máximo 2-3 oraciones. Sin listas largas.
- Siempre dirige al paciente a agendar: llamar al (33) 3915.3838 o WhatsApp.
- Si preguntan precio, di que depende de la evaluación y ofrece valoración SIN COSTO.
- No repitas información que ya dijiste en el chat.

SERVICIOS: Ortodoncia (brackets/Invisalign), Implantes, Endodoncia, Carillas,
Blanqueamiento, Odontopediatría, Rehabilitación Oral.
HORARIO: Lun-Vie 9-19h, Sáb 9-14h.
UBICACIÓN: Av. Guadalupe 5787, Zapopan.
```

---

### Leads (Formulario de contacto)

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| GET | `/api/leads` | — | Listar todos los leads (más reciente primero) |
| POST | `/api/leads` | `CreateLeadBody` | Crear nuevo lead desde formulario |
| PATCH | `/api/leads/:id` | `UpdateLeadStatusBody` | Actualizar status del lead |

**`CreateLeadBody`:**
```typescript
{
  name: string;           // requerido
  phone: string;          // requerido
  email?: string;         // opcional
  service?: string;       // opcional: "ortodoncia" | "implantes" | etc.
  message?: string;       // opcional
}
```

**`UpdateLeadStatusBody`:**
```typescript
{
  status: string;  // "nuevo" | "contactado" | "cita_agendada" | "completado"
}
```

---

### Admin / Analytics

| Método | Ruta | Body | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/stats` | — | Dashboard: stats, leads recientes, gráfica 7 días |
| POST | `/api/admin/track-visit` | `TrackVisitBody` | Registrar visita de página |

**`TrackVisitBody`:**
```typescript
{
  page: string;        // requerido: ej "/" 
  referrer?: string;   // opcional
}
```

**`AdminStats` Response:**
```typescript
{
  totalLeads: number;
  newLeadsToday: number;
  totalVisits: number;
  visitsToday: number;
  totalConversations: number;
  conversionRate: number;           // porcentaje conversaciones/leads
  leadsByService: Array<{ service: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  recentLeads: Lead[];              // últimos 10
  visitsLast7Days: Array<{ date: string; count: number }>;
}
```

---

## 6. Frontend — Páginas y Componentes

### Rutas SPA (Wouter)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `pages/home.tsx` | Landing page completa del sitio público |
| `/admin` | `pages/admin.tsx` | Panel de administración (no linkado públicamente) |
| `*` | `pages/not-found.tsx` | Página 404 |

---

### `pages/home.tsx` — Landing Page

Componente principal con todas las secciones. ~612 líneas. Hace uso de:
- `useCreateLead` — para enviar el formulario de contacto al backend
- `useTrackVisit` — registra la visita automáticamente en `useEffect`
- `useScroll`, `useTransform` — parallax en imagen hero
- `useInView` — trigger de animaciones al hacer scroll

**Secciones en orden:**

#### Hero
- Imagen de fondo: `/images/hero.png` con gradiente blanco-transparente
- Parallax: imagen se mueve 200px sobre rango de 1000px scroll
- Blobs animados: 3 círculos con `framer-motion` en movimiento lento (opacidad 10-15%)
- Botón CTA con efecto shimmer (gradiente animado vía CSS `@keyframes`)
- Badge superior, H1 con serif italic, subtítulo, dos botones

#### Nosotros (About)
- Grid 2 columnas: imagen izquierda, texto derecho
- Imagen `/images/about.png` con bordes redondeados y shadow
- Lista de 4 diferenciadores con checkmarks
- Estadísticas animadas debajo: 15+ años, 5000+ pacientes, 98% satisfacción, 6 especialidades

#### Servicios
- Grid 3 columnas (md: 2, lg: 3)
- Cada tarjeta: imagen, gradiente negro inferior, título, descripción, link "Consultar"
- Click en tarjeta abre **Dialog modal** con:
  - Nombre del servicio
  - Descripción detallada
  - Lista de beneficios (3-4 items)
  - Duración estimada
  - Botón "Agendar Cita" → scroll a #contacto

**Servicios incluidos:**
```
1. Ortodoncia      — brackets/Invisalign, 12-24 meses, tecnología 3D
2. Implantes       — titanio médico, 3 fases, >20 años duración
3. Blanqueamiento  — gel alta concentración, hasta 8 tonos, 60 min
4. Endodoncia      — indoloro con anestesia, 1-2 sesiones
5. Carillas        — porcelana ultrafina, diseño digital, cambio inmediato
6. Odontopediatría — niños, selladores, flúor, primera visita gratis
```

#### Equipo
- Grid 3 columnas
- Fotos circulares con border blanco y shadow
- Nombre, especialidad, institución educativa
- Tooltip "Ver perfil" (Radix Tooltip) con datos adicionales

**Equipo actual:**
```
Dr. Alejandro Estrada  — Director y Cirujano Oral, U. de Guadalajara
Dra. Ana Ibáñez        — Ortodoncista Certificada, Invisalign Provider
Dr. Carlos Muñoz       — Especialista en Implantología, Máster Europa
```
Fotos desde Unsplash (URLs externas en producción).

#### Testimonios
- Fondo `slate-950` con blobs de luz primary/secondary
- 3 tarjetas glassmorphism con estrellas, cita, foto y nombre del paciente
- Pacientes: María Fernanda López, Juan Pablo Sánchez, Sofía Hernández

#### Contacto
- Grid 2 columnas: info izquierda, formulario derecho
- Info: teléfono, dirección, horarios
- Botones de navegación: Google Maps y Waze (links externos)
- Mapa embebido: iframe Google Maps (Av. Guadalupe 5787, Zapopan)
- **Formulario** conectado a backend:
  - Campos: Nombre\*, Teléfono\*, Email, Servicio (select), Mensaje
  - Submit → `useCreateLead.mutateAsync()` → `POST /api/leads`
  - Toast de éxito o error

#### WhatsApp Button
- Posición fija bottom-right, z-index 40
- Color `#25D366` (WhatsApp green)
- Href: `https://wa.me/523339153838`

---

### `pages/admin.tsx` — Panel de Control

Dashboard interno. Acceso en `/admin`. No aparece en Navbar público.

**Componentes:**
- Enlace "Volver al sitio" en header
- 5 tarjetas de estadísticas: Leads Totales, Leads Hoy, Visitas Totales, Visitas Hoy, Chats
- Gráfica de barras CSS (últimos 7 días de visitas, normalizada)
- Tabla de leads con:
  - Columnas: Contacto (nombre+teléfono), Servicio/Mensaje, Fecha, Estado
  - Select por fila para cambiar status (usa `useUpdateLeadStatus` mutation)
  - Colores por status: azul=nuevo, amarillo=contactado, púrpura=cita_agendada, verde=completado

**Hooks usados:**
```typescript
useGetAdminStats()    // GET /api/admin/stats
useListLeads()        // GET /api/leads
useUpdateLeadStatus() // PATCH /api/leads/:id
```

---

### `components/layout/Navbar.tsx`

Navbar fija con detección de scroll:
- **Al tope** (< 50px scroll): fondo transparente, texto `slate-800/900` (oscuro)
- **Scrolled** (≥ 50px): `bg-white/90 backdrop-blur`, sombra ligera, texto `slate-700`
- Menú móvil con toggle (hamburger/X)
- Links: Inicio, Nosotros, Servicios, Equipo, Testimonios, Contacto
- Botón "Agendar Cita" que hace scroll suave a `#contacto`
- Teléfono con icono Phone

**Nota crítica:** El hero tiene gradiente desde blanco en el lado izquierdo, por eso el texto del nav debe ser oscuro cuando está en la parte superior, NO blanco.

---

### `components/chat/ChatWidget.tsx`

Chat flotante de IA en esquina inferior derecha.
- Botón toggle (chat icon)
- Ventana expandible: header, área de mensajes, input
- Crea conversación via `POST /api/openai/conversations`
- Envía mensajes y recibe respuesta vía SSE streaming
- Muestra tokens en tiempo real mientras el modelo responde
- Markdown rendering básico

---

### `components/layout/Footer.tsx`

Footer con:
- Logo y descripción de la clínica
- Links de navegación
- Datos de contacto (teléfono, dirección, email)
- Horarios: Lun-Vie 9:00-19:00, Sáb 9:00-14:00
- Copyright

---

## 7. Sistema de Diseño

### Tipografía

```css
/* index.css — DEBE estar PRIMERO antes de @import "tailwindcss" */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap');
```

| Variable | Familia | Uso |
|----------|---------|-----|
| `font-sans` | Inter | Body, UI, labels |
| `font-serif` | Playfair Display | Títulos H1-H3, nombre logo |

### Colores Principales

```css
/* Configurados como HSL variables en :root */
--primary: azul clínico (hsl aprox 215 80% 40%)
--secondary: gold/amber accent
--background: blanco puro
--foreground: slate oscuro
```

Clases Tailwind usadas frecuentemente:
- `text-primary` — color azul clínico
- `text-secondary` — gold accent (estrellas testimonios)
- `bg-primary/10` — fondos ligeros para iconos
- `text-slate-900/700/600` — jerarquía de grises

### Animaciones (Framer Motion)

**`FadeInWhenVisible`** — componente wrapper:
```typescript
// Activa cuando el elemento entra en viewport (-100px margin)
initial={{ opacity: 0, y: 30, rotate: rotate ? 3 : 0 }}
animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : ...}
transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
```

**Parallax Hero:**
```typescript
const { scrollY } = useScroll();
const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
// Aplicado como style={{ y: y1 }} en la imagen
```

**Blobs animados en Hero:**
```typescript
animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.9, 1] }}
transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
```

**Shimmer en botones CTA:**
```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

### Componentes UI (shadcn/ui)

Todos los componentes viven en `src/components/ui/` y están configurados en `components.json`:
- `Button`, `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Input`, `Textarea`, `Select`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent`
- `Badge`
- `useToast`, `Toaster`
- Y ~30 más disponibles

---

## 8. Chat de IA

### Flujo Completo

```
1. Usuario abre ChatWidget
2. Si no hay conversationId → POST /api/openai/conversations { title: "Nueva consulta" }
3. Usuario escribe mensaje → POST /api/openai/conversations/:id/messages { content }
4. Server lee historial completo de mensajes para el contexto
5. Server hace request streaming a OpenAI (gpt-5-mini) via Replit AI proxy
6. Server hace pipe del stream como SSE → cliente recibe chunks parciales
7. Cada chunk: data: {"content": "..."}\n\n
8. Al final: data: {"done": true}\n\n
9. Server guarda el mensaje completo del asistente en la DB
```

### Variables de entorno de Gemini (Google GenAI)

Deben proveerse vía entorno para inicializar el cliente:
```
GEMINI_API_KEY=AIzaSy...
```

Se usan en `lib/integrations-openai-ai-server/src/client.ts`.

---

## 9. Panel de Administración

URL: `[dominio]/admin`

No está linkado en el navbar público. Para acceder, navegar directamente a `/admin`.

### Features
- Stats en tiempo real via React Query (auto-refetch)
- Gráfica de visitas últimos 7 días (CSS bars, no library)
- Tabla de leads con gestión de status via dropdown por fila
- Sin autenticación actualmente (se puede agregar)

### Agregar Autenticación al Admin

Para proteger `/admin`, se puede implementar un middleware simple en el backend o usar Clerk Auth. Ver skill de `clerk-auth` o `replit-auth` para opciones.

---

## 10. Variables de Entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Connection string PostgreSQL |
| `SESSION_SECRET` | Sí | Secret para sesiones Express |
| `PORT` | Sí | Puerto del servidor |
| `GEMINI_API_KEY` | Sí | API key para Google Gemini |
| `NODE_ENV` | Automática | "development" o "production" |

**Para desarrollo local:**
```bash
# .env (en artifacts/api-server/)
DATABASE_URL=postgresql://user:password@localhost:5432/oralcare
SESSION_SECRET=un_secreto_largo_y_seguro
PORT=8080
GEMINI_API_KEY=AIzaSy...
```

---

## 11. Comandos Clave

```bash
# === INSTALACIÓN ===
pnpm install

# === DESARROLLO ===
# Iniciar API server (puerto 8080)
pnpm --filter @workspace/api-server run dev

# Iniciar frontend (puerto env PORT)
pnpm --filter @workspace/oralcare run dev

# === CODEGEN (tras cambios en openapi.yaml) ===
pnpm --filter @workspace/api-spec run codegen
# Esto: 1) corre orval, 2) fija index.ts de api-zod y api-client-react, 3) typecheck

# === BASE DE DATOS ===
# Push schema a la DB (no genera migrations)
pnpm --filter @workspace/db run push

# Push forzado si hay conflictos no destructivos
pnpm --filter @workspace/db run push-force

# === TYPECHECK ===
# Solo libs compartidas
pnpm run typecheck:libs

# Typecheck completo (libs + todos los artifacts)
pnpm run typecheck

# === BUILD PRODUCCIÓN ===
pnpm run build

# Build solo del API server
pnpm --filter @workspace/api-server run build
```

---

## 12. Configuración Local (IDE)

### Requisitos previos
- Node.js >= 24
- pnpm >= 10 (`npm install -g pnpm`)
- PostgreSQL 16+ corriendo localmente (o usar Supabase/Neon)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd workspace

# 2. Instalar dependencias
pnpm install

# 3. Crear archivo de variables de entorno para el API server
cat > artifacts/api-server/.env << EOF
DATABASE_URL=postgresql://localhost/oralcare_dev
SESSION_SECRET=dev_secret_change_me_in_prod
PORT=8080
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-xxxxxxxxxxxx
NODE_ENV=development
EOF

# 4. Crear la base de datos
createdb oralcare_dev  # o via psql

# 5. Push del schema (crea todas las tablas)
pnpm --filter @workspace/db run push

# 6. Iniciar el API server
pnpm --filter @workspace/api-server run dev
# → http://localhost:8080/api/healthz debe responder

# 7. En otra terminal, iniciar el frontend
PORT=5173 pnpm --filter @workspace/oralcare run dev
# → http://localhost:5173

# 8. (Opcional) Regenerar código si cambia el schema de API
pnpm --filter @workspace/api-spec run codegen
```

### Configurar Vite para apuntar al backend local

En `artifacts/oralcare/vite.config.ts`, si hay un proxy configurado, verificar que apunte a `http://localhost:8080`. Si no, las llamadas a `/api/*` necesitan ese proxy en dev:

```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

### Recomendaciones de IDE

- **VSCode**: Instalar extensiones TypeScript, Tailwind CSS IntelliSense, ESLint
- **WebStorm / IntelliJ**: Soporta monorepos pnpm nativamente
- Usar "Open Workspace" desde la raíz para que TypeScript encuentre todos los paths

---

## 13. Flujo de Codegen (OpenAPI → Hooks)

El contrato de la API vive en `lib/api-spec/openapi.yaml`. Cualquier cambio en la API debe seguir este flujo:

```
1. Editar lib/api-spec/openapi.yaml
        ↓
2. pnpm --filter @workspace/api-spec run codegen
        ↓
   ┌─────────────────────────────────────────────┐
   │  Orval genera automáticamente:              │
   │                                             │
   │  lib/api-client-react/src/generated/api.ts │
   │  → Hooks React Query: useGetX, useCreateX  │
   │  → Funciones fetch: getX(), createX()       │
   │                                             │
   │  lib/api-zod/src/generated/api.ts           │
   │  → Schemas Zod para validación de bodies   │
   └─────────────────────────────────────────────┘
        ↓
3. Script fija automáticamente:
   - lib/api-zod/src/index.ts
     (solo: export * from "./generated/api")
   - lib/api-client-react/src/index.ts
     (sin: export * from "./generated/api.schemas")
        ↓
4. tsc --build (typecheck de todos los libs)
        ↓
5. Implementar los endpoints en artifacts/api-server/src/routes/
6. Usar los hooks en artifacts/oralcare/src/
```

### Por qué el fix en los index.ts

Orval en modo `split` genera un barrel `index.ts` que intenta exportar `./generated/api.schemas` — un archivo que NO existe. El script de codegen corrige esto automáticamente después de que Orval corre.

---

## 14. Gotchas y Reglas Críticas

### Framer Motion
```typescript
// CORRECTO
import { motion, useInView, useScroll } from "framer-motion";

// INCORRECTO — no existe en este proyecto
import { motion } from "motion/react";
```

### react-helmet-async
```typescript
// CORRECTO — HelmetProvider ya está en App.tsx
import { Helmet } from "react-helmet-async";

// INCORRECTO
import { Helmet } from "react-helmet"; // no instalado
```

### Google Fonts en CSS
```css
/* index.css — el @import de fonts DEBE ser PRIMERO */
@import url('https://fonts.googleapis.com/...'); /* PRIMERO */
@import "tailwindcss";                            /* DESPUÉS */
```

### index.ts de libs generadas
Después de correr codegen, verificar que:
- `lib/api-zod/src/index.ts` solo tenga: `export * from "./generated/api";`
- `lib/api-client-react/src/index.ts` NO tenga la línea: `export * from "./generated/api.schemas";`

El script de codegen lo maneja automáticamente, pero si se corre `orval` a mano, se debe corregir manualmente.

### @types/node en integrations-openai-ai-server
El `tsconfig.json` de ese lib tiene `"typeRoots": ["../../node_modules/@types"]` para encontrar `@types/node` desde la raíz del workspace.

### TooltipProvider anidado
`TooltipProvider` ya está en `App.tsx` envolviendo todo. Si se usa `Tooltip` en un componente hijo, solo se necesita importar `Tooltip`, `TooltipTrigger`, `TooltipContent`. Se puede anidar un `TooltipProvider` adicional dentro de un componente y también funciona.

### Rutas API en custom-fetch.ts
El `customFetch` en `lib/api-client-react/src/custom-fetch.ts` maneja el `baseUrl`. En Replit, las rutas `/api/*` son rutas relativas que funcionan sin configuración adicional. Localmente, necesitas el proxy de Vite.

---

## Datos de Contacto de la Clínica

```
Clínica:    A&E OralCare — Centro de Odontología Especializada
Dirección:  Av. Guadalupe 5787, Jorge Álvarez del Castillo, Zapopan, Jalisco
Teléfono:   +52 (33) 3915.3838
WhatsApp:   https://wa.me/523339153838
Horario:    Lunes-Viernes 9:00-19:00 | Sábados 9:00-14:00
Google Maps: https://maps.google.com/maps?q=Av.+Guadalupe+5787+Zapopan+Jalisco
Waze:        https://waze.com/ul?q=Av.+Guadalupe+5787+Zapopan+Jalisco
```
