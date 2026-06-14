import { test, expect } from "@playwright/test";

/**
 * Core E2E flow tests for EcoTrace.
 *
 * Route map (from App.js):
 *   /            → Landing
 *   /dashboard   → Dashboard
 *   /log         → Calculator  ← NOTE: route is /log, not /calculator
 *   /achievements → Achievements
 *
 * These tests cover the three most critical user journeys:
 *  1. Carbon-calculator (/log) — page renders its form UI
 *  2. Achievements page — loads and shows the h1 heading
 *  3. Accessibility smoke — title, alt text, root mount
 */

// ---------------------------------------------------------------------------
// Helper: wait for the app shell to be ready
// ---------------------------------------------------------------------------
async function waitForAppShell(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
}

// ---------------------------------------------------------------------------
// 1. Carbon-calculator flow  (route: /log)
// ---------------------------------------------------------------------------
test.describe("Carbon calculator flow", () => {
  test("calculator page is reachable and renders the form", async ({ page }) => {
    // Navigate directly to /log (the actual route in App.js)
    await page.goto("/log");
    await waitForAppShell(page);

    // The URL must be /log
    await expect(page).toHaveURL(/\/log/);

    // The page must render at least one interactive form element
    // Calculator renders category buttons + a quantity input
    const hasInteractiveElement =
      (await page.locator("button").count()) > 0 ||
      (await page.locator("input").count()) > 0 ||
      (await page.locator("select").count()) > 0;

    expect(hasInteractiveElement).toBe(true);
  });

  test("calculator page has a visible heading", async ({ page }) => {
    await page.goto("/log");
    await waitForAppShell(page);

    // Must have at least one heading rendered
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test("dashboard page is reachable", async ({ page }) => {
    await page.goto("/dashboard");
    await waitForAppShell(page);

    await expect(page).toHaveURL(/\/dashboard/);

    // Dashboard must have at least one heading
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 2. Achievements flow  (route: /achievements)
// ---------------------------------------------------------------------------
test.describe("Achievements flow", () => {
  test("achievements page loads and shows the page heading", async ({ page }) => {
    await page.goto("/achievements");
    await waitForAppShell(page);

    await expect(page).toHaveURL(/\/achievements/);

    // The Achievements page h1 reads "Your eco journey" (see Achievements.jsx line 138-140).
    // We match it by role=heading rather than by text so the test is resilient to copy changes.
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible({ timeout: 10_000 });
  });

  test("achievements page shows the streak card", async ({ page }) => {
    await page.goto("/achievements");
    await waitForAppShell(page);

    // data-testid="streak-card" is present in Achievements.jsx line 146
    await expect(page.getByTestId("streak-card")).toBeVisible({ timeout: 10_000 });
  });

  test("achievements page shows the badge grid", async ({ page }) => {
    await page.goto("/achievements");
    await waitForAppShell(page);

    // At least one badge card should be rendered
    const firstBadge = page.getByTestId("badge-first-step");
    await expect(firstBadge).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Accessibility smoke-test
// ---------------------------------------------------------------------------
test.describe("Accessibility smoke", () => {
  test("landing page has a valid document title", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    // Title should be non-empty and contain an EcoTrace keyword
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toMatch(/eco|carbon|track/i);
  });

  test("every page-level image has an alt attribute", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    // All <img> elements must have an alt attribute (empty string is ok for decorative images)
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      // null means the attribute is missing entirely — that is a violation
      expect(alt).not.toBeNull();
    }
  });

  test("root element is present and mounted", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    // The CRA root div must contain at least one child (app has rendered)
    const root = page.locator("#root");
    await expect(root).toBeVisible();
    const childCount = await root.evaluate((el) => el.childElementCount);
    expect(childCount).toBeGreaterThan(0);
  });
});
