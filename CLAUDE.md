# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

There are no test commands configured. Docker deployment: `docker-compose up`.

## Architecture

This is a **Next.js 16 App Router** application for library cataloging, backed by a **FastAPI** service. It uses the `@/*` path alias mapped to `./src/*`.

### Backend Integration

All API calls go to a FastAPI backend. The URL differs by context:
- **Server actions / server components**: use `NODE_ENV_BACKEND_API` (`http://10.2.42.18:8001` in dev)
- **Client-side / Docker**: use `NEXT_PUBLIC_BACKEND_API` (`http://fastapi_app:8001`)

All authenticated requests send a JWT `Bearer` token in the `Authorization` header with `cache: "no-store"`.

### Auth Flow

- Login posts credentials to `/auth/login`, receives a JWT, stores it in an HTTP-only cookie via the `/api/session` route handler.
- [src/proxy.ts](src/proxy.ts) is the Next.js middleware that protects all `/dashboard/*` routes — it reads the cookie, verifies with `JWT_SECRET`, and redirects unauthenticated users to `/login`.
- [src/utils/auth.ts](src/utils/auth.ts) and [src/lib/auth-utils.ts](src/lib/auth-utils.ts) contain server actions for login/logout and reading session data.
- Role type is `"ADMIN" | "STAFF" | "USER"` defined in [src/types/role.ts](src/types/role.ts).

### Dual Catalog System

The app has two distinct cataloging workflows:

1. **Simple Catalog** (`/dashboard/catalog/`) — single-step forms for adding Books, Serials Indices, and Theses. API utilities are in [src/utils/book.ts](src/utils/book.ts) (generic GET/POST/PUT/DELETE wrappers).

2. **FRBR Cataloging** (`/dashboard/cataloging/`) — structured multi-level bibliographic records following the FRBR model (Works → Expressions → Manifestations → Items). API utilities are in [src/utils/cataloging.ts](src/utils/cataloging.ts). The wizard flow is in [src/components/Catalog/frbr/NewWorkWizard.tsx](src/components/Catalog/frbr/NewWorkWizard.tsx).

### Key Directories

- `src/app/` — Next.js App Router pages; all dashboard pages live under `src/app/dashboard/`
- `src/components/Catalog/` — all catalog UI components; `frbr/` subdirectory for FRBR-specific components
- `src/components/ui/` — shadcn/ui component library (Radix Nova style, Tailwind CSS 4)
- `src/utils/` — API call functions (server actions)
- `src/lib/` — shared server utilities

### UI Stack

- **shadcn/ui** with Radix Nova style — add components via `pnpm dlx shadcn@latest add <component>`
- **Tailwind CSS 4** with CSS variables
- **TanStack React Table** for data tables
- **Zod** for form validation
- **Sonner** for toast notifications
- **next-themes** for dark/light mode
- **jsPDF + jspdf-autotable** for PDF export
