/**
 * @file interactions.test.js
 * Integration/interaction tests for EcoTrace UI components.
 *
 * Uses @testing-library/react + @testing-library/user-event to
 * simulate real user behaviour (clicks, typing, navigation).
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

// ── Browser API stubs (same as setupTests.js) ──────────────────────────────
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ─── 1. Calculator — submit flow with toast ─────────────────────────────────

describe("Calculator — user interaction flow", () => {
  let Calculator;
  beforeAll(() => {
    Calculator = require("../pages/Calculator").default;
  });

  const renderCalc = () =>
    render(
      <MemoryRouter>
        <Calculator />
      </MemoryRouter>
    );

  test("renders the calculator page heading", () => {
    renderCalc();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/log an activity/i);
  });

  test("category tabs are clickable and update the activity list", async () => {
    const user = userEvent.setup();
    renderCalc();

    // Default category is "transport" — verify the tab is pressed
    const transportTab = screen.getByTestId("category-tab-transport");
    expect(transportTab).toHaveAttribute("aria-pressed", "true");

    // Switch to "food" category
    const foodTab = screen.getByTestId("category-tab-food");
    await user.click(foodTab);
    expect(foodTab).toHaveAttribute("aria-pressed", "true");
    expect(transportTab).toHaveAttribute("aria-pressed", "false");

    // Food activities should now be visible
    expect(screen.getByTestId("activity-type-beef")).toBeInTheDocument();
  });

  test("selecting an activity type enables the value input", async () => {
    const user = userEvent.setup();
    renderCalc();

    const input = screen.getByTestId("activity-value-input");
    expect(input).toBeDisabled();

    // Select an activity
    await user.click(screen.getByTestId("activity-type-car_petrol"));
    expect(input).not.toBeDisabled();
  });

  test("typing a value shows a CO₂ preview", async () => {
    const user = userEvent.setup();
    renderCalc();

    // Select car petrol
    await user.click(screen.getByTestId("activity-type-car_petrol"));

    // Type 25 km
    const input = screen.getByTestId("activity-value-input");
    await user.clear(input);
    await user.type(input, "25");

    // Preview should show 5.25 kg CO₂
    const preview = screen.getByTestId("co2-preview");
    expect(preview).toHaveTextContent(/5\.25/);
    expect(preview).toHaveTextContent(/kg CO₂/);
  });

  test("submit button is disabled when no activity or value is selected", () => {
    renderCalc();
    const submitBtn = screen.getByTestId("log-activity-submit-button");
    expect(submitBtn).toBeDisabled();
  });

  test("submit button enables after selecting type and entering value", async () => {
    const user = userEvent.setup();
    renderCalc();

    await user.click(screen.getByTestId("activity-type-bus"));
    const input = screen.getByTestId("activity-value-input");
    await user.clear(input);
    await user.type(input, "10");

    const submitBtn = screen.getByTestId("log-activity-submit-button");
    expect(submitBtn).not.toBeDisabled();
  });
});

// ─── 2. InsightsPanel — generate button interaction ─────────────────────────

describe("InsightsPanel — generate insights interaction", () => {
  let InsightsPanel;
  beforeAll(() => {
    InsightsPanel = require("../components/InsightsPanel").InsightsPanel;
  });

  test("shows empty state initially", () => {
    render(<InsightsPanel />);
    expect(screen.getByTestId("insights-empty-state")).toBeInTheDocument();
    expect(screen.getByText(/click/i)).toBeInTheDocument();
  });

  test("clicking Generate reveals insight content", async () => {
    const user = userEvent.setup();
    render(<InsightsPanel />);

    const btn = screen.getByTestId("generate-insights-button");
    expect(btn).toHaveTextContent("Generate");

    await user.click(btn);

    expect(screen.getByTestId("insights-content")).toBeInTheDocument();
    expect(btn).toHaveTextContent("Refresh");
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });
});

// ─── 3. Achievements — badge rendering and streak ───────────────────────────

describe("Achievements — badges and streak display", () => {
  let Achievements;
  beforeAll(() => {
    Achievements = require("../pages/Achievements").default;
  });

  test("renders the achievements page with correct heading", () => {
    render(<Achievements />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/your eco journey/i);
  });

  test("displays the streak card with days count", () => {
    render(<Achievements />);
    const streakCard = screen.getByTestId("streak-card");
    expect(streakCard).toBeInTheDocument();
    expect(streakCard).toHaveTextContent(/days/i);
  });

  test("displays correct streak days count when dates are present in localStorage", () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("ecotrace_activity_dates", JSON.stringify([today]));
    render(<Achievements />);
    const streakCard = screen.getByTestId("streak-card");
    expect(streakCard).toHaveTextContent("1days");
    localStorage.removeItem("ecotrace_activity_dates");
  });

  test("renders all 9 badges", () => {
    render(<Achievements />);
    const badges = [
      "first-step",
      "green-week",
      "low-carbon",
      "streak-10",
      "data-nerd",
      "eco-explorer",
      "light-touch",
      "ai-insight",
      "champion",
    ];
    badges.forEach((id) => {
      expect(screen.getByTestId(`badge-${id}`)).toBeInTheDocument();
    });
  });

  test("earned badges show 'Unlocked' label", () => {
    render(<Achievements />);
    // first-step, green-week, and low-carbon are earned
    const firstStep = screen.getByTestId("badge-first-step");
    expect(firstStep).toHaveTextContent(/unlocked/i);

    const streak10 = screen.getByTestId("badge-streak-10");
    expect(streak10).not.toHaveTextContent(/unlocked/i);
  });

  test("badges summary card shows earned count", () => {
    render(<Achievements />);
    const summary = screen.getByTestId("badges-summary-card");
    expect(summary).toHaveTextContent("3");
    expect(summary).toHaveTextContent("/ 9");
  });
});

// ─── 4. Dashboard — delete activity interaction ─────────────────────────────

describe("Dashboard — activity row interaction", () => {
  let Dashboard;
  beforeAll(() => {
    Dashboard = require("../pages/Dashboard").default;
  });

  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

  test("renders dashboard page with key metrics", () => {
    renderDashboard();
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.getByTestId("stat-today")).toBeInTheDocument();
    expect(screen.getByTestId("stat-week")).toBeInTheDocument();
    expect(screen.getByTestId("stat-streak")).toBeInTheDocument();
  });

  test("clicking delete removes an activity row", async () => {
    const user = userEvent.setup();
    renderDashboard();

    // Verify activity row 1 exists
    expect(screen.getByTestId("activity-row-1")).toBeInTheDocument();

    // Click delete
    const deleteBtn = screen.getByTestId("delete-activity-1");
    await user.click(deleteBtn);

    // Row should be removed
    expect(screen.queryByTestId("activity-row-1")).not.toBeInTheDocument();
  });
});

// ─── 5. Utility functions — unit tests ──────────────────────────────────────

describe("formatApiErrorDetail — edge cases", () => {
  const { formatApiErrorDetail } = require("../lib/api");

  test("returns default message for null", () => {
    expect(formatApiErrorDetail(null)).toBe("Something went wrong. Please try again.");
  });

  test("returns string as-is", () => {
    expect(formatApiErrorDetail("bad request")).toBe("bad request");
  });

  test("joins array of error objects", () => {
    const detail = [{ msg: "field required" }, { msg: "invalid email" }];
    expect(formatApiErrorDetail(detail)).toBe("field required invalid email");
  });

  test("extracts msg from single object", () => {
    expect(formatApiErrorDetail({ msg: "not found" })).toBe("not found");
  });

  test("stringifies unknown types", () => {
    expect(formatApiErrorDetail(42)).toBe("42");
  });
});
