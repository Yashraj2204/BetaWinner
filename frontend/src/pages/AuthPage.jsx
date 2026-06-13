import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatApiErrorDetail } from "../lib/api";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F9F8F6]">
      {/* Left branding */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1761495375895-4d99be6a0f19?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
          alt="Forest"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E20]/90 via-[#1A2E20]/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2.5" data-testid="auth-logo-link">
            <span className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
              <Leaf className="w-4.5 h-4.5 text-white" />
            </span>
            <span className="font-heading font-extrabold text-xl text-white tracking-tight">EcoTrace</span>
          </Link>
          <div>
            <h2 className="font-heading text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Every kilogram of CO₂ you don't emit is a win.
            </h2>
            <p className="text-white/70 text-sm max-w-sm">
              Track your daily impact, get AI-tailored advice, and build climate-positive habits that stick.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-up">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
            <span className="w-8 h-8 rounded-lg bg-[#1A2E20] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#8BA888]" />
            </span>
            <span className="font-heading font-extrabold text-lg text-[#1A2E20]">EcoTrace</span>
          </Link>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#1A2E20] mb-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[#5C6B61] mb-8">
            {mode === "login" ? "Sign in to keep your streak alive." : "Start measuring what matters."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label htmlFor="auth-name" className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold">Name</label>
                <input
                  id="auth-name"
                  data-testid="auth-name-input"
                  value={form.name}
                  onChange={set("name")}
                  required
                  placeholder="Alex Green"
                  className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white border border-[#E5E2DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-shadow"
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold">Email</label>
              <input
                id="auth-email"
                data-testid="auth-email-input"
                type="email"
                value={form.email}
                onChange={set("email")}
                required
                placeholder="you@example.com"
                className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white border border-[#E5E2DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold">Password</label>
              <input
                id="auth-password"
                data-testid="auth-password-input"
                type="password"
                value={form.password}
                onChange={set("password")}
                required
                minLength={6}
                placeholder="••••••••"
                className="mt-1.5 w-full px-4 py-3 rounded-lg bg-white border border-[#E5E2DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-shadow"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#E06D53] bg-[#E06D53]/10 border border-[#E06D53]/30 rounded-lg px-4 py-3" data-testid="auth-error-message">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="auth-submit-button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-[#1A2E20] text-white font-semibold text-sm hover:bg-[#2D5A3F] transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-sm text-[#5C6B61] mt-6 text-center">
            {mode === "login" ? "New to EcoTrace?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              data-testid="auth-toggle-mode-button"
              className="text-[#E06D53] font-semibold hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <div className="mt-8 border-t border-[#E5E2DA] pt-5">
            <p className="text-xs text-[#5C6B61] text-center">
              Demo account: <span className="font-mono">demo@ecotrace.app</span> / <span className="font-mono">demo1234</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
