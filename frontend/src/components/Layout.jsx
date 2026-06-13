import { Link, useLocation, useNavigate } from "react-router-dom";
import { Leaf, LayoutDashboard, PlusCircle, Trophy, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
  { to: "/log", label: "Log Activity", icon: PlusCircle, testId: "nav-log-activity" },
  { to: "/achievements", label: "Achievements", icon: Trophy, testId: "nav-achievements" },
];

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-[#1A2E20] text-sm"
      >
        Skip to main content
      </a>
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[#E5E2DA] bg-white fixed inset-y-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-6 h-16 border-b border-[#E5E2DA]" data-testid="sidebar-logo">
          <span className="w-8 h-8 rounded-lg bg-[#1A2E20] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#8BA888]" />
          </span>
          <span className="font-heading font-extrabold text-lg tracking-tight text-[#1A2E20]">EcoTrace</span>
        </Link>
        <nav className="flex-1 px-3 py-6 space-y-1" aria-label="Main navigation">
          {NAV.map(({ to, label, icon: Icon, testId }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-testid={testId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#1A2E20] text-white"
                    : "text-[#5C6B61] hover:bg-[#F9F8F6] hover:text-[#1A2E20]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-[#E5E2DA]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#8BA888] flex items-center justify-center text-white text-sm font-bold" data-testid="user-avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1A2E20] truncate" data-testid="user-name">{user?.name}</p>
              <p className="text-xs text-[#5C6B61] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#5C6B61] hover:bg-[#F9F8F6] hover:text-[#E06D53] transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-[#E5E2DA] flex items-center justify-between px-4 h-14">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#1A2E20] flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-[#8BA888]" />
          </span>
          <span className="font-heading font-extrabold text-[#1A2E20]">EcoTrace</span>
        </Link>
        <button onClick={handleLogout} data-testid="logout-button-mobile" aria-label="Sign out" className="text-[#5C6B61]">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E2DA] flex">
        {NAV.map(({ to, label, icon: Icon, testId }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              data-testid={`${testId}-mobile`}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
                active ? "text-[#1A2E20]" : "text-[#5C6B61]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>

      <main id="main-content" className="flex-1 md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0">{children}</main>
    </div>
  );
};
