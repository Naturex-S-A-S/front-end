# 🧪 Guía de Testing con Vitest — Naturex

## Stack de testing

| Herramienta | Propósito |
|---|---|
| **Vitest** | Corredor de tests (ultrarrápido, compatible con Vite) |
| **jsdom** | Simula un navegador en Node.js |
| **React Testing Library** | Renderiza componentes y hace queries en el DOM |
| **`@testing-library/user-event`** | Simula interacciones reales del usuario (click, type, keyboard) |
| **`@testing-library/jest-dom`** | Matchers personalizados (`toBeInTheDocument`, `toHaveAttribute`, etc.) |

---

## Arquitectura (4 capas)

```
vitest.config.ts                 ← Configuración global
       │
src/utils/tests/setup.ts         ← Mocks de APIs del browser
       │
src/utils/tests/test-utils.tsx   ← Custom render con providers
       │
src/utils/tests/mocks.ts         ← Fábricas de datos y mocks reutilizables
       │
src/views/__tests__/*.test.tsx   ← Tests reales (co-located con el componente)
```

---

## Cómo escribir un test — Paso a paso

### 1. Identifica el componente a probar

Ubica el componente en `src/views/`. Crea el archivo de test en `src/views/__tests__/`.

Ejemplo: para `src/views/Login.tsx` → `src/views/__tests__/Login.test.tsx`

### 2. Template base del test

```tsx
import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/utils/tests/test-utils'
import MiComponente from '@/views/MiComponente'
import { createMockRouter, createMockSettings } from '@/utils/tests/mocks'

// ───── MOCKS DE DEPENDENCIAS EXTERNAS ─────

const mockRouter = createMockRouter()
const mockApiFn = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('next-auth/react', () => ({
  signIn: (...args) => mockApiFn(...args),
}))

vi.mock('@core/hooks/useSettings', () => ({
  useSettings: () => createMockSettings(),
}))

// ───── HELPERS DEL TEST ─────

function getSubmitButton() {
  return screen.getByRole('button', { name: /enviar/i })
}

// ───── TESTS ─────

describe('MiComponente', () => {
  describe('Renderizado', () => {
    it('renderiza todos los campos del formulario', () => {
      render(<MiComponente />)

      expect(screen.getByRole('textbox', { name: /nombre/i })).toBeInTheDocument()
      expect(getSubmitButton()).toBeInTheDocument()
    })
  })

  describe('Validacion', () => {
    it('muestra errores al enviar vacio', async () => {
      const user = userEvent.setup()

      render(<MiComponente />)

      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(screen.getByText(/campo requerido/i)).toBeInTheDocument()
      })

      expect(mockApiFn).not.toHaveBeenCalled()
    })
  })

  describe('Comportamiento', () => {
    it('ejecuta la accion correcta en un escenario valido', async () => {
      const user = userEvent.setup()

      mockApiFn.mockResolvedValue({ success: true })

      render(<MiComponente />)

      await user.type(screen.getByRole('textbox', { name: /nombre/i }), 'Juan')
      await user.click(getSubmitButton())

      await waitFor(() => {
        expect(mockApiFn).toHaveBeenCalledWith({ nombre: 'Juan' })
      })

      expect(mockRouter.replace).toHaveBeenCalledWith('/exito')
    })
  })
})
```

---

## Reglas y patrones clave

### 1. Patrón AAA (Arrange-Act-Assert)

Todo test debe tener 3 fases separadas por un blank line:

```tsx
it('descripcion del comportamiento', async () => {
  // ARRANGE — Prepara mocks, datos, y renderiza
  mockApiFn.mockResolvedValue({ data: 'ok' })
  render(<MiComponente />)

  // ACT — Interactúa como usuario
  await user.type(input, 'test')
  await user.click(button)

  // ASSERT — Verifica el comportamiento
  expect(mockApiFn).toHaveBeenCalled()
  expect(screen.getByText(/exito/i)).toBeInTheDocument()
})
```

### 2. Query Priority (de mejor a peor)

| Query | Cuándo usarla | Ejemplo |
|---|---|---|
| `getByRole` | **Siempre que puedas** — es accesible y semántica | `getByRole('button', { name: /guardar/i })` |
| `getByLabelText` | Inputs con `<label>` asociado | `getByLabelText(/correo/i)` |
| `getByPlaceholderText` | Solo si no hay label | `getByPlaceholderText(/nombre/i)` |
| `getByText` | Elementos no interactivos (párrafos, títulos) | `getByText(/bienvenido/i)` |
| `getByTestId` | **Último recurso** — usa `data-testid` | `getByTestId('submit-btn')` |

**NUNCA** uses:
- Clases CSS
- Tag names (`div`, `span`)
- Índices de posición (`:nth-child`)
- Selectores de atributos internos de MUI

### 3. userEvent > fireEvent

```tsx
// ❌ Obsoleto — no simula interacción real
fireEvent.change(input, { target: { value: 'test' } })

// ✅ Moderno — simula tecleo real con eventos keyDown/keyUp/change
await user.type(input, 'test')

// ✅ Click real con pointerDown/mouseDown/pointerUp/mouseUp/click
await user.click(button)
```

### 4. Mocking de dependencias externas

**Regla**: mockea todo lo que el componente importa pero no te interesa probar.

```tsx
// Variable externa para poder hacer assertions
const mockSignIn = vi.fn()

// El mock DEBE usar (...args) => mockSignIn(...args) para que sea reactivo
vi.mock('next-auth/react', () => ({
  signIn: (...args) => mockSignIn(...args),
}))

// En cada test, configuras el comportamiento
mockSignIn.mockResolvedValue({ url: '/home' })
mockSignIn.mockRejectedValue(new Error('Network error'))
```

### 5. Fábricas de datos (mocks.ts)

Usa las factories en lugar de objetos literales:

```tsx
// ✅ Bueno — valores por defecto, sobrescribes solo lo necesario
createMockRouter({ replace: vi.fn() })
createMockSettings({ settings: { mode: 'dark' } })

// ❌ Malo — repetitivo, verboso, difícil de mantener
{
  replace: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  // ...
}
```

### 6. Prueba comportamiento, no implementación

```tsx
// ✅ Correcto — prueba lo que el usuario ve/hace
expect(screen.getByText(/error de conexion/i)).toBeInTheDocument()
expect(mockRouter.replace).toHaveBeenCalledWith('/login')

// ❌ Incorrecto — prueba detalles internos
expect(component.state.isLoading).toBe(false)
expect(component.props.onSubmit).toHaveBeenCalled()
```

### 7. Estructura de describe/it

```tsx
describe('NombreDelComponente', () => {          // ← nombre del componente
  describe('Renderizado', () => {                 // ← categoría
    it('muestra el titulo y los campos', () => {  // ← comportamiento específico
    })
  })
  describe('Validacion', () => {
    it('muestra errores al enviar vacio', () => {})
  })
  describe('Comportamiento', () => {
    it('llama al API y redirige en caso exitoso', () => {})
    it('no redirige cuando falla la autenticacion', () => {})
  })
})
```

---

## Queries según tipo de componente

### MUI Autocomplete (combobox)

```tsx
// Encontrar el combobox
const combobox = screen.getByRole('combobox', { name: /tipo/i })

// Seleccionar opción (jsdom no renderiza el Popper, usar teclado)
await user.click(combobox)
await user.keyboard('{ArrowDown}{Enter}')
```

### MUI TextField / Input

```tsx
// Con label
screen.getByRole('textbox', { name: /nombre/i })

// Sin label (solo placeholder)
screen.getByPlaceholderText(/ingrese nombre/i)

// Por name (para password inputs que no tienen role textbox)
document.querySelector('input[name="password"]')
```

### MUI Button

```tsx
screen.getByRole('button', { name: /guardar/i })
screen.getByRole('button', { name: /iniciar sesi/i })
```

### Texto decorativo

```tsx
screen.getByText(/bienvenido/i)
screen.getByText(/total: \$100/i)
```

---

## Comandos útiles

```bash
pnpm test          # Modo watch — corre tests al guardar cambios
pnpm test:run      # Una sola ejecución (CI)
pnpm test:coverage # Ejecuta con cobertura
```

---

## Troubleshooting común

### "Unable to find role" / "Unable to find text"

1. **Acentos/Unicode**: El texto puede tener caracteres descompuestos (`o + ̃`)
   ```tsx
   // Si falla con /sesion/, prueba sin tilde o más genérico
   screen.getByText(/inicia sesi[oó]/i)
   ```
2. **Elemento anidado**: El texto está dividido en múltiples elementos hijos. Usa una función matcher:
   ```tsx
   screen.getByText((content) => content.includes('parte del texto'))
   ```
3. **Elemento invisible**: El componente existe pero está oculto. Usa `{ exact: false }` o verifica que no tenga `display: none`

### "No options match with `{}`" (MUI Autocomplete)

Error esperado en jsdom. El Autocomplete tiene un valor inicial `{}` que no coincide con las opciones. No afecta los tests, es solo un warning de consola.

### "Cannot find module" con alias `@/`

Verifica que:
- `tsconfig.json` tenga los paths configurados
- `vitest.config.ts` tenga `resolve.tsconfigPaths: true`
- Los alias en `tsconfig.json` coincidan con los imports

---

## Flujo de trabajo para crear un test nuevo

```
1. Crea el archivo:   src/views/__tests__/TuComponente.test.tsx
2. Escribe el template con describe/it vacíos
3. Identifica dependencias externas → crea mocks
4. Escribe el test de renderizado (que los elementos existen)
5. Escribe el test de validación (errores con datos inválidos)
6. Escribe el test de comportamiento exitoso
7. Escribe el test de comportamiento fallido
8. Corre pnpm test:run para verificar
```
