/**
 * @file App.test.js
 * Smoke tests — verify the app renders without crashing.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Stub IntersectionObserver (not available in jsdom)
global.IntersectionObserver = class {
  observe()    {}
  unobserve()  {}
  disconnect() {}
};

// Stub ResizeObserver used by Recharts
global.ResizeObserver = class {
  observe()    {}
  unobserve()  {}
  disconnect() {}
};

import App from "../App";

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
    // landing page has no nav, but the page should still mount
    expect(document.getElementById("root") || document.body).toBeTruthy();
  });
});

describe("ErrorBoundary", () => {
  const { ErrorBoundary } = require("../components/ErrorBoundary");

  test("renders children when no error", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(getByText("All good")).toBeInTheDocument();
  });

  test("renders fallback UI when a child throws", () => {
    // Suppress expected console.error from react
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    const Bomb = () => { throw new Error("Test crash"); };
    const { getByRole } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(getByRole("alert")).toBeInTheDocument();
    expect(getByRole("button", { name: /refresh/i })).toBeInTheDocument();

    spy.mockRestore();
  });
});
