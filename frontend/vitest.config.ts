import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  configFile: false,
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'app/routes/home.tsx',
        'app/routes/login.tsx',
        'app/routes/register.tsx',
        'app/routes/dashboard/home.tsx',
        'app/components/ui/Button.tsx',
        'app/components/ui/Input.tsx',
        'app/components/ui/Alert.tsx',
        'app/stores/useAuthStore.ts',
        'app/stores/useCartStore.ts',
        'app/services/apiClient.ts',
        'app/services/axiosInstance.ts'
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      },
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        'vitest.config.ts',
        'vite.config.ts',
        'eslint.config.js',
        'tailwind.config.js',
        '**/*.d.ts',
        '.react-router/',
        'build/',
        'playwright.config.ts'
      ]
    }
  }
});
