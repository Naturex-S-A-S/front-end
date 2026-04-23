import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

// Test para iniciar sesión (mock de la API de login).
test('iniciar sesión', async ({ page }) => {
  // Ajusta la URL según tu entorno de desarrollo (por defecto http://localhost:3000/login).
  await page.goto('http://localhost:3000/login');

  // Interceptar la petición de login y devolver una respuesta simulada.
  await page.route('**/api/login', route =>
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'fake-token',
        user: { name: 'Test User', email: 'test@example.com' },
      }),
    })
  );

  // Rellenar el formulario de login (ajusta selectores si tu formulario usa otros).
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Esperar que la aplicación refleje el estado de sesión (ej. mostrando el nombre de usuario).
  await expect(page.getByText('Test User', { exact: false })).toBeVisible();

  // Verificar que el token se almacenó en localStorage (si tu app guarda el token ahí).
  const token = await page.evaluate(() => localStorage.getItem('token'));

  expect(token).toBe('fake-token');
});
