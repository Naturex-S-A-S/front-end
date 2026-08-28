# AGENTS.md

## Project

- **Name:** `admin-naturex` — Next.js 14 admin dashboard for production/inventory management
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript + MUI v5 + Tailwind CSS 3
- **Auth:** next-auth v4 (credentials provider, jose JWT), Bearer token forwarding to external API
- **Package manager:** `pnpm` (pinned v10.30.0, `auto-install-peers=true`, `shamefully-hoist=true`)

## Commands

```
pnpm dev          # dev server
pnpm fast         # dev server with --turbo
pnpm build        # production build
pnpm start        # serve production build
pnpm lint         # ESLint (next lint)
pnpm lint:fix     # ESLint with --fix
pnpm format       # Prettier on src/**/*.{js,jsx,ts,tsx}
pnpm test         # vitest (watch mode)
pnpm test:run     # vitest run (CI)
pnpm test:coverage# vitest with coverage
pnpm build:icons  # compile Iconify icons → src/assets/iconify-icons/generated-icons.css
pnpm doctor       # npx react-doctor@latest
```

- `postinstall` runs `build:icons` automatically
- Add icons by editing `src/assets/iconify-icons/bundle-icons-css.ts` then `pnpm build:icons`
- Type-check: `npx tsc --noEmit` (pnpm lint skips type-check due to ESLint cache EACCES)
- CI runs `build:icons` → `lint` → `test:run` (`.github/workflows/ci.yml`)

## Architecture

### Routing

- `src/app/(dashboard)/` — authenticated pages with full layout (sidebar, navbar, footer)
- `src/app/(blank-layout-pages)/` — pages without chrome (login, test)
- Root `/` redirects to `/home` (`next.config.mjs`)

### Auth

- `src/middleware.ts` — `withAuth` from `next-auth/middleware`, checks `token.tokenExpires` (epoch seconds)
- Protected routes: everything except `/login`, `/test`, `/api/auth/*`, `/_next/static`, `/_next/image`, `/favicon.ico`, `/images/`
- Auth config: `src/lib/nextAuthOptions.ts`
- Token payload: `access_token` (Bearer), `user`, `permissions` (CASL tree), `role`, `tokenExpires`

### API layer — three patterns

| Pattern | File | Use for |
|---------|------|---------|
| **Server GET** | `src/api/<domain>/server.ts` | Server Components — calls `apiFetch` (native fetch + `getServerSession` + 15s timeout + `next.tags`). Returns JSON or `[]` on error. |
| **Client (axios)** | `src/api/instances.ts` | Client Components — exports `API()` (axios instance with `getSession()` interceptor). Sends `ngrok-skip-browser-warning: true`. |
| **Server Actions** | `src/api/<domain>/actions.ts` | Mutations — `"use server"`, calls `apiFetch`, then `revalidateTag()`. Returns `{ success: boolean; error?: string }`. |

- Both server-side patterns forward `session.access_token` as Bearer
- `src/api/` modules: `feedstock/`, `formulation/`, `order/`, `product/`, `providers/`, `kardex/`, `packaging/`, `packing/`, `user/`, `role/`, `metadata/`, `general-parameters/`, `cif/`, `costs/`, `alert/`
- Shared infra: `src/api/apiFetch.ts` (generic `<T>` fetch, ISR tags, 15s timeout) and `src/api/server.ts`

### Key libraries

- **@tanstack/react-query** v5 — legacy client data fetching, used in existing pages
- **react-hook-form** v7 + **@hookform/resolvers** + **yup** v1 — form validation
- **@mui/x-data-grid** v7 — data tables
- **@casl/ability** v6 — authorization (permission tree from JWT)
- **react-hot-toast** + **sweetalert2** — notifications
- **moment** — date handling
- **react-datepicker** — date pickers via `CustomDatePicker`
- **@stomp/stompjs** — WebSockets (STOMP). Client via `useStomp` provider (`src/components/provider/useStomp`), destinations in `src/lib/stomp`

### Directory conventions

| Alias | Path |
|-------|------|
| `@/*` | `src/*` |
| `@core/*` | `src/@core/*` (shared utilities, contexts, hooks, theme, styles) |
| `@layouts/*` | `src/@layouts/*` (VerticalLayout, HorizontalLayout, BlankLayout) |
| `@menu/*` | `src/@menu/*` (sidebar/top navigation system) |
| `@components/*` | `src/components/*` (Providers, layout parts) |
| `@views/*` | `src/views/*` (page-specific view components) |
| `@configs/*` | `src/configs/*` (theme and color configuration) |
| `@assets/*` | `src/assets/*` |

## Styling conventions

- **Prettier:** double quotes, semicolons, 120 char width, no trailing commas, `arrowParens: avoid`, `jsxSingleQuote: true`
- **ESLint:** import order (react → next → external → `@/`), blank lines between declarations, `consistent-type-imports: error`, `no-unused-vars: error`
- **ESLint disabled rules:** `react-hooks/rules-of-hooks`, `jsx-a11y/alt-text`, `react/display-name`, `react/no-children-prop`, `@next/next/no-img-element`, `@next/next/no-page-custom-font`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/ban-ts-comment`, `@typescript-eslint/no-non-null-assertion`
- **Stylelint:** enforces CSS logical properties (`margin-inline` not `margin-left`) via `stylelint-use-logical-spec`
- **Tailwind:** `preflight: false` (MUI reset); `important: '#__next'`; `tailwindcss-logical` plugin + `@core/tailwind/plugin`
- **MUI + Tailwind:** MUI for components, Tailwind for utilities/layout
- **Typography:** Do NOT nest HTML inside `<Typography>`. Use `<Stack direction='row' spacing={1} alignItems='center'>` for inline icon+text alignment instead.
- **Informational messages:** Always use MUI `<Alert>` component (not custom Box/Icon/Typography combinations). Use `severity='info'` for general info, `severity='warning'` for warnings, and `severity='error'` for errors. The `icon` prop can be customized with Iconify icons.
- **Date pickers:** Use `CustomDatePicker` from `@/@core/components/react-datepicker` (not `<input type='date'>`). Accepts `control`, `errors`, `name`, `label`, optional `minDate`. Values are `Date` objects; convert with `moment().format("YYYY-MM-DD")` when sending to API.

## Mutations — two patterns

| Pattern | Where | Key calls |
|---------|-------|-----------|
| **React Query** (legacy) | Existing pages, Categories tab | `useMutation` + `queryClient.invalidateQueries(...)` |
| **Server Actions** (new) | New pages, Bodegas tab | `await action()` inside `startTransition(async () => {...})` |

- Server Actions use `useTransition` (not `useState`) for loading state
- On success: `toast.success()` + `reset()`. `revalidateTag()` inside the action updates the server cache automatically
- Import directly: `import { createWarehouse } from '@/api/general-parameters/actions'`

## SSR / Suspense Refactoring Pattern

When converting a page from Client Component (React Query) to Server Component:

1. Create `src/api/<domain>/server.ts` using `apiFetch` (not `ApiServer`, not axios, not raw fetch)
2. Use `<Loader type='component' />` from `@/@core/components/react-spinners` as Suspense fallback
3. Page can be **async** (simple case — single fetch + single client component). For pages with multiple independent fetches or sections, keep page **sync** with an inner `async function DataFetcher()` wrapped in `<Suspense>`.
4. List component accepts `initialData` prop (removes React Query hook)
5. Filters use URL `searchParams` — `router.replace()` (not `push`), read params as plain strings outside `useEffect`
6. Tabs use URL `searchParams` instead of client-side state — `page.tsx` renders conditionally, `tabs.tsx` is a navigation-only Client Component

## Testing

- **Unit tests:** vitest with jsdom + `@testing-library/react` + `@testing-library/jest-dom`
  - Setup: `src/utils/tests/setup.ts` (mocks `matchMedia`, `IntersectionObserver`, `ResizeObserver`)
  - Test files: `src/views/__tests__/Login.test.tsx`, `src/views/pages/soporte/inventario/materia-prima/create/__tests__/Create.test.tsx`, `src/@core/components/mui/__tests__/Button.test.tsx`
- **E2E:** Playwright (chromium, firefox, webkit), no `webServer` or `baseURL` configured. Run: `npx playwright test`

## Key quirks

- **Iconify icons:** custom build step from `src/assets/iconify-icons/bundle-icons-css.ts` → compiled CSS. Regenerate with `pnpm build:icons` or `pnpm install`.
- **ngrok skip header:** axios sends `ngrok-skip-browser-warning: true` — API is via ngrok dev tunnel
- **Env vars:** `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL` both set in `.env` (same ngrok URL)
- **`.env` BASEPATH** is empty (dev); `NEXTAUTH_SECRET` is a placeholder
- **Root layout** uses `<html id="__next">` (matches Tailwind `important`)
- **`package.json`** has `resolutions`/`overrides` for `rimraf@^5.0.7`
- **Theme** persisted in cookie `naturex-admin-settings` via `useSettings()` hook
- **Editable grids:** use `src/@core/components/mui/DataGridEdit.tsx` instead of standard DataGrid
