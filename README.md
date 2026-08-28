# admin-naturex

Panel de administración web para la gestión de producción e inventarios de Naturex.

Aplicación full-stack construida con **Next.js 14 (App Router)** que centraliza inventario, órdenes de producción, formulaciones, ventas, proveedores, costos y usuarios en una sola plataforma, con autenticación por roles y permisos granulares por módulo.

---

## Características

- **Inventario:** materia prima, producto terminado y material de empaque, con listados, detalles y kardex (entradas, salidas, ajustes).
- **Producción:** órdenes de producción, órdenes de aprovisionamiento, formulaciones y gestión de empaque.
- **Finanzas y administración:** órdenes de venta, proveedores, configuración de costos y gestión CIF.
- **Soporte:** usuarios, roles y permisos, parámetros generales del sistema (bodegas, racks) y reportes.
- **Core:** dashboard, autenticación, perfil, notificaciones en tiempo real (WebSockets).

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| UI | MUI v5 + Tailwind CSS 3 |
| Autenticación | next-auth v4 + JWT (jose) |
| Data fetching | React Query v5 + axios / fetch nativo |
| Formularios | react-hook-form + yup |
| Permisos | CASL v6 |
| Grids | @mui/x-data-grid v7 |
| Testing | vitest + Testing Library + Playwright |
| Package manager | pnpm |

## Requisitos previos

- Node.js 18+
- pnpm (v10.30.0 recomendado)

## Instalación

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

> `postinstall` compila automáticamente los iconos de Iconify (`pnpm build:icons`).

## Variables de entorno

Crea un archivo `.env` en la raíz:

| Variable | Descripción |
|----------|-------------|
| `NEXTAUTH_SECRET` | Secreto para firmar tokens de next-auth |
| `NEXTAUTH_URL` | URL base de la app (`http://localhost:3000/`) |
| `NEXT_PUBLIC_API_BASE_URL` | URL del backend (expuesta al navegador) |
| `API_BASE_URL` | URL del backend solo server-side |
| `BASEPATH` | BasePath de Next.js (vacío en dev) |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm fast` | Servidor de desarrollo con turbo mode |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir build de producción |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint con autofix |
| `pnpm format` | Prettier |
| `pnpm test` | Vitest (modo watch) |
| `pnpm test:run` | Vitest (modo CI) |
| `pnpm test:coverage` | Vitest con cobertura |
| `pnpm build:icons` | Compilar iconos Iconify |

## Estructura del proyecto

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/        # Rutas autenticadas con layout completo
│   └── (blank-layout-pages)/ # Páginas sin chrome (login, test)
├── api/                    # Capa de acceso a API REST
│   ├── instances.ts        # Axios con interceptor Bearer (cliente)
│   ├── apiFetch.ts         # fetch nativo con ISR + timeout (servidor)
│   └── <dominio>/          # feedstock, product, order, cif, costs, ...
├── hooks/                  # Custom hooks con React Query
├── views/pages/            # Lógica de negocio por sección
├── components/             # UI compartida (layout, providers, theme)
├── @core/                  # Core reutilizable (MUI wrappers, theme, hooks)
├── @layouts/ @menu/        # Sistema de layouts y navegación
├── types/                  # Tipos TypeScript
├── utils/                  # ability, columns, schemas, format
├── configs/                # themeConfig
├── data/navigation/        # Datos del menú de navegación
├── middleware.ts           # Chequeo de expiración del token JWT
└── lib/nextAuthOptions.ts  # Configuración de next-auth
```

## Capturas

> _Pendiente — añade aquí capturas de pantalla del panel._

## Testing

- **Unit tests:** `pnpm test:run` (vitest + jsdom + Testing Library).
- **E2E:** `npx playwright test`.

## Estado del proyecto

Proyecto privado de uso interno. No está publicado ni open-source.
