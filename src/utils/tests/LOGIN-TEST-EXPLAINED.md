# Explicación profunda: Login.test.tsx

Este archivo prueba el componente `Login` de Naturex. Cubre 3 escenarios:

1. **Renderizado** — ¿Los elementos existen en la pantalla?
2. **Validación** — ¿El formulario rechaza datos vacíos?
3. **Autenticación** — ¿La llamada al API funciona correctamente?

---

## Sección 1: Imports y configuración de mocks (líneas 1-27)

### Línea 1: Disable ESLint rule

```tsx
/* eslint-disable import/no-named-as-default */
```

`userEvent` se exporta del paquete tanto como default export como named export. ESLint advierte cuando usas el named export como si fuera el default. Es un falso positivo — el código funciona bien. Deshabilitamos la regla para esta línea específica.

### Líneas 2-7: Imports

```tsx
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/utils/tests/test-utils'
import Login from '@/views/Login'
import { createMockRouter, createMockSettings, createSignInResponse } from '@/utils/tests/mocks'
```

| Import | ¿Qué es? |
|---|---|
| `describe, it, expect` | Funciones de Vitest para estructurar y断言 |
| `vi` | API de Vitest para crear mocks (`vi.fn()`, `vi.mock()`) |
| `userEvent` | Simula interacciones de usuario reales |
| `render` | Nuestro custom render (envuelve en ThemeProvider + Toaster) |
| `screen` | Objeto con queries (`getByRole`, `getByText`, etc.) |
| `waitFor` | Espera a que algo ocurra en el DOM (para operaciones async) |
| `Login` | El componente que vamos a probar |
| `createMockRouter` etc. | Fábricas que crean objetos mock con valores por defecto |

### Líneas 9-10: Variables mock globales

```tsx
const mockRouter = createMockRouter()
const mockSignIn = vi.fn()
```

Estas variables existen **fuera** de los tests, en el scope del módulo. Todos los tests comparten las mismas variables. Como `vitest.config.ts` tiene `clearMocks: true`, Vitest limpia automáticamente el historial de llamadas (`calls`, `instances`, `results`) entre cada test, pero **preserva** la implementación del mock.

- `mockRouter` es un objeto con `replace`, `push`, `back`, etc. — cada método es un `vi.fn()` listo para espiar
- `mockSignIn` es un `vi.fn()` que vamos a usar para interceptar llamadas a `signIn` de next-auth

### Líneas 12-27: vi.mock()

```tsx
vi.mock('next-auth/react', () => ({
  signIn: (...args) => mockSignIn(...args),
  getSession: vi.fn()
}))
```

**¿Qué hace `vi.mock()`?**

`vi.mock()` intercepta el `import` de un módulo. Cuando el componente `Login` hace:

```tsx
import { signIn } from 'next-auth/react'
```

En realidad recibe **nuestro objeto mock** en lugar del módulo real.

**Detalle fino: ¿por qué `(...args) => mockSignIn(...args)` y no solo `mockSignIn`?**

```tsx
// ❌ Esto NO funciona
signIn: mockSignIn

// ✅ Esto SÍ funciona
signIn: (...args) => mockSignIn(...args)
```

`vi.mock()` se ejecuta una sola vez al cargar el archivo. En ese momento, la variable `mockSignIn` es `vi.fn()`. Pero si usamos `signIn: mockSignIn`, se crea una **copia de la referencia** en el momento del mock. Si luego hacemos `mockSignIn = vi.fn()` o reasignamos la variable, `signIn` seguiría apuntando a la función original.

Con `(...args) => mockSignIn(...args)`, el `signIn` **siempre llama a `mockSignIn`** — que es la variable del closure, no una copia. Así podemos cambiar `mockSignIn` dinámicamente (con `mockResolvedValue`, etc.) y los cambios se reflejan.

```tsx
vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))
```

El componente `Login` probablemente hace `const router = useRouter()`. Con este mock, `useRouter()` siempre devuelve nuestro `mockRouter`, y podemos verificar si `mockRouter.replace` fue llamado con los argumentos correctos.

```tsx
vi.mock('@core/hooks/useSettings', () => ({
  useSettings: () => createMockSettings()
}))

vi.mock('@core/hooks/useImageVariant', () => ({
  useImageVariant: () => '/images/illustrations/auth/naturex-logo.avif'
}))
```

`useSettings` provee configuración global (tema claro/oscuro, layout, etc.). `useImageVariant` devuelve la ruta de una imagen. No nos interesa probarlos, solo necesitamos que existan y devuelvan valores por defecto para que el componente no explote.

---

## Sección 2: Funciones helper (líneas 29-52)

```tsx
function getSubmitButton() {
  return screen.getByRole('button', { name: /iniciar sesi/i })
}
```

**¿Qué es `getByRole`?**

`getByRole` busca un elemento por su **rol ARIA**. Los roles son la semántica HTML que los lectores de pantalla usan:
- `<button>` → role `button`
- `<input>` → role `textbox`
- `<select>` → role `combobox`
- `<h1>` → role `heading`

**`{ name: /iniciar sesi/i }`** — el `name` es el **nombre accesible**, que es el texto visible del elemento. MUI Button expone su texto como nombre accesible.

El regex `/iniciar sesi/i` es **case-insensitive** (flag `i`). Usamos `sesi` en lugar de `sesión` porque:
1. El texto real tiene `sesión` con acento agudo en la `o`
2. Pero React Testing Library normaliza los caracteres Unicode
3. Usar el substring `sesi` evita problemas con tildes y caracteres compuestos/descompuestos

```tsx
function getPasswordInput() {
  const input = document.querySelector('input[name="password"]')
  if (!input) throw new Error('Password input not found')
  return input as HTMLInputElement
}
```

**¿Por qué `document.querySelector` y no `getByRole`?**

Los inputs `<input type="password">` **no tienen role `textbox`** en la especificación ARIA. El role de un password input es... ninguno. Es un `input` genérico sin role explícito.

Además, el `<label>` que dice `Contraseña` (con tilde `ñ`) tiene un problema: en el código fuente, la `ñ` está escrita como `n` + combinación de tilde (U+0303), lo que hace que `getByLabelText(/contraseña/i)` no coincida.

`document.querySelector('input[name="password"]')` es un escape hatch: busca directamente en el DOM real por el atributo `name`. No es lo ideal (se salta la accesibilidad), pero es el approach más confiable aquí.

```tsx
async function selectDocumentType(user: ReturnType<typeof userEvent.setup>) {
  const combobox = screen.getByRole('combobox', { name: /Tipo de documento/i })
  await user.click(combobox)
  await user.keyboard('{ArrowDown}{Enter}')
}

async function fillLoginForm(user: ReturnType<typeof userEvent.setup>) {
  await selectDocumentType(user)
  await user.type(screen.getByRole('textbox', { name: /Documento de identidad/i }), '123456789')
  await user.type(getPasswordInput(), 'password123')
}
```

Estas funciones encapsulan **acciones repetitivas**. En lugar de copiar-pegar las mismas 4 líneas en cada test, las centralizamos:

- `selectDocumentType`: hace click en el combobox y presiona ↓ + Enter para seleccionar la primera opción
- `fillLoginForm`: llena el formulario entero con credenciales válidas

**`ReturnType<typeof userEvent.setup>`** es el tipo TypeScript del objeto `user`. Es verbose pero correcto. Podrías usar `Parameters<typeof userEvent.setup>[0]` o simplemente `any` si prefieres.

---

## Sección 3: Primer test — Renderizado (líneas 54-65)

```tsx
describe('Login', () => {
  describe('Renderizado del formulario', () => {
    it('muestra todos los campos y el boton de envio', () => {
      render(<Login mode='light' />)

      expect(screen.getByText(/Bienvenido a Naturex/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /Tipo de documento/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /Documento de identidad/i })).toBeInTheDocument()
      expect(getPasswordInput()).toBeInTheDocument()
      expect(getSubmitButton()).toBeInTheDocument()
    })
  })
```

### ¿Qué hace?

Renderiza el componente `Login` y verifica que los 5 elementos clave estén presentes en el DOM.

### `render(<Login mode='light' />)`

Esta es **nuestra función `render` custom** (de `test-utils.tsx`), no la de React Testing Library. Hace 3 cosas:

1. Envuelve `<Login>` en `<ThemeProvider>` (MUI necesita el tema)
2. Agrega `<Toaster />` (react-hot-toast para notificaciones)
3. Monta todo en jsdom

### ¿Qué es `mode='light'`?

El componente `Login` acepta un prop `mode` que controla el tema visual. Pasamos `'light'` explícitamente para tener un entorno predecible, independientemente del tema por defecto del mock de `useSettings`.

### Las 5 assertions

Cada assertion verifica que un elemento existe en el DOM usando `toBeInTheDocument()` (de `@testing-library/jest-dom`):

| Assertion | ¿Qué verifica? |
|---|---|
| `getByText(/Bienvenido a Naturex/i)` | El título principal existe |
| `getByRole('combobox', ...)` | El Autocomplete de tipo de documento existe |
| `getByRole('textbox', ...)` | El input de documento existe |
| `getPasswordInput()` | El input de contraseña existe |
| `getSubmitButton()` | El botón de envío existe |

**Pregunta clave**: ¿por qué no probamos también el texto secundario "Por favor, inicia sesión"?

Porque **no aporta valor**. Ese texto es decorativo. Si alguien lo cambia, el test fallaría sin razón. Probamos solo lo que:
1. El usuario necesita para interactuar (inputs, botones)
2. La funcionalidad requiere (título para contexto)

---

## Sección 4: Segundo test — Validación (líneas 67-83)

```tsx
describe('Validacion del formulario', () => {
  it('muestra errores cuando se envia vacio', async () => {
    const user = userEvent.setup()

    render(<Login mode='light' />)

    await user.click(getSubmitButton())

    await waitFor(() => {
      expect(screen.getByText(/Tipo de documento es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/Documento de identidad es requerido/i)).toBeInTheDocument()
      expect(getPasswordInput()).toHaveAttribute('aria-invalid', 'true')
    })

    expect(mockSignIn).not.toHaveBeenCalled()
  })
})
```

### ¿Qué prueba?

Simula que un usuario hace clic en "Iniciar sesión" sin llenar nada. El formulario debe:
1. Mostrar mensajes de error en los campos requeridos
2. **NO** llamar a `signIn`

### Línea 69: `userEvent.setup()`

```tsx
const user = userEvent.setup()
```

Cada test crea su **propia instancia de `user`**. Esto es crucial para el aislamiento: si dos tests compartieran el mismo objeto `user`, podrían interferir entre sí (timers internos, estado de teclas presionadas, etc.).

`userEvent.setup()` devuelve un objeto con métodos:
- `.click(element)` — click completo (pointer + mouse events)
- `.type(element, text)` — escribe texto caracter por caracter
- `.keyboard(keys)` — presiona teclas específicas
- `.clear(element)` — limpia un input
- `.selectOptions(element, values)` — selecciona opciones

### Línea 73: `await user.click(getSubmitButton())`

**¿Por qué `await`?**

`userEvent` es asíncrono. Cada interacción (click, type, keyboard) simula eventos reales que ocurren en el tiempo. `await` asegura que todos los eventos se hayan disparado antes de continuar.

### Líneas 75-79: `waitFor`

```tsx
await waitFor(() => {
  expect(screen.getByText(/Tipo de documento es requerido/i)).toBeInTheDocument()
  expect(screen.getByText(/Documento de identidad es requerido/i)).toBeInTheDocument()
  expect(getPasswordInput()).toHaveAttribute('aria-invalid', 'true')
})
```

**¿Qué es `waitFor`?**

`waitFor` es una herramienta de React Testing Library para **esperar a que algo ocurra**. Repite el callback cada ~50ms hasta que:
- Todas las assertions pasan → éxito
- Pasan ~1000ms → el test falla con el error de la última assertion

**¿Por qué necesitamos `waitFor` aquí?**

Porque la validación del formulario es **asíncrona**:
1. El usuario hace click en submit
2. React Hook Form ejecuta `handleSubmit`
3. `handleSubmit` llama a `trigger()` (validación)
4. React re-renderiza el componente con los errores
5. Los mensajes de error aparecen en el DOM

React Hook Form usa microtasks y re-renders que no ocurren instantáneamente. Sin `waitFor`, las assertions se ejecutarían antes de que los errores aparezcan.

### `getByText` vs `findByText`

- `getByText` — **lanzza error inmediato** si no encuentra el elemento. Solo sirve si el elemento ya existe.
- `findByText` — es `getByText` + `waitFor`. Retorna una promesa que espera a que el elemento aparezca.

En el test, usamos `getByText` **dentro de `waitFor`**. Podríamos haber usado `findByText` en su lugar:

```tsx
await expect(screen.findByText(/Tipo de documento es requerido/i)).resolves.toBeInTheDocument()
```

Pero es menos legible. El patrón `waitFor + getByText` es más explícito.

### Línea 78: `toHaveAttribute('aria-invalid', 'true')`

Cuando un campo de MUI tiene error, automáticamente agrega `aria-invalid="true"` al input. Esto es parte de la accesibilidad (los lectores de pantalla anuncian "inválido"). `toHaveAttribute` verifica que el atributo esté presente con el valor correcto.

**¿Por qué `aria-invalid` y no un texto?**

Porque el campo de contraseña muestra su error como un mensaje debajo del input. Pero con el problema de la ñ descompuesta, `getByText(/contraseña es requerida/i)` podría fallar. `aria-invalid` es más confiable.

### Línea 81: `expect(mockSignIn).not.toHaveBeenCalled()`

Verifica que, si la validación falla, el componente **nunca** llama al API. Esta assertion está **fuera** de `waitFor` porque no necesita esperar — si `signIn` se hubiera llamado, ya estaría registrado en el mock.

### Resumen del flujo de este test

```
Usuario hace click en submit
       │
       ▼
handleSubmit se ejecuta
       │
       ▼
trigger() valida todos los campos
       │
       ▼
¿Hay errores? ──SÍ──→ Muestra mensajes de error
       │                       │
       NO                      ▼
       │               getByText encuentra errores
       ▼               aria-invalid="true"
Llamaría a signIn      mockSignIn NO fue llamado
       │
       ▼
  (no llega aquí)
```

---

## Sección 5: Tercer test — Autenticación exitosa (líneas 85-107)

```tsx
describe('Autenticacion', () => {
  it('envia las credenciales al API y redirige al home en caso exitoso', async () => {
    const user = userEvent.setup()

    mockSignIn.mockResolvedValue(createSignInResponse('/home'))

    render(<Login mode='light' />)

    await fillLoginForm(user)
    await user.click(getSubmitButton())

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        document: '123456789',
        password: 'password123',
        documentType: 'cedula',
        redirect: false,
        callbackUrl: '/home'
      })
    })

    expect(mockRouter.replace).toHaveBeenCalledWith('/home')
  })
```

### Línea 89: `mockSignIn.mockResolvedValue(createSignInResponse('/home'))`

**Configuración del escenario exitoso**.

`createSignInResponse('/home')` devuelve:

```tsx
{ url: '/home', error: undefined }
```

`mockResolvedValue` hace que cuando alguien llame a `mockSignIn(...)`, la función devuelva una Promesa que se resuelve con `{ url: '/home', error: undefined }`.

**¿Qué representa esto?**

En la vida real, `signIn('credentials', {...})` hace una petición POST al endpoint de next-auth `/api/auth/callback/credentials`. Si el servidor responde con éxito, devuelve un objeto con `{ url: '/home' }` (la URL a la que redirigir).

### Línea 97-104: `mockSignIn.toHaveBeenCalledWith`

```tsx
expect(mockSignIn).toHaveBeenCalledWith('credentials', {
  document: '123456789',
  password: 'password123',
  documentType: 'cedula',
  redirect: false,
  callbackUrl: '/home'
})
```

**Verifica los argumentos exactos** con los que se llamó a `signIn`. Esto asegura que:
1. **Provider**: se usa `'credentials'` (el provider de next-auth configurado en el backend)
2. **document**: el valor del input de documento
3. **password**: el valor del input de contraseña
4. **documentType**: `'cedula'` (el value de la opción seleccionada en el Autocomplete)
5. **redirect**: `false` (el componente maneja la redirección manualmente con `router.replace`)
6. **callbackUrl**: `'/home'` (dónde redirigir después del login)

**¿Por qué `documentType: 'cedula'`?**

El Autocomplete tiene opciones como `{ code: 'cedula', name: 'Cédula de Ciudadanía' }`, `{ code: 'nit', name: 'NIT' }`, etc. Cuando presionamos `{ArrowDown}{Enter}`, selecciona la primera opción, que es `cedula`.

**¿Dónde se transforma el objeto `{ code: 'cedula', name: '...' }` a solo `'cedula'`?**

En el componente `Login`, hay un `onChange` en el Autocomplete que extrae `option.code` y lo guarda en el formulario. El test no necesita probar esa transformación — solo verifica que el valor final enviado al API es `'cedula'`.

### Línea 106: `mockRouter.replace.toHaveBeenCalledWith('/home')`

Después de una autenticación exitosa, el componente debe redirigir al home.

**¿Por qué `router.replace` y no `router.push`?**

`replace` cambia la URL sin agregar una entrada al historial del navegador. Esto significa que si el usuario está en `/login` y hace login, al presionar "Atrás" no vuelve al login. Es la práctica correcta para post-login.

### Resumen del flujo exitoso

```
fillLoginForm → llena tipo documento, documento, contraseña
       │
       ▼
user.click(submit)
       │
       ▼
handleSubmit: datos válidos ✅
       │
       ▼
signIn('credentials', { document, password, ... })
       │
       ▼
mockSignIn.mockResolvedValue({ url: '/home' })
       │
       ▼
router.replace('/home')
```

---

## Sección 6: Cuarto test — Autenticación fallida (líneas 109-125)

```tsx
it('no redirige cuando las credenciales son incorrectas', async () => {
  const user = userEvent.setup()

  mockSignIn.mockResolvedValue(createSignInResponse(null, 'CredentialsSignin'))

  render(<Login mode='light' />)

  await fillLoginForm(user)
  await user.click(getSubmitButton())

  await waitFor(() => {
    expect(mockSignIn).toHaveBeenCalled()
  })

  expect(mockRouter.replace).not.toHaveBeenCalled()
})
```

### Línea 112: `createSignInResponse(null, 'CredentialsSignin')`

devuelve:

```tsx
{ url: null, error: 'CredentialsSignin' }
```

**`url: null`** significa que next-auth NO obtuvo una URL de redirección (porque el login falló).
**`error: 'CredentialsSignin'`** es el código de error estándar de next-auth para credenciales inválidas.

### Diferencia clave con el test exitoso

En el test exitoso, verificamos:
1. **Los argumentos exactos** de `signIn` (con `toHaveBeenCalledWith`)
2. **Que `router.replace` fue llamado** (redirección)

En el test fallido, solo verificamos:
1. **Que `signIn` fue llamado** (sin importar los argumentos — ya probamos eso arriba)
2. **Que `router.replace` NO fue llamado** (no hay redirección)

### ¿Por qué no probamos los mensajes de error?

El componente actual **no muestra un toast de error** cuando la autenticación falla (o tal vez sí, pero no lo estamos probando). Si quisiéramos probar el toast, agregaríamos:

```tsx
expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument()
```

Pero el toast de react-hot-toast se renderiza en un portal (como un div al final del `<body>`). Con el wrapper `<Toaster />` en nuestro custom render, el toast debería aparecer en el DOM.

---

## Conceptos fundamentales para entender

### ¿Qué es jsdom?

jsdom es una implementación en JavaScript puro de los estándares web (WHATWG DOM y HTML). Permite que Node.js ejecute código que normalmente solo funcionaría en un navegador.

**Lo que jsdom SÍ hace:**
- `document.createElement`, `document.querySelector`, `element.addEventListener`
- `window`, `document`, `navigator`
- Renderizado básico de HTML/CSS (sin layout real)
- Eventos del DOM (click, submit, change)

**Lo que jsdom NO hace:**
- Layout visual (no puedes medir `offsetWidth`, `getBoundingClientRect` confiable)
- Scroll real
- Rendering de portales de MUI (Popper, Modal, Dialog se renderizan pero no se posicionan)
- Animaciones CSS
- `matchMedia`, `IntersectionObserver`, `ResizeObserver` (hay que mockearlos)

### ¿Qué es el `clearMocks: true` en vitest.config.ts?

Vitest reemplaza automáticamente el `beforeEach` que antes tenía el archivo:

```tsx
// ❌ Ya no necesitas esto
beforeEach(() => {
  vi.clearAllMocks()
})
```

`clearMocks: true` hace que **entre cada test**, Vitest ejecute `vi.clearAllMocks()` automáticamente. Esto resetea:
- `mock.calls` → el historial de llamadas se vacía
- `mock.instances` → las instancias se limpian
- `mock.results` → los resultados se borran

Pero **preserva**:
- La implementación del mock (`mockImplementation`, `mockResolvedValue`)
- Las `vi.mock()` calls (los módulos siguen siendo reemplazados)

### ¿Qué es `vitest`?

Vitest es un corredor de tests que comparte configuración con Vite (el bundler de Next.js). Es **nativamente compatible** con:
- `tsconfig.json` paths (`@/`)
- Plugins de Vite (`@vitejs/plugin-react`)
- TypeScript sin configuración adicional
- Hot Module Replacement (HMR) para tests en watch mode

Ventajas sobre Jest:
- **10-20x más rápido** (usa esbuild para transformación)
- **Misma configuración que Vite** (no necesitas jest.config.ts separado)
- **ESM nativo** (sin problemas de módulos)
- **`vi` API** más moderna que `jest` API

### ¿Qué es `waitFor` y cuándo usarlo?

`waitFor` es una función de React Testing Library que **espera** hasta que el callback deje de lanzar errores.

**Úsalo cuando:**
- Un elemento aparece después de una operación asíncrona
- Un elemento desaparece después de una operación
- El DOM cambia como resultado de un re-render

**NO uses `waitFor` cuando:**
- El elemento ya está en el DOM desde el render inicial
- Estás verificando algo síncrono

### ¿Qué son los mocks y por qué los necesitamos?

Un **mock** reemplaza una dependencia real con una versión controlada por el test. Esto es necesario porque:

1. **Las dependencias reales no existen en el entorno de test**: next-auth necesita un servidor, cookies, sesiones reales. En jsdom no hay servidor.
2. **Queremos aislar el componente**: si el test falla, debe ser por un bug en el componente, no porque el servidor de auth esté caído.
3. **Queremos controlar escenarios**: podemos simular éxito, error, timeout, etc., sin necesidad de un entorno real.
4. **Velocidad**: las llamadas a APIs reales son lentas (100-500ms). Los mocks son instantáneos.

### ¿Por qué usamos `waitFor` solo en algunas assertions y no en todas?

```tsx
// ✅ Dentro de waitFor — operación asíncrona que puede tardar
await waitFor(() => {
  expect(mockSignIn).toHaveBeenCalledWith(...)
})

// ✅ Fuera de waitFor — operación síncrona, ya debería haber ocurrido
expect(mockRouter.replace).toHaveBeenCalledWith('/home')
```

`mockSignIn` se llama dentro de `handleSubmit`, que es async. React Hook Form ejecuta la validación y luego llama a `signIn`. Todo esto ocurre en microtasks. `waitFor` espera a que el mock sea llamado.

`mockRouter.replace` se llama **después** de que `signIn` se resuelve. Pero como estamos en el mismo test, para cuando `waitFor` termina, `replace` ya debería haberse ejecutado. Lo ponemos fuera porque es una verificación secundaria que no necesita esperar adicional.

### ¿Qué pasa si ejecuto el test sin mocks?

Sin los `vi.mock()`, el componente `Login` intentaría importar módulos reales:
- `next-auth/react` → `signIn` intentaría hacer una petición HTTP real → error de red
- `next/navigation` → `useRouter` devolvería el router real → pero no hay página Next.js real → crash
- `@core/hooks/useSettings` → intentaría leer configuración del tema → fallaría porque no hay contexto

El test ni siquiera llegaría a renderizar el componente.

---

## Diagrama completo del flujo del test de autenticación exitosa

```
1. mockSignIn.mockResolvedValue({ url: '/home' })
   ───────────────────────────────────────────────
   Preparamos el mock para que devuelva éxito

2. render(<Login mode='light' />)
   ───────────────────────────────
   |__ ThemeProvider (MUI)
   |__ Login
   |     |__ useSettings → createMockSettings()
   |     |__ useImageVariant → '/images/...'
   |     |__ useRouter → mockRouter
   |     |__ signIn → (...args) => mockSignIn(...args)
   |__ Toaster

3. await fillLoginForm(user)
   ─────────────────────────
   |__ click(combobox)
   |__ keyboard('{ArrowDown}{Enter}') → selecciona 'cedula'
   |__ type(documentInput, '123456789')
   |__ type(passwordInput, 'password123')

4. await user.click(submitButton)
   ──────────────────────────────
   |__ handleSubmit (react-hook-form)
   |__ validación: ✅ datos válidos
   |__ signIn('credentials', {
   |     document: '123456789',
   |     password: 'password123',
   |     documentType: 'cedula',
   |     redirect: false,
   |     callbackUrl: '/home'
   |   })
   |__ mockSignIn(...) → Promise.resolve({ url: '/home' })
   |__ router.replace('/home')

5. expect(mockSignIn).toHaveBeenCalledWith(...) → ✅
   ─────────────────────────────────────────────
   Vitest verifica que signIn fue llamado con
   los argumentos exactos

6. expect(mockRouter.replace).toHaveBeenCalledWith('/home') → ✅
   ────────────────────────────────────────────────────────
   Vitest verifica que la redirección ocurrió
```

---

## Tabla de queries usadas en el test

| Línea | Query | ¿Qué busca? | ¿Por qué esta query? |
|---|---|---|---|
| 30 | `getByRole('button', { name: /iniciar sesi/i })` | El botón de submit | `button` es el rol semántico correcto; el nombre viene del texto del botón |
| 34 | `document.querySelector('input[name="password"]')` | Input de contraseña | Los password inputs no tienen role; el label tiene unicode problemático |
| 42 | `getByRole('combobox', { name: /Tipo de documento/i })` | Autocomplete de tipo doc | MUI Autocomplete expone role combobox; el label es correcto |
| 50 | `getByRole('textbox', { name: /Documento de identidad/i })` | Input de documento | TextField normal con role textbox y label correcto |
| 59 | `getByText(/Bienvenido a Naturex/i)` | Título principal | Texto decorativo no interactivo, getByText es suficiente |
| 76-77 | `getByText(/...es requerido/i)` | Mensajes de error | Texto que aparece después de validación fallida |
| 78 | `toHaveAttribute('aria-invalid', 'true')` | Estado de error del input | MUI agrega aria-invalid automáticamente en errores |

---

## Preguntas frecuentes

### ¿Por qué el test no prueba el toast de error?

El componente actual podría o no mostrar un toast cuando falla la autenticación. Depende de la implementación. El test actual solo verifica que no hay redirección. Para probar el toast, se necesitaría: `expect(screen.getByText(/error/i)).toBeInTheDocument()`.

### ¿Cómo sé qué mockear?

1. Mira los imports del componente
2. Cada import externo (no relativo a tu proyecto) debe ser mockeado
3. Cada hook de contexto (`useSettings`, `useRouter`) debe ser mockeado
4. Si el componente hace fetch a un API, mockea ese fetch

### ¿Puedo tener varios tests que compartan el mismo mock?

Sí, de hecho eso es lo que hacemos. Todos los tests comparten `mockSignIn` y `mockRouter`. La clave es configurar el valor de retorno en cada test con `mockResolvedValue` o similar.

### ¿Qué pasa si el componente cambia?

Si alguien agrega un nuevo campo al formulario, los tests de renderizado fallarán hasta que agreguemos la assertion correspondiente. Esto es **bueno** — significa que los tests nos obligan a considerar el cambio explícitamente.

Si alguien cambia la implementación interna (ej: refactoriza el estado) pero el comportamiento del usuario no cambia, los tests deben **seguir pasando**. Si fallan, es porque estamos probando implementación, no comportamiento.
