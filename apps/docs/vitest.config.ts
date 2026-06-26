import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Die Playwright-Specs unter `tests/` laufen über Playwright (eigener Runner),
// nicht über vitest — sonst kollidiert `test()` aus @playwright/test mit vitest.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["tests/**", "node_modules/**", "dist/**"],
    },
  }),
);
