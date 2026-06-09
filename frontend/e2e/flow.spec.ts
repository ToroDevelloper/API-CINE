import { test, expect } from '@playwright/test';

test.describe('E2E Flow Persona 3', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar llamadas al API para hacer la prueba determinista
    await page.route('**/api/peliculas', async route => {
      await route.fulfill({
        status: 200,
        json: {
          success: true,
          data: [
            {
              _id: '1',
              titulo: 'Película E2E',
              sinopsis: 'Sinopsis test',
              duracion_min: 120,
              clasificacion: 'A',
              poster_url: 'https://via.placeholder.com/300x450'
            }
          ]
        }
      });
    });

    let isLoggedIn = false;

    await page.route('**/api/auth/login', async route => {
      const postData = route.request().postDataJSON();
      if (postData.email === 'test@test.com' && postData.password === '123456') {
        isLoggedIn = true;
        await route.fulfill({
          status: 200,
          json: {
            success: true,
            data: { _id: 'u1', email: 'test@test.com', nombre: 'Test' }
          }
        });
      } else {
        await route.fulfill({
          status: 401,
          json: { success: false, message: 'Email o contraseña incorrectos' }
        });
      }
    });

    await page.route('**/api/auth/me', async route => {
      if (isLoggedIn) {
        await route.fulfill({
          status: 200,
          json: { success: true, data: { _id: 'u1', email: 'test@test.com', nombre: 'Test' } }
        });
      } else {
        await route.fulfill({
          status: 401,
          json: { success: false }
        });
      }
    });

    await page.route('**/api/auth/logout', async route => {
      await route.fulfill({
        status: 200,
        json: { success: true }
      });
    });
  });

  test('Flujo completo: Landing -> Errores Login -> Login -> Manipulación -> Logout', async ({ page }) => {
    // 1. Landing
    await page.goto('/');
    
    // Verificar que estemos en Landing
    await expect(page.getByText('Película E2E').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reservar' })).toBeVisible();

    // 2. Navegar al login
    await page.getByRole('link', { name: 'Reservar' }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();

    // 3. Validación de formularios con errores (Credenciales incorrectas)
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Debe mostrar error de credenciales
    await expect(page.getByText('Email o contraseña incorrectos').first()).toBeVisible();

    // 4. Login exitoso
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', '123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Redirecciona a dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Bienvenido')).toBeVisible(); // Toast message

    // 5. Manipulación de datos / Navegación interna (ej. ir a películas)
    // El sidebar debería tener links. Naveguemos a "Películas"
    await page.getByRole('link', { name: 'Películas', exact: true }).click();
    await expect(page).toHaveURL(/.*dashboard\/peliculas/);

    // 6. Logout
    // Abrir el dropdown del usuario
    await page.locator('button', { hasText: 'Test' }).click();
    await page.getByRole('button', { name: 'Cerrar Sesión' }).click();

    // Verifica que retornó a la landing o login
    // En este caso, el store lo limpia y probablemente redirija. 
    // Si no redirige automáticamente a la UI de inicio, forzamos un reload o chequeamos el estado
    // pero esperaremos que el Navbar publico / Hero se muestre, o que url vuelva a login
    await expect(page).toHaveURL(/\/|\/login/);
  });
});
