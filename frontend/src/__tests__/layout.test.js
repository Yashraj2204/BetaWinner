import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { Layout } from "../components/Layout";

// Stub IntersectionObserver
global.IntersectionObserver = class {
  observe()    {}
  unobserve()  {}
  disconnect() {}
};

describe("Layout component", () => {
  test("renders layout with children and highlights active desktop/mobile links", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Layout>
          <div data-testid="test-child">Child Content</div>
        </Layout>
      </MemoryRouter>
    );

    // Assert children are rendered
    expect(screen.getByTestId("test-child")).toBeInTheDocument();

    // Assert desktop sidebar logo and text
    expect(screen.getByTestId("sidebar-logo")).toBeInTheDocument();
    expect(screen.getByText("No account needed")).toBeInTheDocument();

    // Assert active states on dashboard navigation links
    const dashboardLink = screen.getByTestId("nav-dashboard");
    const dashboardLinkMobile = screen.getByTestId("nav-dashboard-mobile");

    expect(dashboardLink).toHaveAttribute("aria-current", "page");
    expect(dashboardLinkMobile).toHaveAttribute("aria-current", "page");

    const logLink = screen.getByTestId("nav-log-activity");
    const logLinkMobile = screen.getByTestId("nav-log-activity-mobile");

    expect(logLink).not.toHaveAttribute("aria-current");
    expect(logLinkMobile).not.toHaveAttribute("aria-current");
  });
});
