import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E test configuration.
 * Runs against a locally-served CRA dev-server (npm start / craco start).
 * In CI the webServer block starts the server automatically.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  /** Directory that contains all E2E spec files */
  testDir: "./tests/e2e",

  /** Run tests in files in parallel */
  fullyParallel: true,

  /** Fail the build on CI if you accidentally left test.only in source */
  forbidOnly: !!process.env.CI,

  /** Retry once on CI to absorb flakiness */
  retries: process.env.CI ? 1 : 0,

  /** Limit parallelism on CI to avoid resource contention */
  workers: process.env.CI ? 2 : undefined,

  /** Reporter: HTML in CI for artifact upload; list in local dev */
  reporter: process.env.CI
    ? [["html", { outputFolder: "playwright-report", open: "never" }], ["github"]]
    : [["list"]],

  use: {
    /** Base URL so tests can use relative paths: page.goto('/') */
    baseURL: "http://localhost:3000",

    /** Collect trace on first retry to debug flaky tests */
    trace: "on-first-retry",

    /** Run headlessly in CI, headed locally when PWDEBUG=1 */
    headless: true,

    /** Viewport matching the most common laptop resolution */
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /**
   * Start the CRA dev-server automatically before running tests.
   * `reuseExistingServer` lets you run `npm start` yourself and skip
   * the cold-start wait during local development.
   */
  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
