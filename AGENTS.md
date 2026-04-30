# AGENTS.md

## Project

- **Name:** `admin-naturex` — Next.js 14 admin dashboard for a production/inventory management app ("Naturex")
- **Stack:** Next.js 14 (App Router) + React 18 + TypeScript + MUI v5 + Tailwind CSS 3
- **Auth:** next-auth v4 with OAuth (jose JWT), Bearer token forwarding to external API

## Commands

```
pnpm dev          # dev server (use this, packageManager is pinned to pnpm)
pnpm fast         # dev server with --turbo
pnpm build        # production build
pnpm start        # start production server
pnpm lint         # ESLint (next lint)
pnpm lint:fix     # ESLint with --fix
pnpm format       # Prettier on src/**/*.{js,jsx,ts,tsx}
pnpm build:icons  # compile Iconify icons → src/assets/iconify-icons/generated-icons.css
```

- `postinstall` runs `build:icons` automatically — icons regenerate on every `pnpm install`
- Playwright is installed but only has `tests/example.spec.ts`; no `test` script in package.json
- Run E2E tests manually: `npx playwright test`

## Architecture

### Routing (App Router)
- `src/app/(dashboard)/` — authenticated pages with full layout (sidebar, navbar, footer)
- `src/app/(blank-layout-pages)/` — pages without chrome (login, test)
- `src/app/(blank-layout-pages)/login` — login page; excluded from auth middleware
- Root `/` redirects to `/home` (see `next.config.mjs`)
- `next.config.mjs` sets `basePath` from env `BASEPATH` (empty in dev)

### Auth
- Middleware at `src/middleware.ts` uses `next-auth/middleware` with token expiry check
- Protected routes: everything except `/login`, `/test`, `/api/auth/*`, `/_next/static`, `/_next/image`, `/favicon.ico`, `/images/`
- Auth config: `src/lib/nextAuthOptions.ts`
- Auth endpoint: `src/app/api/auth/[...nextauth]/route.ts`
- Token expiry is checked in middleware using `token.tokenExpires` (epoch seconds)

### API layer (two clients)
- **Server-side:** `src/api/server.ts` — `ApiServer<T>(path, tags?)` uses native `fetch` with `getServerSession`, for RSC/Server Components. Returns JSON directly.
- **Client-side:** `src/api/instances.ts` — axios instance with `getSession()` interceptor; export `API()` to use it. Sends `ngrok-skip-browser-warning: "true"` header.
- Both forward `session.access_token` as Bearer header
- API modules in `src/api/` by domain: `feedstock/`, `formulation/`, `order/`, `product/`, `providers/`, `kardex/`, `packaging/`, `user/`, `role/`, `metadata/`, `general-parameters/`

### Key libraries
- **@tanstack/react-query** — client-side data fetching and caching
- **react-hook-form** + **@hookform/resolvers** + **yup** — form validation
- **@mui/x-data-grid** — data tables
- **@casl/ability** — permission/authorization system
- **react-hot-toast** — toast notifications (in root layout)
- **moment** — date handling

### Directory conventions
- `@core/*` → shared utilities, contexts, hooks, theme, styles, types
- `@layouts/*` → layout wrappers (VerticalLayout, HorizontalLayout)
- `@menu/*` → sidebar navigation menu system
- `@components/*` → shared UI components (Providers, layout parts, etc.)
- `@views/*` → page-specific view components
- `@configs/*` → theme and color configuration
- `src/configs/themeConfig.ts` — default theme settings
- `src/data/` — static data (menu, navigation)
- `src/utils/columns/` — MUI DataGrid column definitions (`GridColDef`)

### Page routes (dashboard)
| Route | Purpose |
|---|---|
| `/home` | Dashboard home |
| `/produccion/ordenes` | Production orders (list + create + detail) |
| `/produccion/aprovisionamiento` | Production supply (list + create + detail) |
| `/produccion/formulacion` | Formulation (list + detail) |
| `/inventario/materia-prima/listado` | Raw material inventory |
| `/inventario/producto-terminado/listado` | Finished product inventory |
| `/inventario/material-empaque/listado` | Packaging material inventory |
| `/finanzas-y-administracion/ordenes-de-venta` | Sales orders |
| `/finanzas-y-administracion/proveedores` | Suppliers |
| `/soporte/usuarios` | User management |
| `/soporte/roles` | Role management |
| `/soporte/parametros-generales` | General parameters |
| `/soporte/reportes` | Reports |
| `/perfil` | User profile |
| `/about` | About page |

## Styling conventions

- **Prettier:** single quotes, no semicolons, 120 char line width, no trailing commas, `arrowParens: avoid`, `jsxSingleQuote: true`
- **ESLint:** import order enforced (react first, then next, then external, then internal `@/`), blank lines between declarations; `@typescript-eslint/consistent-type-imports: error`, `@typescript-eslint/no-unused-vars: error`
- **ESLint disabled rules:** `react-hooks/rules-of-hooks`, `jsx-a11y/alt-text`, `react/display-name`, `react/no-children-prop`, `@next/next/no-img-element`, `@next/next/no-page-custom-font`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/ban-ts-comment`, `@typescript-eslint/no-non-null-assertion`
- **Stylelint:** enforces CSS logical properties (e.g. `margin-inline` not `margin-left`) via `stylelint-use-logical-spec`
- **Tailwind:** `preflight: false` (MUI provides reset); `important: '#__next'`; uses `tailwindcss-logical` plugin + `@core/tailwind/plugin`
- **MUI + Tailwind coexist:** MUI for components, Tailwind for utilities and layout
- **PostCSS:** tailwind/nesting/autoprefixer (standard)

## VS Code conventions

- `formatOnSave: true` — Prettier formats on save
- `source.fixAll.eslint` and `source.fixAll.stylelint` run on save
- `files.insertFinalNewline: true`
- `typescript.tsdk` points to local `node_modules/typescript/lib`

## Key quirks

- **Iconify icons:** custom build step — icons are compiled from `src/assets/iconify-icons/bundle-icons-css.ts` into CSS. Run `pnpm build:icons` or `pnpm install` to regenerate.
- **ngrok skip header:** axios instance sends `ngrok-skip-browser-warning: "true"` — API is served via ngrok dev tunnel
- **Env vars:** `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL` both set in `.env`; the API is on an external ngrok URL
- **`.env` has placeholder `BASEPATH`** (empty) and a dummy `NEXTAUTH_SECRET` — these are dev-only values
- **Root layout** uses `#__next` as the HTML element id (matches Tailwind `important`)
- **No unit test framework** — only Playwright for E2E, and only a placeholder spec exists
- **Playwright config** runs on chromium, firefox, and webkit; no `webServer` configured
- **package.json** has `resolutions` and `overrides` for `rimraf@^5.0.7`
