# AGENTS.md

## Project

- **Name:** `admin-naturex` — Next.js 14 (App Router) + React 18 + TypeScript + MUI v5 + Tailwind 3 admin dashboard
- **Purpose:** Naturex production & inventory management: feedstock / finished product / packaging inventories, production & supply orders, formulations, sale orders, providers, users & roles, system parameters, CIF costs and product cost estimates
- **Auth:** next-auth v4 credentials provider (`dni` + `documentType` + `password`), `jose` JWT; Bearer token forwarded to external API
- **Package manager:** `pnpm` pinned v10.30.0 (`package.json:packageManager`)

## Commands

```
pnpm dev            # dev server
pnpm fast           # dev server with --turbo
pnpm build / start  # production build / serve
pnpm lint / lint:fix
pnpm format         # Prettier on src/**/*.{js,jsx,ts,tsx}
pnpm test           # vitest watch
pnpm test:run       # vitest CI (single run)
pnpm test:coverage  # vitest with v8 coverage
pnpm build:icons    # compile Iconify icons (also runs on postinstall)
pnpm doctor         # react-doctor: lint / a11y / bundle / architecture scan
```

- Single unit test: `pnpm vitest run src/views/__tests__/Login.test.tsx` (watch: `pnpm vitest <file>`, filter: `pnpm vitest run -t "<name>"`)
- Single E2E: `pnpm exec playwright test tests/example.spec.ts` (placeholder only — no real domain E2E coverage)
- Type-check: `npx tsc --noEmit`
- CI (`.github/workflows/ci.yml`): `pnpm install --frozen-lockfile` → `build:icons` → `lint` → `test:run` (Node 20, branches `main`/`develop`)

## Routing & auth

- `src/app/(dashboard)/` — authenticated pages; `src/app/(blank-layout-pages)/` — login/test; `/` redirects to `/home` (`next.config.mjs`)
- `src/middleware.ts` — `withAuth`, rejects when `token.error` or `Date.now()/1000 > token.tokenExpires`; matcher excludes `login`, `test`, `api/auth`, `_next/*`, `favicon.ico`, `images/`
- Auth config: `src/lib/nextAuthOptions.ts`. `authorize()` calls `authentication()` → JWT decoded with `decodeJwt`; session carries `access_token`, `user`, `permissions` (CASL tree), `role`, `tokenExpires`
- Session access: `getServerSession(authOptions)` in Server Components; `useSession()` from `next-auth/react` in Client Components

### Main routes

```
/home                              → dashboard
/produccion/ordenes                → production orders (crear, [id])
/produccion/aprovisionamiento      → supply orders (crear, [id])
/produccion/formulacion            → formulations (detail/[id])
/produccion/empaque                → packaging production
/inventario/materia-prima          → feedstock (listado, detail/[id])
/inventario/producto-terminado     → finished products (listado, detail/[id])
/inventario/material-empaque       → packaging material (listado, detail/[id])
/inventario/proveedores            → providers ([id])
/inventario/ordenes-de-venta       → sale orders ([id])
/finanzas-y-administracion/cif     → CIF costs ([periodId])
/finanzas-y-administracion/costos  → product cost estimates
/soporte/usuarios | roles | parametros-generales | reportes
/perfil
```

## API layer — three patterns

| Pattern | File | Use for |
|---------|------|---------|
| **Server GET** | `src/api/<domain>/server.ts` | Server Components — `apiFetch` (fetch + `getServerSession` + 15s timeout + `next.tags`); catch → return `null`/fallback, never throw to UI |
| **Client (axios)** | `src/api/instances.ts` | Client Components — `API()` with `getSession()` interceptor + `ngrok-skip-browser-warning: true` |
| **Server Actions** | `src/api/<domain>/actions.ts` | Mutations — `"use server"` + `apiFetch` + `revalidateTag()`; return `{ success, error? }` |

- There is NO `src/api/server.ts` and NO `ApiServer` export — shared server helper is only `src/api/apiFetch.ts`
- Domains: `alert/ cif/ costs/ feedstock/ formulation/ general-parameters/ kardex/ metadata/ order/ packaging/ packing/ product/ providers/ role/ user/`
- Env (`API_BASE_URL` server-only, `NEXT_PUBLIC_API_BASE_URL` client, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_WS_URL`, `BASEPATH`); backend is an ngrok tunnel

## Data & mutations

- **New code:** Server Action + `await action()` inside `startTransition` (`useTransition` for pending); on success `toast.success()` + `reset()`; cache updates via `revalidateTag()` in the action
- **Legacy:** React Query v5 (`refetchOnWindowFocus: false, retry: 1`) — `useQuery`/`useMutation` hooks in `src/hooks/<domain>/`; on error `alertMessageErrors(error, msg)` from `src/utils/messages.ts`

## SSR / Suspense pattern

1. Fetch in `src/api/<domain>/server.ts` via `apiFetch` (not axios/raw fetch)
2. Fallback is `<Loader type='component' />` from `@/@core/components/react-spinners`
3. Simple page: `async` page + one client component. Multiple fetches: sync page + inner `async DataFetcher()` in `<Suspense>`
4. List components take `initialData` (no React Query hook); filters/tabs via URL `searchParams` + `router.replace()` (never `push` or client state)

## Permissions (CASL)

- Builder: `src/utils/ability.ts` — `role === 'admin'` → `can('manage', 'all')`; otherwise builds from the permissions tree in the session
- Hook: `useAbility()` from `src/hooks/casl/useAbility.ts`; typical check `ability.can(ACTION, SUBJECT, FIELD)`
- Constants in `src/utils/constant/`: `ABILITY_SUBJECT.FEEDSTOCK` = `'Materia prima'`, `ABILITY_SUBJECT.PRODUCT` = `'Producto terminado'`, `ABILITY_SUBJECT.PACKAGING` = `'Material de empaque'`, `ABILITY_SUBJECT.PRODUCTION` = `'Producción'`; `ABILITY_ACTIONS.READ/CREATE/UPDATE/DELETE`

## Directory map

```
src/
├── app/                    # App Router: (dashboard) / (blank-layout-pages)
├── api/<domain>/           # server.ts (GET) + actions.ts (mutations) per domain
├── hooks/<domain>/         # Legacy React Query hooks
├── views/pages/            # Business views: produccion/ inventario/ finanzas-y-administracion/ soporte/
├── components/             # Shared UI: layout/ provider/ theme/
├── @core/                  # Reusable core: mui wrappers, theme builder, contexts, hooks, tailwind plugin
├── @layouts/               # LayoutWrapper, Vertical/Horizontal/Blank layouts
├── @menu/                  # Navigation system (vertical/horizontal menus)
├── data/navigation/        # verticalMenuData.tsx, horizontalMenuData.tsx
├── types/pages/            # Types per domain; types/next-auth.d.ts augments Session
├── utils/                  # ability.ts, columns/, schemas/, defaultValues/, constant/, enum/, paths.ts, messages.ts, format.ts
├── configs/themeConfig.ts  # Global theme config (settings persisted in cookie)
├── lib/nextAuthOptions.ts  # next-auth config
├── assets/iconify-icons/   # Generated icon bundle
└── middleware.ts
```

## DataGrid columns

- Column definitions live in `src/utils/columns/*.tsx` (21 files: product, feedstock, packaging, formulation, order, orderSupply, saleOrder, supplier, user, movements, ...)
- Each exports a `columns(params)` factory; they call `useAbility()`/`useRouter()` internally — they are hooks, so they must be invoked in the component body, never conditionally
- Editable grids use `src/@core/components/mui/DataGridEdit.tsx` instead of the standard DataGrid

## Conventions

- **Aliases:** `@/*` → `src/*`, `@core/*` → `src/@core/*`, plus `@layouts @menu @assets @components @configs @views` → matching `src/` dirs. Note `@/@core/...` = `@/` alias + `@core` dir (real import, not a typo)
- **ESLint:** import order react → next → external → `@/` with blank lines between groups; `consistent-type-imports: error`; `no-unused-vars: error`
- **Prettier:** double quotes, semicolons, 120 width, no trailing commas, `arrowParens: avoid`, `jsxSingleQuote: true` (source of truth: `.prettierrc.json`)
- **Tailwind:** `preflight: false`, `important: '#__next'`; MUI for components, Tailwind for layout utilities; MUI CSS variables mapped to Tailwind via `src/@core/tailwind/plugin.ts`
- **Stylelint:** use logical props (`margin-inline`, not `margin-left`)
- **No nested HTML in `<Typography>`** — use `<Stack direction='row' spacing={1} alignItems='center'>` for icon+text
- **Info messages:** MUI `<Alert severity='info|warning|error'>`, not custom Box/Icon combos
- **Dates:** `CustomDatePicker` from `@/@core/components/react-datepicker` (values are `Date`; send as `moment(d).format('YYYY-MM-DD')`)
- **Forms:** react-hook-form + yup (`src/utils/schemas/`, defaults in `src/utils/defaultValues/`, `FormProvider` for multi-component forms); CASL checks via `useAbility()` + `ABILITY_SUBJECT/ACTIONS` constants
- **Icons:** add icon strings in `src/assets/iconify-icons/bundle-icons-css.ts`, then `pnpm build:icons`
- **Theme:** mode/skin/layout persisted in the `naturex-admin-settings` cookie via `useSettings()`
- **Tests:** vitest jsdom, setup `src/utils/tests/setup.ts`; unit tests co-located in `__tests__/`; `vitest.config.ts` excludes `tests/` (Playwright `testDir: ./tests`, no `baseURL`/`webServer`)
