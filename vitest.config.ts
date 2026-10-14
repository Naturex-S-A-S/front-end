import { defineConfig } from "vitest/config";

import react from "@vitejs/plugin-react";

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/utils/tests/setup.ts"],
    globals: true,
    reporters: ["default"],
    css: true,
    clearMocks: true,
    testTimeout: 15000,
    hookTimeout: 15000,
    exclude: ["**/node_modules/**", "**/dist/**", "tests/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "src/utils/tests/**",
        "src/assets/**",
        "src/configs/**"
      ]
    }
  }
});
