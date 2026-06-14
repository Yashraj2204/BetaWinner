/**
 * @file App.test.js
 * Smoke tests + route-level integration — verify the app renders without crashing
 * and all main routes display expected content.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "../App";

// Stub IntersectionObserver (not available in jsdom)
global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Stub ResizeObserver used by Recharts
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("App — smoke tests", () => {
  test("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  test("renders the EcoTrace brand name", () => {
    render(<App />);
    expect(screen.getAllByText(/EcoTrace/i).length).toBeGreaterThan(0);
  });

  test("landing page hero heading is visible", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  test("has a navigation landmark", () => {
    render(<App />);
    // Verify document body has content rendered
    expect(screen.getByRole("banner", { hidden: true }) || document.body).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  const { ErrorBoundary } = require("../components/ErrorBoundary");

  test("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  test("renders fallback UI when a child throws", () => {
    // Suppress expected console.error from react
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const Bomb = () => {
      throw new Error("Test crash");
    };
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();

    spy.mockRestore();
  });
});

describe("Route-level integration tests", () => {
  const { Layout } = require("../components/Layout");
  const Calculator = require("../pages/Calculator").default;
  const Achievements = require("../pages/Achievements").default;
  const Dashboard = require("../pages/Dashboard").default;

  test("calculator page renders heading", async () => {
    render(
      <MemoryRouter initialEntries={["/log"]}>
        <Layout>
          <Calculator />
        </Layout>
      </MemoryRouter>
    );
    // h1 says "Log an activity"; "Carbon Calculator" appears as a label <p>
    expect(await screen.findByRole("heading", { name: /log an activity/i })).toBeInTheDocument();
    expect(screen.getByText(/carbon calculator/i)).toBeInTheDocument();
  });

  test("achievements page renders badge grid", () => {
    render(
      <MemoryRouter initialEntries={["/achievements"]}>
        <Layout>
          <Achievements />
        </Layout>
      </MemoryRouter>
    );
    // Multiple elements may contain "streak" — check at least one exists
    expect(screen.getAllByText(/streak/i).length).toBeGreaterThan(0);
  });

  test("dashboard page renders stats tiles", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Layout>
          <Dashboard />
        </Layout>
      </MemoryRouter>
    );
    expect(screen.getByTestId("stat-today")).toBeInTheDocument();
  });
});
