# CLAUDE.md — admin-naturex

Documento técnico completo del proyecto para uso en sesiones de desarrollo con Claude Code.

---

## Contexto del Proyecto

**admin-naturex** es un panel de administración web para la empresa Naturex, enfocado en la gestión de producción e inventarios. Permite controlar:

- Inventarios de materia prima, producto terminado y material de empaque
- Órdenes de producción y aprovisionamiento
- Formulaciones de productos
- Órdenes de venta y proveedores
- Usuarios, roles y parámetros del sistema

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5.4 (strict mode) |
| UI | MUI v5 + Tailwind CSS 3 |
| Autenticación | next-auth v4 + JWT (jose) |
| Data fetching | React Query v5 + axios (cliente) / fetch nativo (servidor) |
| Formularios | react-hook-form v7 + yup |
| Permisos | CASL v6 (@casl/ability + @casl/react) |
| Grids | @mui/x-data-grid v7 |
| Notificaciones | react-hot-toast + sweetalert2 |
| Fechas | moment + react-datepicker |
| Package manager | pnpm 10.30.0 (pinned) |
| Node.js | ESNext target |

---

## Estructura de Directorios

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/        # Rutas autenticadas con layout completo
│   ├── (blank-layout-pages)/ # Páginas sin chrome (login)
│   ├── api/auth/[...nextauth]/ # Handler de next-auth
│   └── layout.tsx          # Root layout (id="__next", Toaster)
│
├── api/                    # Capa de acceso a API REST
│   ├── instances.ts        # Axios con interceptor Bearer (cliente)
│   ├── server.ts           # fetch nativo con getServerSession (servidor)
│   ├── feedstock/          # Materia prima
│   ├── product/            # Producto terminado
│   ├── order/              # Órdenes de producción y venta
│   ├── packaging/          # Material de empaque
│   ├── providers/          # Proveedores
│   ├── formulation/        # Formulaciones
│   ├── kardex/             # Kardex de inventario
│   ├── user/               # Usuarios y autenticación
│   ├── role/               # Roles y permisos
│   ├── metadata/           # Unidades, categorías
│   └── general-parameters/ # Parámetros del sistema
│
├── hooks/                  # Custom hooks con React Query
│   ├── casl/               # useAbility
│   ├── feedstock/          # useGetFeedstockList, etc.
│   ├── product/            # useGetProduct, useGetProductById, etc.
│   ├── order/              # useGetOrderById, useGetSalesOrder, etc.
│   ├── packaging/          # Hooks de empaque
│   ├── provider/           # Hooks de proveedores
│   ├── formulation/        # Hooks de formulación
│   ├── metadata/           # Hooks de metadatos
│   └── role/               # Hooks de roles
│
├── views/                  # Componentes de vista (lógica de negocio)
│   └── pages/
│       ├── produccion/     # Órdenes, aprovisionamiento, formulación
│       ├── inventario/     # Materia prima, producto, empaque
│       ├── finanzas-y-administracion/ # Órdenes venta, proveedores
│       └── soporte/        # Usuarios, roles, parámetros, reportes
│
├── components/             # Componentes UI compartidos
│   ├── layout/             # Header, Navbar, Footer, Logo, UserDropdown
│   ├── provider/           # SessionProvider, AbilityProvider, ReactQueryProvider
│   └── theme/              # ThemeProvider + customizer
│
├── @core/                  # Core reutilizable
│   ├── components/mui/     # Wrappers de MUI (DataGrid, Button, Dialog, etc.)
│   ├── theme/              # Builder de tema MUI + overrides
│   ├── contexts/           # settingsContext (tema via cookie)
│   ├── hooks/              # useSettings, useBgColor, useImageVariant
│   ├── styles/             # Estilos de componentes MUI
│   └── tailwind/plugin.ts  # Plugin Tailwind con variables CSS de MUI
│
├── @layouts/               # Wrappers de layout
│   ├── LayoutWrapper.tsx   # Elige Vertical u Horizontal
│   ├── VerticalLayout.tsx  # Sidebar izquierdo
│   ├── HorizontalLayout.tsx# Menú superior
│   └── BlankLayout.tsx     # Sin chrome (auth pages)
│
├── @menu/                  # Sistema de navegación
│   ├── vertical-menu/      # Sidebar menu
│   ├── horizontal-menu/    # Top menu
│   ├── contexts/           # verticalNavContext, horizontalNavContext
│   └── defaultConfigs.ts   # Configuración por defecto del menú
│
├── types/                  # Definiciones TypeScript
│   ├── next-auth.d.ts      # Augmentación de Session (permissions, role, etc.)
│   └── pages/              # Tipos por dominio (product, order, user, etc.)
│
├── utils/
│   ├── ability.ts          # CASL ability builder
│   ├── columns/            # Definiciones de columnas para DataGrid
│   │   └── components/     # Componentes custom de columnas
│   ├── schemas/            # Yup schemas de validación (order, user, etc.)
│   ├── defaultValues/      # Valores default para formularios
│   ├── constant/           # ABILITY_SUBJECT, ABILITY_FIELDS, ABILITY_ACTIONS
│   ├── enum/               # Enums del dominio
│   ├── paths.ts            # Rutas constantes
│   ├── messages.ts         # alertMessageErrors — toast de errores
│   ├── format.ts           # Formateo de números y fechas
│   └── mocks/              # Mock data (documentTypes)
│
├── configs/
│   └── themeConfig.ts      # Config global del tema (layout, navbar, footer)
│
├── lib/
│   └── nextAuthOptions.ts  # Configuración de next-auth (provider, callbacks)
│
├── data/navigation/        # verticalMenuData.tsx, horizontalMenuData.tsx
├── assets/iconify-icons/   # Bundle de iconos Iconify (generado)
└── middleware.ts           # Chequea expiración del token JWT
```

---

## Autenticación y Autorización

### Flujo de login
1. Usuario envía `dni`, `documentType`, `password`
2. `nextAuthOptions.authorize()` llama a `authentication()` → retorna JWT
3. JWT decodificado con `decodeJwt` (jose):
   - `token.access_token` → Bearer token para API
   - `token.user` → `{ id, name, email }`
   - `token.permissions` → árbol de permisos (módulos)
   - `token.role` → rol del usuario
   - `token.tokenExpires` → epoch seconds
4. `middleware.ts` verifica `tokenExpires` en cada request protegido
5. Si expiró → redirige a `/login`

### Sistema de permisos (CASL)
- **Builder:** `src/utils/ability.ts`
  - Si `role === 'admin'` → `can('manage', 'all')`
  - Si no, procesa el árbol de permisos del token
- **Hook:** `useAbility()` en `src/hooks/casl/useAbility.ts`
- **Uso típico:** `ability.can(ACTION, SUBJECT, FIELD)`

```typescript
// Constantes en src/utils/constant/index.ts
ABILITY_SUBJECT.FEEDSTOCK    // 'Materia prima'
ABILITY_SUBJECT.PRODUCT      // 'Producto terminado'
ABILITY_SUBJECT.PACKAGING    // 'Material de empaque'
ABILITY_SUBJECT.PRODUCTION   // 'Producción'

ABILITY_ACTIONS.READ         // 'read'
ABILITY_ACTIONS.CREATE       // 'create'
ABILITY_ACTIONS.UPDATE       // 'update'
ABILITY_ACTIONS.DELETE       // 'delete'
```

---

## Capa API

### Dos clientes HTTP

**Cliente (axios)** — `src/api/instances.ts`
```typescript
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL })
// Interceptor agrega automáticamente Bearer token desde session
export const API = () => api
```

**Servidor (fetch nativo)** — `src/api/server.ts`
```typescript
export async function ApiServer<T>(path: string, tags?: string[]): Promise<T>
// Usa getServerSession, cache: 'no-store'
```

### Patrón de módulo API
```typescript
// Ejemplo: src/api/product/index.ts
export const getProducts = async (filters?: any) => {
  const { data } = await API().get('/products', { params: filters })
  return data
}
export const postProduct = async (body: ICreateProduct) => {
  const { data } = await API().post('/products', body)
  return data
}
```

---

## Data Fetching con React Query

### Configuración global
```typescript
new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } }
})
```

### Patrón de hook
```typescript
// src/hooks/product/useGetProduct.ts
const useGetProduct = (filters?: any) => {
  const { data, isLoading } = useQuery<IProduct[]>({
    queryKey: ['getProducts', filters],
    queryFn: () => getProducts(filters)
  })
  return { product: data, isLoading }
}
```

### Mutaciones
```typescript
const { isPending, mutateAsync } = useMutation({
  mutationFn: postOrder,
  onSuccess: () => { toast.success('Creado') },
  onError: (error) => { alertMessageErrors(error, 'Error al crear') }
})
```

---

## Formularios

### Stack de formularios
- **React Hook Form** → gestión de estado y performance
- **Yup** → esquemas de validación en `src/utils/schemas/`
- **Default values** → en `src/utils/defaultValues/`
- **FormProvider** → para formularios multi-componente

```typescript
const methods = useForm({
  defaultValues: orderDefaultValues,
  resolver: yupResolver(orderSchema)
})

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* campos */}
    </form>
  </FormProvider>
)
```

---

## Columnas DataGrid

### Patrón de columnas
Cada archivo en `src/utils/columns/` exporta una función `columns(params)`:

```typescript
export const columns = ({ handleStatus, isPending }: Params): GridColDef[] => {
  const ability = useAbility()
  const router = useRouter()

  return [
    {
      field: 'actions',
      renderCell: (params) => (
        ability.can('read', 'Materia prima', 'Listado') && (
          <ActionButton onClick={() => router.push(`/detail/${params.row.id}`)} />
        )
      )
    },
    { field: 'name', headerName: 'Nombre', width: 200 },
    // ...
  ]
}
```

### Columnas disponibles
| Archivo | Dominio |
|---------|---------|
| `product.tsx` | Productos terminados |
| `feedstock.tsx` | Materia prima |
| `packaging.tsx` | Material de empaque |
| `formulation.tsx` | Formulaciones |
| `order.tsx` | Órdenes de producción |
| `orderSupply.tsx` | Órdenes de aprovisionamiento |
| `saleOrder.tsx` | Órdenes de venta |
| `supplier.tsx` | Proveedores |
| `user.tsx` | Usuarios |
| `movements.tsx` | Movimientos de inventario |

---

## Tema y Estilos

### Configuración del tema (`src/configs/themeConfig.ts`)
```typescript
{
  templateName: 'Naturex',
  settingsCookieName: 'naturex-admin-settings',
  mode: 'light',           // 'system' | 'light' | 'dark'
  skin: 'default',         // 'default' | 'bordered'
  layout: 'vertical',      // 'vertical' | 'collapsed' | 'horizontal'
  layoutPadding: 24,
  navbar: { type: 'fixed', floating: true, detached: true, blur: true },
  footer: { type: 'static', detached: true }
}
```

### Coexistencia MUI + Tailwind
- **MUI:** componentes complejos (Button, DataGrid, Dialog, Autocomplete...)
- **Tailwind:** utilidades de layout (flex, gap, grid, padding, responsive...)
- **Plugin custom:** `src/@core/tailwind/plugin.ts` mapea variables CSS de MUI a clases Tailwind
- **preflight: false** → MUI provee el reset de CSS
- **important: '#\_\_next'** → el root HTML tiene `id="__next"`

### CSS Logical Properties
- Enforced via `stylelint-use-logical-spec`
- Usar `margin-inline`, `padding-block`, `inset-inline-start` etc. en lugar de directional properties
- Soporte RTL/LTR sin cambios de código

---

## Rutas Principales

```
/                           → redirect a /home
/login                      → Autenticación
/home                       → Dashboard

/produccion/ordenes                  → Lista órdenes de producción
/produccion/ordenes/crear            → Crear orden de producción
/produccion/ordenes/[id]             → Detalle de orden
/produccion/aprovisionamiento        → Lista órdenes aprovisionamiento
/produccion/aprovisionamiento/crear  → Crear aprovisionamiento
/produccion/formulacion              → Lista formulaciones
/produccion/formulacion/[id]         → Detalle formulación

/inventario/materia-prima/listado    → Lista materia prima
/inventario/producto-terminado/listado → Lista productos
/inventario/material-empaque/listado → Lista material empaque

/finanzas-y-administracion/ordenes-de-venta → Órdenes de venta
/finanzas-y-administracion/proveedores      → Proveedores

/soporte/usuarios               → Gestión de usuarios
/soporte/roles                  → Gestión de roles
/soporte/parametros-generales   → Parámetros del sistema
/soporte/reportes               → Reportes

/perfil                         → Perfil del usuario
```

---

## Flujo de la Aplicación

```
1. Usuario visita http://localhost:3000/
   → next.config redirige a /home

2. middleware.ts intercepta:
   → Verifica token (expiración)
   → Si no autenticado → /login

3. /login:
   → LoginView con formulario (react-hook-form + yup)
   → signIn('credentials') → nextAuthOptions.authorize()
   → API call → JWT retornado
   → Token decodificado, permisos extraídos
   → Session creada

4. Dashboard cargado:
   → Providers: SessionProvider > AbilityProvider > ReactQueryProvider
   → LayoutWrapper → VerticalLayout (sidebar + navbar)
   → Navigation sidebar generada desde verticalMenuData
   → Items de menú filtrados por permisos CASL

5. Por cada página:
   → Componente de vista verifica permisos con useAbility()
   → Hooks cargan datos con React Query (caché 5 min stale por defecto)
   → DataGrid renderiza con columnas dinámicas según permisos
   → Formularios con react-hook-form + yup
   → Mutaciones con useMutation → toast / sweetalert2
```

---

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXTAUTH_SECRET` | Secreto para firmar tokens de next-auth |
| `NEXTAUTH_URL` | URL base de la app (`http://localhost:3000/`) |
| `NEXT_PUBLIC_API_BASE_URL` | URL del backend (expuesta al navegador) |
| `API_BASE_URL` | URL del backend solo server-side |
| `BASEPATH` | BasePath de Next.js (vacío en dev) |

---

## Scripts

```bash
pnpm dev          # Servidor de desarrollo
pnpm fast         # Dev con Turbo mode
pnpm build        # Build de producción
pnpm start        # Servir build de producción
pnpm lint         # ESLint
pnpm lint:fix     # ESLint con autofix
pnpm format       # Prettier
```

---

## Convenciones de Código

### Estilo
- Sin punto y coma
- Comillas simples
- 120 caracteres por línea
- Sin trailing commas
- Arrow functions sin paréntesis para un solo parámetro

### Imports (orden ESLint)
1. `react`, `next`
2. Librerías externas
3. Imports internos (`@/`, `@core/`, etc.)

### TypeScript
- Strict mode activado
- `consistent-type-imports: error` → siempre usar `import type { ... }`
- No usar `any` explícito (regla desactivada, pero evitar)

### Path aliases
```typescript
@/*          → src/*
@core/*      → src/@core/*
@layouts/*   → src/@layouts/*
@menu/*      → src/@menu/*
@assets/*    → src/assets/*
@components/* → src/components/*
@configs/*   → src/configs/*
@views/*     → src/views/*
```

---

## Notas Importantes para Desarrollo

1. **Iconos:** Los iconos Iconify se generan con `pnpm build:icons` (también corre en postinstall). Añadir iconos nuevos requiere agregar el string del icono al bundle en `src/assets/iconify-icons/bundle-icons-css.ts`.

2. **API en desarrollo:** La API se sirve vía ngrok. Cambiar `NEXT_PUBLIC_API_BASE_URL` en `.env`. El interceptor ya agrega el header `ngrok-skip-browser-warning: true`.

3. **Permisos en columnas:** Las columnas de DataGrid usan `useAbility()` internamente — son hooks, no pueden llamarse condicionalmente. El wrapper de columnas debe ser un componente o función llamada en el cuerpo del componente.

4. **Session en server components:** Usar `getServerSession(authOptions)` de `next-auth/next`. En client components usar `useSession()` de `next-auth/react`.

5. **Notificaciones de error:** Usar `alertMessageErrors(error, mensaje)` de `src/utils/messages.ts` en bloques `onError` de mutaciones. Maneja arrays de mensajes del backend automáticamente.

6. **Tema persistido en cookie:** Los cambios de tema (modo, skin, layout) se persisten en la cookie `naturex-admin-settings`. El hook `useSettings()` gestiona esto.

7. **No hay unit tests:** Solo tests E2E con Playwright (placeholder). No crear tests unitarios a menos que se solicite explícitamente.

8. **DataGridEdit:** Para grids editables usar `src/@core/components/mui/DataGridEdit.tsx` en lugar del DataGrid estándar.

---

## Patrones a Seguir

### Nuevo hook de listado
```typescript
// src/hooks/[domain]/useGet[Entity]List.ts
import { useQuery } from '@tanstack/react-query'
import type { IEntity } from '@/types/pages/entity'
import { getEntityList } from '@/api/[domain]'

const useGetEntityList = () => {
  const { data, isLoading } = useQuery<IEntity[]>({
    queryKey: ['getEntityList'],
    queryFn: getEntityList,
    staleTime: 5 * 60 * 1000
  })
  return { entityList: data, isLoading }
}

export default useGetEntityList
```

### Nueva página (vista)
```typescript
// src/views/pages/[section]/[entity]/list.tsx
'use client'

import { useAbility } from '@/hooks/casl/useAbility'
import { READ, ENTITY_SUBJECT } from '@/utils/constant'

export default function EntityList() {
  const ability = useAbility()
  if (!ability.can(READ, ENTITY_SUBJECT, 'Listado')) return null

  const { entities, isLoading } = useGetEntityList()
  const cols = columns({ /* params */ })

  return (
    <Card>
      <DataGrid rows={entities ?? []} columns={cols} loading={isLoading} />
    </Card>
  )
}
```

### Nueva mutación
```typescript
const { isPending, mutateAsync } = useMutation({
  mutationFn: (data: ICreateEntity) => postEntity(data),
  onSuccess: () => {
    toast.success('Creado exitosamente')
    router.push(PATHS.ENTITY_LIST)
  },
  onError: (error: any) => alertMessageErrors(error, 'Error al crear')
})
```
