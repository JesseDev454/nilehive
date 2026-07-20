import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_STAGING_BASE_URL || "http://127.0.0.1:0";

export default defineConfig({
  testDir: "./tests/staging",
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI
    ? [["dot"], ["html", { outputFolder: "playwright-staging-report", open: "never" }]]
    : [["list"], ["html", { outputFolder: "playwright-staging-report", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "staging-chromium",
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" }
    },
    {
      name: "staging-mobile",
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"], channel: "chrome" }
    }
  ]
});
