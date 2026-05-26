/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/default */
/* eslint-disable import/namespace */
import { defineConfig } from 'vitest/config'

import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/utils/tests/setup.ts'],
    globals: true,
    css: true,
    clearMocks: true,
    exclude: ['node_modules', 'tests'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        'src/utils/tests/**',
        'src/assets/**',
        'src/configs/**',
      ],
    },
  },
})
