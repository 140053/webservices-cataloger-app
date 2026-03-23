# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm dev          # Start development server
npm build        # Build production bundle
npm start        # Start production server
npm lint         # Run ESLint
```

There are no test commands configured. Docker deployment: `docker-compose up`.

## Architecture

This is a **Next.js 16 App Router** application for library cataloging, backed by a **FastAPI** service. It uses the `@/*` path alias mapped to `./src/*`. The React Compiler is enabled (`reactCompiler: true` in [next.config.ts](next.config.ts)).

### Backend Integration

All API calls go to a FastAPI backend. The URL differs by context:
- **Server actions / server components**: use `NODE_ENV_BACKEND_API` (`http://10.2.42.18:8001` in dev)
- **Client-side / Docker**: use `NEXT_PUBLIC_BACKEND_API` (`http://fastapi_app:8001`)

All authenticated requests send a JWT `Bearer` token in the `Authorization` header with `cache: "no-store"`.

### Auth Flow

- Login posts `FormData` credentials to `/auth/login` via the `loginAction` server action in [src/utils/auth.ts](src/utils/auth.ts), receives a JWT, and stores it in an HTTP-only cookie named `token`.
- [src/proxy.ts](src/proxy.ts) is the Next.js middleware that protects all `/dashboard/*` routes — it reads the `token` cookie, verifies with `JWT_SECRET`, and redirects unauthenticated users to `/login`. Note: the middleware exports a named function `proxy` (not default `middleware`) along with the `config` matcher.
- Client components fetch session data via the `useSession` hook ([src/hooks/useSession.ts](src/hooks/useSession.ts)), which calls the `/api/session` route handler ([src/app/api/session/route.ts](src/app/api/session/route.ts)) — this proxies to the backend's `/user/me` endpoint.
- Role type is `"ADMIN" | "STAFF" | "USER"` defined in [src/types/role.ts](src/types/role.ts).
- **Note**: [src/lib/auth-utils.ts](src/lib/auth-utils.ts) contains a legacy `getSession` that reads a `session` cookie (not `token`) and hardcodes `127.0.0.1:8001` — it is not used by the active auth flow.

### Dual Catalog System

The app has two distinct cataloging workflows:

1. **Simple Catalog** (`/dashboard/catalog/`) — single-step forms for Books, Serials Indices, and Theses. API utilities are in [src/utils/book.ts](src/utils/book.ts), which exports named `APIMaster*` functions (`APIMaster`, `APIMasterDataBook`, `APIMasterPutWithJSON`, `APIMasterDelete`, `APIMasterPostWithJSON`).

2. **FRBR Cataloging** (`/dashboard/cataloging/`) — structured multi-level bibliographic records following the FRBR model: **Works → Expressions → Manifestations → Items**. API utilities are in [src/utils/cataloging.ts](src/utils/cataloging.ts), which uses private `apiGet/apiPost/apiPut/apiDelete` helpers and exports typed functions per FRBR level. The wizard flow is in [src/components/Catalog/frbr/NewWorkWizard.tsx](src/components/Catalog/frbr/NewWorkWizard.tsx) (5 steps: Work → Agents & Subjects → Expression → Manifestation → Item).

### Key Directories

- `src/app/` — Next.js App Router pages; all dashboard pages live under `src/app/dashboard/`
- `src/components/Catalog/` — all catalog UI components; `frbr/` subdirectory for FRBR-specific components; `re-usable/Dialog/` for edit/view dialogs
- `src/components/ui/` — shadcn/ui component library (Radix Nova style, Tailwind CSS 4)
- `src/utils/` — API call functions (server actions); `book.ts` for simple catalog, `cataloging.ts` for FRBR
- `src/hooks/` — client-side React hooks (`useSession`, `use-mobile`)

### UI Stack

- **shadcn/ui** with Radix Nova style — add components via `pnpm dlx shadcn@latest add <component>`
- **Tailwind CSS 4** with CSS variables
- **TanStack React Table** for data tables
- **Zod** for form validation
- **Sonner** for toast notifications
- **next-themes** for dark/light mode
- **Recharts** for dashboard charts
- **@dnd-kit** for drag-and-drop interactions
- **jsPDF + jspdf-autotable** for PDF export
