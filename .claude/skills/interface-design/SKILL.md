---
name: interface-design
description: Design system de admin-naturex (MUI v5 + Tailwind). Usar al construir o modificar UI del dashboard — listados, cards, jerarquia, spacing, chips, empty states y paginacion.
---

# Interface Design System — admin-naturex

## Direction and feel

- Calm workbench, dense admin tool. Estructura gris, color solo comunica estado/acción.
- Listados verticales compactos (gap 2 = 16px), cards `outlined` con hover sutil.

## Depth strategy

- Borders-only. `Card variant='outlined'`, sin sombras.
- Hover: `borderColor: primary.main + backgroundColor: action.hover`, `transition: border-color 150ms, background-color 150ms`.
- Inactivos: `opacity 0.85`, no otro tratamiento.

## Spacing

- Base 8px. Row interna listas: `padding 12px 16px`, `gap 2`.
- Icono-texto: `Stack direction='row' spacing={1} alignItems='center'` (nunca `Typography` anidado).

## Hierarchy

- Row = `Avatar 36px` + bloque texto + acción derecha estable.
- Nombre: `subtitle1 600 noWrap`. Meta: `body2 text.secondary noWrap` con icono 14px a 60% opacidad.
- Chips: `size='small' variant='outlined'` — `Inactivo warning`, `Por defecto primary`, base costo `info` si va como chip.
- Focal: el nombre; avatar y chips demoten.

## Key component patterns

- List row CIF (`CIFTypes.tsx`): `Avatar bgcolor primary.light/info.light + color primary.dark/info.dark` por `costBasis` (`fixed: mdi:cash-lock`, `per_kg: mdi:scale-balance`); meta icono (`fixed: mdi:lock-clock`, variable: `mdi:chart-line-variant`).
- Acción estable: `Tooltip` + `CustomIconButton`; `isDefault` → `disabled` con `mdi:lock-outline` y tooltip explicativo, nunca ocultar el botón.
- Empty state: `<Alert severity='info'>` con icono, nunca lista vacía.
- Paginación: `usePagination(data, 6)` + `PaginationBar`, sin cambios.
