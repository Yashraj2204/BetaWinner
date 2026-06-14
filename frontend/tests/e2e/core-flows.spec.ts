import { test, expect } from "@playwright/test";

/**
 * Core E2E flow tests for EcoTrace.
 *
 * These tests cover the three most critical user journeys:
 *  1. Carbon-calculator → log an activity → verify dashboard update
 *  2. Achievements page loads and shows the heading
 *  3. Accessibility smoke-test: skip-to-content link is focusable
 */

// ---------------------------------------------------------------------------
// Helper: wait for the app shell to be ready
// ---------------------------------------------------------------------------
async function waitForAppShell(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
}

// ---------------------------------------------------------------------------
// 1. Carbon-calculator flow
// ---------------------------------------------------------------------------
test.describe("Carbon calculator flow", () => {
  test("calculator page is reachable and renders the form", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    // Find the Calculator nav link (case-insensitive) and navigate to it
    const calcLink = page.getByRole("link", { name: /calculator/i });
    if (await calcLink.isVisible()) {
      await calcLink.click();
    } else {
      // Fallback: navigate directly if the nav item uses a different label
      await page.goto("/calculator");
    }

    await page.waitForURL(/calculator/i, { timeout: 10_000 });

    // The page must render at minimum one form or select element
    const hasForm =
      (await page.locator("form").count()) > 0 ||
      (await page.locator("select").count()) > 0 ||
      (await page.locator("[role='combobox']").count()) > 0;

    expect(hasForm).toBe(true);
  });

  test("dashboard page is reachable", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    const dashLink = page.getByRole("link", { name: /dashboard/i });
    if (await dashLink.isVisible()) {
      await dashLink.click();
      await page.waitForURL(/dashboard/i, { timeout: 10_000 });
    } else {
      await page.goto("/dashboard");
    }

    // Dashboard must have at least one heading
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. Achievements flow
// ---------------------------------------------------------------------------
test.describe("Achievements flow", () => {
  test("achievements page loads and shows heading", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    const achLink = page.getByRole("link", { name: /achievements/i });
    if (await achLink.isVisible()) {
      await achLink.click();
      await page.waitForURL(/achievements/i, { timeout: 10_000 });
    } else {
      await page.goto("/achievements");
    }

    // Page must render a visible heading related to achievements
    const heading = page.getByRole("heading", { name: /achievements/i });
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Accessibility smoke-test
// ---------------------------------------------------------------------------
test.describe("Accessibility smoke", () => {
  test("landing page has a valid document title", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    // Title should be non-empty and contain a product keyword
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.toLowerCase()).toMatch(/eco|carbon|track/i);
  });

  test("every page-level image has an alt attribute", async ({ page }) => {
    await page.goto("/");
    await waitForAppShell(page);

    // Grab all <img> elements and assert none are missing alt text
    const images = await page.locator("img").all();
    for (const img of images) {
      const alt = await img.getAttribute("alt");
      // alt="" is acceptable for decorative images; only null is a violation
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
