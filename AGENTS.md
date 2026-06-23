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

### API layer (three patterns)

- **Server-side (GET):** `src/api/<domain>/server.ts` — uses `apiFetch` helper (native `fetch` + `getServerSession` + timeout 15s + `next.tags`). For RSC/Server Components. Returns JSON directly.
- **Client-side (GET/Mutations):** `src/api/instances.ts` — axios instance with `getSession()` interceptor; export `API()` to use it. Sends `ngrok-skip-browser-warning: "true"` header.
- **Server Actions (Mutations):** `src/api/<domain>/actions.ts` — functions with `"use server"` directive. Used for POST/PUT/DELETE. Call `apiFetch` internally, then `revalidateTag()`. Return `ActionResult = { success: boolean; error?: string }`.
- Both server-side patterns forward `session.access_token` as Bearer header
- API modules in `src/api/` by domain: `feedstock/`, `formulation/`, `order/`, `product/`, `providers/`, `kardex/`, `packaging/`, `user/`, `role/`, `metadata/`, `general-parameters/`

### Key libraries

- **@tanstack/react-query** — client-side data fetching and caching (being superseded by Server Actions for mutations in new pages)
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

| Route                                         | Purpose                                    |
| --------------------------------------------- | ------------------------------------------ |
| `/home`                                       | Dashboard home                             |
| `/produccion/ordenes`                         | Production orders (list + create + detail) |
| `/produccion/aprovisionamiento`               | Production supply (list + create + detail) |
| `/produccion/formulacion`                     | Formulation (list + detail)                |
| `/inventario/materia-prima/listado`           | Raw material inventory                     |
| `/inventario/producto-terminado/listado`      | Finished product inventory                 |
| `/inventario/material-empaque/listado`        | Packaging material inventory               |
| `/finanzas-y-administracion/ordenes-de-venta` | Sales orders                               |
| `/finanzas-y-administracion/proveedores`      | Suppliers                                  |
| `/soporte/usuarios`                           | User management                            |
| `/soporte/roles`                              | Role management                            |
| `/soporte/parametros-generales`               | General parameters                         |
| `/soporte/reportes`                           | Reports                                    |
| `/perfil`                                     | User profile                               |
| `/about`                                      | About page                                 |

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

### Mutations — two patterns

| Pattern                  | When to use                    | Files                                     | Key calls                                            |
| ------------------------ | ------------------------------ | ----------------------------------------- | ---------------------------------------------------- |
| **React Query** (legacy) | Existing pages, Categories tab | `create.tsx`, `update.tsx`                | `useMutation` + `queryClient.invalidateQueries(...)` |
| **Server Actions** (new) | New pages, Bodegas tab         | `actions.ts` + `create.tsx`, `update.tsx` | `await action()`                                      |

---

## SSR / Suspense Refactoring Pattern

Use this recipe to convert a page from Client Component (React Query) to Server Component with Suspense streaming.

### 1. Create a server fetch function

File: `src/api/<domain>/server.ts`

```ts
import { apiFetch } from '@/api/apiFetch'
import type { I<Domain> } from '@/types/pages/<typePath>'

export async function get<Domain>Server(): Promise<I<Domain>[]> {
  try {
    return await apiFetch<I<Domain>[]>('<endpoint>', { tags: ['<domain>'] })
  } catch {
    return []
  }
}
```

**Rules:**

- Use `apiFetch` helper (not axios, not raw `fetch`, not `ApiServer` helper).
- `apiFetch` already handles auth via `getServerSession`, timeout (15s), and `tags`.
- Wrap in try/catch and return `[]` on failure — the list component handles empty state.
- The path alias is `@/api/...` not `@api/...`.
- Type the return with a generic or explicit type.

### 2. Loading fallback

Use `<Loader type='component' />` from `@/@core/components/react-spinners`:

File: `src/@core/components/react-spinners/index.tsx` (already exists)

```tsx
import { PulseLoader } from "react-spinners";
// renders a spinner centered in the container
```

**Rules:**

- Pure Client Component (uses `react-spinners`), but works as Suspense fallback.
- No need to create a custom skeleton — `Loader` already supports `type='page'` and `type='component'`.

### 3. Refactor the page

File: `src/app/(dashboard)/<route-path>/page.tsx`

```tsx
import { Suspense } from 'react'

import CustomBox from '@/@core/components/mui/Box'
import Create from '@/views/pages/<route-path>/create'
import List from '@/views/pages/<route-path>/list'
import { get<Domain>Server } from '@/api/<domain>/server'
import Loader from '@/@core/components/react-spinners'

export const metadata = {
  title: '...',
  description: '...'
}

const Page = () => {             // ← MUST be sync (no async)
  return (
    <CustomBox title='...'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <DataFetcher />
      </Suspense>
    </CustomBox>
  )
}

async function DataFetcher() {
  const data = await get<Domain>Server()
  return <List initialData={data} />
}

export default Page
```

**Rules:**

- `Page` MUST be sync (no `async`). Only the inner Server Component (`DataFetcher`) is async. An async page makes Next.js block the entire response until the page promise resolves, defeating Suspense streaming.
- Metadata (`title`, `description`) exported as static object — NOT using `generateMetadata`.
- The `Create` button renders immediately (even if it's a Client Component — it streams via SSR).
- `List` accepts `initialData` prop instead of calling `useGet<Domain>()` internally.
- Views path mirrors the route path under `src/views/pages/` (e.g., `finanzas-y-administracion/proveedores/`).

### 4. Modify the List component

File: `src/views/pages/<route-path>/list/index.tsx`

```diff
- import { useGet<Domain>() } from '@/api/<domain>'
+ // `initialData` is provided by the parent Server Component
- const { data } = useGet<Domain>()
- const rows = data || []
+ const rows = initialData || []
```

- Accept `initialData` prop (typed as the API response type).
- Remove React Query hook call.
- Keep `"use client"` if the component uses client hooks (`useRouter`, `useAbility`, etc.).
- Uses `CustomCard` + `CustomDataGrid` for layout.

### 5. Modify the Create component

File: `src/views/pages/<route-path>/create.tsx`

When migrating from React Query to Server Actions, remove the `invalidateQueries` call — the Server Action's `revalidateTag()` already handles cache invalidation and the router updates automatically on action completion.

```diff
- queryClient.invalidateQueries({ queryKey: ['<domain>'] })
```

- Keeps the form as a Client Component (uses `react-hook-form` + `yup`).

### 6. Filter with URL searchParams (SSR)

When a page has filters that were previously sent as API query params, use URL `searchParams` instead of client-side filtering:

File: `src/app/(dashboard)/<route-path>/page.tsx`

```tsx
const Page = ({ searchParams }: { searchParams?: { productId?: string; status?: string } }) => {
  return (
    <CustomBox title='...'>
      <Create />
      <Suspense fallback={<Loader type='component' />}>
        <DataFetcher searchParams={searchParams} />
      </Suspense>
    </CustomBox>
  );
};

async function DataFetcher({ searchParams }: { searchParams?: { productId?: string; status?: string } }) {
  const data = (await get) < Domain > Server(searchParams);
  return <List initialData={data} />;
}
```

File: `src/api/<domain>/server.ts` — function accepts params and builds query string:

```ts
export async function get<Domain>Server(
  params?: { productId?: string; status?: string }
): Promise<I<Domain>[]> {
  try {
    const sp = new URLSearchParams()
    if (params?.productId) sp.set('productId', params.productId)
    if (params?.status) sp.set('status', params.status)
    const qs = sp.toString()
    const data = await apiFetch<any[]>(`<endpoint>${qs ? `?${qs}` : ''}`, {
      tags: ['<domain>']
    })
    return data.map(r => ({ ...r, id: r.id || r.orderId }))
  } catch {
    return []
  }
}
```

File: `src/views/pages/<route-path>/list/filter.tsx` — a Client Component that reads/writes URL params:

```tsx
"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'

const Filter = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { control, handleSubmit, reset } = useForm({ defaultValues: { ... } })

  // Read URL params as plain strings OUTSIDE useEffect to avoid infinite re-renders
  const productIdParam = searchParams.get('productId')
  const statusParam = searchParams.get('status') || ''

  useEffect(() => {
    // sync form with URL on mount / param change
    reset({ product: findProduct(productIdParam), status: statusParam })
  }, [productIdParam, statusParam, /* data lists */, reset])

  const submit = (data: Filters) => {
    const params = new URLSearchParams()
    if (data?.product?.id) params.set('productId', String(data.product.id))
    if (data?.status) params.set('status', data.status)
    router.replace(`/ruta${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const clear = () => {
    reset({ product: null, status: '' })
    router.replace('/ruta')
  }

  return <form onSubmit={handleSubmit(submit)}>...</form>
}
```

**Rules:**

- Extract `searchParams` values to plain string variables **outside** `useEffect` and use those as deps. Using `searchParams` (the URLSearchParams object) as a dep causes infinite loops because it's a new reference on every render.
- The filter is still a Client Component (for interactivity and data hooks like product lists), but the main list data comes from the Server Component via `searchParams`.
- `router.replace` (not `push`) avoids adding history entries for every filter change.
- The `List` component receives pre-filtered `initialData` and has no filter state.

File: `src/views/pages/<route-path>/list/index.tsx` — simplified, no filter state:

```tsx
export default function List({ initialData }: Props) {
  return (
    <CustomCard>
      <Filter />
      <CustomDataGrid columns={colDefs} data={initialData} isLoading={false} />
    </CustomCard>
  );
}
```

### 7. Verification

```bash
npx tsc --noEmit     # type-check (pnpm lint fails due to ESLint cache EACCES)
pnpm format          # Prettier
pnpm dev             # manual smoke test — confirm fallback spinner appears immediately
```

### Pages converted so far

| Page                                          | Server fetch                           | Status                                                                            |
| --------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| `/home`                                       | inline                                 | Done                                                                              |
| `/produccion/empaque`                         | `src/api/packing/server.ts`            | Done                                                                              |
| `/finanzas-y-administracion/proveedores`      | `src/api/providers/server.ts`          | Done                                                                              |
| `/produccion/ordenes`                         | `src/api/order/server.ts`              | Done                                                                              |
| `/finanzas-y-administracion/ordenes-de-venta` | `src/api/order/server.ts`              | Done                                                                              |
| `/soporte/parametros-generales`               | `src/api/general-parameters/server.ts` | Done (Bodegas tab uses SSR + Server Actions; Categories tab stays on React Query) |

## Mutations with Server Actions

Use this pattern for new pages instead of React Query mutations. Works with `react-hook-form` + `yup`.

### 1. Create a server actions file

File: `src/api/<domain>/actions.ts`

```ts
'use server'

import { revalidateTag } from 'next/cache'
import { apiFetch } from '@/api/apiFetch'
import type { IPost<Domain>, IPut<Domain> } from '@/types/pages/<typePath>'

type ActionResult = { success: boolean; error?: string }

export async function create<Domain>(data: IPost<Domain>): Promise<ActionResult> {
  try {
    await apiFetch('<endpoint>', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    revalidateTag('<domain>')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function update<Domain>(id: string, data: IPut<Domain>): Promise<ActionResult> {
  try {
    await apiFetch(`<endpoint>/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    revalidateTag('<domain>')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function delete<Domain>(id: string): Promise<ActionResult> {
  try {
    await apiFetch(`<endpoint>/${id}`, { method: 'DELETE' })
    revalidateTag('<domain>')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
```

**Rules:**

- Only GET server fetchers need `tags` in `apiFetch` options (Next.js only caches GET).
- POST/PUT/DELETE actions do NOT pass `tags` — the `revalidateTag()` call alone invalidates the cache.
- Return `ActionResult` (`{ success: boolean; error?: string }`) — not thrown exceptions.
- Each action calls `revalidateTag()` matching the tag used in the server GET fetcher.

### 2. Use `useTransition` for loading state

File: `src/views/pages/<route-path>/create.tsx`

```tsx
'use client'

import { useTransition } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'

import { create<Domain> } from '@/api/<domain>/actions'

const Create = () => {
  const [isPending, startTransition] = useTransition()

  const methods = useForm({
    defaultValues: { ... },
    resolver: yupResolver(<domain>Schema)
  })
  const { handleSubmit, reset } = methods

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const result = await create<Domain>(data)
      if (result.success) {
        toast.success('Creado con éxito')
        reset()
      } else {
        toast.error(result.error || 'Error al crear')
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormComponent isPending={isPending} />
      </form>
    </FormProvider>
  )
}
```

**Rules:**

- Use `useTransition` (not `useState`) for `isPending` — keeps UI responsive during async work.
- Wrap the Server Action call inside `startTransition(async () => { ... })`.
- On success: `toast` + `reset()`. The `revalidateTag()` inside the Server Action invalidates the server cache, and the router updates automatically on action completion.
- Import Server Actions directly: `import { createWarehouse } from '@/api/general-parameters/actions'`.

### 3. Inline nested CRUD (Update dialog with child entities)

When a parent form includes a child entity (e.g., Warehouse with Racks), put everything in one dialog:

```tsx
const Update = ({ parent, open, onClose }: Props) => {
  const [parentPending, startParentTransition] = useTransition()
  const [showCreateChild, setShowCreateChild] = useState(false)
  const [editChild, setEditChild] = useState<any>(null)

  const parentForm = useForm({ ... })
  const { handleSubmit, reset } = parentForm

  const onSubmitParent = (data: any) => {
    startParentTransition(async () => {
      const result = await updateParent(parent.id, data)
      if (result.success) {
        toast.success('Actualizado')
      }
    })
  }

  return (
    <CustomDialog open={open} onClose={handleClose} title='Editar' maxWidth='lg'>
      {/* Parent form */}
      <FormProvider {...parentForm}>
        <form onSubmit={handleSubmit(onSubmitParent)}>
          <ParentForm isPending={parentPending} />
        </form>
      </FormProvider>

      <Divider sx={{ my: 4 }} />
      <Typography variant='h6'>Children</Typography>
      <CustomDataGrid columns={childColDefs} data={parent.children} />

      {/* Create/Edit child inline */}
      {showCreateChild ? (
        <CreateChild idParent={parent.id} onSuccess={() => setShowCreateChild(false)} />
      ) : editChild ? (
        <UpdateChild child={editChild} onSuccess={() => setEditChild(null)} />
      ) : null}

      {!showCreateChild && !editChild && (
        <button onClick={() => setShowCreateChild(true)}>Agregar</button>
      )}
    </CustomDialog>
  )
}
```

**Rules:**

- The dialog shows parent form + child DataGrid + inline child create/edit forms.
- Only one inline form at a time (create XOR edit XOR none).
- Each child mutation calls its own Server Action + `revalidateTag()`.
- `handleDeleteChild` calls the delete Server Action directly (no `useTransition` needed unless there's UI feedback).

## Tabs with URL searchParams

When a page has multiple tabs, use URL `searchParams` instead of client-side `useState`:

### page.tsx (Server Component)

```tsx
import { Suspense } from "react";

const Page = ({ searchParams }: { searchParams?: { tab?: string } }) => {
  const tab = searchParams?.tab || "TabDefault";

  return (
    <CustomBox title='...'>
      <Tabs /> {/* Client Component — navigation only */}
      {tab === "TabDefault" && <DefaultComponent />} {/* sync render, e.g. React Query */}
      {tab === "TabServer" && (
        <Suspense fallback={<Loader type='component' />}>
          <DataFetcher />
        </Suspense>
      )}
    </CustomBox>
  );
};

async function DataFetcher() {
  const data = await getDomainServer();
  return <List initialData={data} />;
}
```

### tabs.tsx (Client Component — navigation only)

```tsx
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const Tabs = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'TabDefault'

  const handleChange = (_: any, value: string) => {
    router.replace(`?tab=${value}`)
  }

  return (
    <TabContext value={activeTab}>
      <CustomTabList onChange={handleChange} ...>
        {tabs.map(tab => <Tab key={tab.value} value={tab.value} label={tab.label} />)}
      </CustomTabList>
    </TabContext>
  )
}
```

**Rules:**

- `page.tsx` reads `searchParams.tab` to decide which content to render — only the active tab renders.
- Tabs that use Server Components (SSR + Suspense) get a `<Suspense>` boundary.
- Tabs that use React Query render directly (no Suspense needed — they're Client Components).
- `tabs.tsx` is a pure navigation Client Component: reads `useSearchParams().get('tab')`, writes via `router.replace(\`?tab=\${value}\`)`.
- `router.replace` (not `push`) avoids adding history entries for every tab switch.
- No `TabPanel` needed — page.tsx handles conditional rendering.
- Permission filtering (via `useAbility`) still happens in `tabs.tsx` to show/hide tabs.

## Key quirks

- **Iconify icons:** custom build step — icons are compiled from `src/assets/iconify-icons/bundle-icons-css.ts` into CSS. Run `pnpm build:icons` or `pnpm install` to regenerate.
- **ngrok skip header:** axios instance sends `ngrok-skip-browser-warning: "true"` — API is served via ngrok dev tunnel
- **Env vars:** `NEXT_PUBLIC_API_BASE_URL` and `API_BASE_URL` both set in `.env`; the API is on an external ngrok URL
- **`.env` has placeholder `BASEPATH`** (empty) and a dummy `NEXTAUTH_SECRET` — these are dev-only values
- **Root layout** uses `#__next` as the HTML element id (matches Tailwind `important`)
- **No unit test framework** — only Playwright for E2E, and only a placeholder spec exists
- **Playwright config** runs on chromium, firefox, and webkit; no `webServer` configured
- **package.json** has `resolutions` and `overrides` for `rimraf@^5.0.7`
