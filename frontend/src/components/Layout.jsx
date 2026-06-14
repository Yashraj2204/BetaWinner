import { Link, useLocation } from "react-router-dom";
import { Leaf, LayoutDashboard, PlusCircle, Trophy } from "lucide-react";
import PropTypes from "prop-types";

/** @type {Array<{to: string, label: string, icon: React.ElementType, testId: string}>} */
const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
  { to: "/log", label: "Log Activity", icon: PlusCircle, testId: "nav-log-activity" },
  { to: "/achievements", label: "Achievements", icon: Trophy, testId: "nav-achievements" },
];

/**
 * Application shell — sidebar (desktop) + top/bottom navigation (mobile).
 * Wraps all authenticated-style pages without requiring real authentication.
 */
export const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex">
      {/* Skip navigation for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-[#1A2E20] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888]"
      >
        Skip to main content
      </a>

      {/* ── Sidebar (desktop ≥ md) ───────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-60 border-r border-[#E5E2DA] bg-white fixed inset-y-0"
        aria-label="Sidebar navigation"
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 px-6 h-16 border-b border-[#E5E2DA] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8BA888]"
          data-testid="sidebar-logo"
          aria-label="EcoTrace home"
        >
          <span
            className="w-8 h-8 rounded-lg bg-[#1A2E20] flex items-center justify-center"
            aria-hidden="true"
          >
            <Leaf className="w-4 h-4 text-[#8BA888]" />
          </span>
          <span className="font-heading font-extrabold text-lg tracking-tight text-[#1A2E20]">
            EcoTrace
          </span>
        </Link>

        <nav className="flex-1 px-3 py-6 space-y-1" aria-label="Main navigation">
          {NAV.map(({ to, label, icon: Icon, testId }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-testid={testId}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8BA888] ${
                  active
                    ? "bg-[#1A2E20] text-white"
                    : "text-[#4A5A50] hover:bg-[#F9F8F6] hover:text-[#1A2E20]"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-[#E5E2DA]">
          <p className="text-xs text-[#4A5A50]">No account needed</p>
          <p className="text-xs text-[#8BA888] font-semibold mt-0.5">
            Free to use · Open source data
          </p>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <div
        className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-[#E5E2DA] flex items-center px-4 h-14"
        role="banner"
      >
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#8BA888] rounded"
          aria-label="EcoTrace home"
        >
          <span
            className="w-7 h-7 rounded-lg bg-[#1A2E20] flex items-center justify-center"
            aria-hidden="true"
          >
            <Leaf className="w-3.5 h-3.5 text-[#8BA888]" />
          </span>
          <span className="font-heading font-extrabold text-[#1A2E20]">EcoTrace</span>
        </Link>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E2DA] flex"
        aria-label="Mobile navigation"
      >
        {NAV.map(({ to, label, icon: Icon, testId }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              data-testid={`${testId}-mobile`}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#8BA888] ${
                active ? "text-[#1A2E20]" : "text-[#4A5A50]"
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Page content ─────────────────────────────────────── */}
      <main id="main-content" className="flex-1 md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
};

Layout.propTypes = {
  /** Page content to render inside the layout shell. */
  children: PropTypes.node.isRequired,
};
