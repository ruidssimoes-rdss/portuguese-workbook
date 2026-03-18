import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { browserName: "chromium", viewport: { width: 1280, height: 720 } },
    },
    {
      name: "Mobile Safari",
      use: { browserName: "webkit", viewport: { width: 375, height: 812 } },
    },
  ],
});
