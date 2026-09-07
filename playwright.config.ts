import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const PORT = Number(process.env.E2E_PORT || 5173);
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${PORT}`;
const frontendDir = path.join(__dirname, "frontend");

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "smoke.spec.ts",
  fullyParallel: true,
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  reporter: process.env.CI ? [["dot"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: `npm run dev:e2e -- --port ${PORT}`,
    cwd: frontendDir,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_ENABLE_E2E_AUTH: "true",
      VITE_AUTH_PROVIDER: "portal",
      VITE_AUTH_MODE: "password",
      VITE_API_BASE_URL: "http://127.0.0.1:7777",
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_ANON_KEY: "e2e-local-anon-key",
      VITE_ALLOWED_EMAIL_DOMAINS: "nilehive.test,nileuniversity.edu.ng"
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" }
    }
  ]
});
