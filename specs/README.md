# Specs — Spec Driven Development

Cada funcionalidad que se diseña o modifica de forma relevante vive acá como una carpeta con tres artefactos. La spec es el documento permanente; el plan se consume al implementar; la QA la corre quien releasea.

## Estructura

```
specs/
  README.md                                  # este índice
  YYYY-MM-DD-<slug>/                         # una carpeta por funcionalidad
    spec.md                                  # qué / por qué — permanente
    plan.md                                  # cómo / cuándo — se agota al mergear
    QA.md                                    # verificación manual
```

El slug es `kebab-case`, en español, y describe la funcionalidad (no la tarea): `2026-09-24-generacion-automatica-codigos`, no `2026-09-24-fix-categorias`.

## Ciclo de vida

El `estado` va en la tabla de encabezado de `spec.md` y es lo que hace que la spec sea un artefacto de control y no un documento muerto:

```
borrador  →  aprobada  →  en-curso  →  implementada
```

| Estado | Significa |
|---|---|
| `borrador` | Se está discutiendo el diseño. Las decisiones pueden cambiar. |
| `aprobada` | Diseño cerrado y aceptado. Lista para planear. |
| `en-curso` | Hay `plan.md` y se está implementando. |
| `implementada` | El código está en `main`. El plan se archivó; spec y QA quedan como referencia. |

## Reglas

1. **Una spec por funcionalidad, no por ticket.** Si el cambio abarca varios frentes independientes, se parte en sub-proyectos y cada uno tiene su propia spec.
2. **La spec se escribe antes de codear.** Si aparece código sin spec, la spec se escribe después y se marca como tal.
3. **Toda spec referencia su plan y su QA.** Un artefacto sin pares enlazados está incompleto.
4. **Las decisiones confirmadas van dentro, no en la conversación.** Si se cerró una decisión ("usar arrays, no strings"), queda escrita en la sección *Decisiones confirmadas* con el porqué.
5. **Alcance explícito.** Si la spec describe otro repo (típicamente el backend), se aclara en la tabla de encabezado qué parte de este documento aplica a este repo.
6. **Los puntos abiertos son parte de la spec.** Un "Puntos abiertos" sin resolver es señal de que el estado todavía no debería ser `aprobada`.

## Índice

| Spec | Fecha | Estado | Alcance | Plan | QA |
|---|---|---|---|---|---|
| [Producto dummy para simulación de costos](2026-10-03-producto-de-pruebas-estimacion-costos/spec.md) | 2026-10-03 | `aprobada` | Frontend (adaptación de [spec backend](2026-10-03-producto-de-pruebas-estimacion-costos/spec-funtional.md)) | [plan](2026-10-03-producto-de-pruebas-estimacion-costos/plan.md) | [QA](2026-10-03-producto-de-pruebas-estimacion-costos/QA.md) |
| [Generación automática de códigos e ids](2026-09-24-generacion-automatica-codigos/spec.md) | 2026-09-24 | `implementada` | Backend (sección "Cambios sugeridos en el frontend") | [plan](2026-09-24-generacion-automatica-codigos/plan.md) | [QA](2026-09-24-generacion-automatica-codigos/QA.md) |

## Plantilla

Para una funcionalidad nueva:

```bash
mkdir -p specs/$(date +%F)-<slug>
```

- `spec.md` — secciones: tabla de encabezado (Fecha, Estado, Alcance, Plan, QA), *Contexto*, *Decisiones confirmadas*, *Diseño*, *Archivos críticos*, *Verificación*, *Puntos abiertos*.
- `plan.md` — *Goal*, *Architecture*, *Tech Stack*, *Spec* (link a `spec.md`), *Global Constraints*, tareas TDD con checkboxes.
- `QA.md` — tabla de casos por módulo, marcando 🔵 lo que requiere backend nuevo.

## Documentos relacionados

`docs/` contiene auditorías técnicas y contexto de API. No son specs: no descreben funcionalidades pendientes sino el estado del código existente.