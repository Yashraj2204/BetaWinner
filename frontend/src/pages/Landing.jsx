import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, ArrowRight, Calculator, Sparkles, LineChart, Trophy, Flame, Globe2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

const FEATURES = [
  { icon: Calculator, title: "Smart Carbon Calculator", desc: "Log transport, energy, food & shopping with science-backed emission factors. See your impact instantly.", span: "md:col-span-2", dark: true },
  { icon: Sparkles, title: "AI-Powered Insights", desc: "EcoPilot analyzes your real habits and writes a personalized action plan with estimated savings.", span: "", dark: false },
  { icon: LineChart, title: "Visual Tracking", desc: "Daily trends, category breakdowns, and weekly comparisons against the global average.", span: "", dark: false },
  { icon: Trophy, title: "Achievements & Streaks", desc: "Build the habit. Earn badges, keep your streak alive, and watch your footprint shrink.", span: "md:col-span-2", dark: false, accent: true },
];

export default function Landing() {
  const { user } = useAuth();
  const ctaLink = user && user !== false ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A2E20]">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 border-b border-[#E5E2DA]/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#1A2E20] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#8BA888]" />
            </span>
            <span className="font-heading font-extrabold text-lg tracking-tight">EcoTrace</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" data-testid="nav-signin-link" className="text-sm font-medium text-[#5C6B61] hover:text-[#1A2E20] transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link
              to={ctaLink}
              data-testid="nav-get-started-button"
              className="px-4 py-2 rounded-lg bg-[#1A2E20] text-white text-sm font-medium hover:bg-[#2D5A3F] transition-colors duration-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div variants={fade} initial="hidden" animate="show" custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#8BA888]/40 bg-[#8BA888]/10 text-[#2D5A3F] text-xs font-semibold tracking-[0.15em] uppercase mb-6">
              <Globe2 className="w-3.5 h-3.5" /> Carbon Footprint Awareness
            </motion.div>
            <motion.h1 variants={fade} initial="hidden" animate="show" custom={1}
              className="font-heading text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-6">
              Know your impact.<br />
              <span className="text-[#E06D53]">Shrink</span> your footprint.
            </motion.h1>
            <motion.p variants={fade} initial="hidden" animate="show" custom={2}
              className="text-base md:text-lg text-[#5C6B61] leading-relaxed mb-8 max-w-md">
              Track everyday actions, understand where your emissions come from, and get
              AI-personalized steps to cut them — one small habit at a time.
            </motion.p>
            <motion.div variants={fade} initial="hidden" animate="show" custom={3} className="flex items-center gap-4">
              <Link
                to={ctaLink}
                data-testid="hero-cta-button"
                className="group flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#E06D53] text-white font-semibold hover:bg-[#C95B42] transition-colors duration-200"
              >
                Start tracking free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-[#5C6B61]">
                <Flame className="w-4 h-4 text-[#E06D53]" /> Build your streak today
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1761495375895-4d99be6a0f19?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
              alt="Forest canopy"
              className="rounded-2xl object-cover w-full h-[480px] border border-[#E5E2DA]"
            />
            <div className="absolute -bottom-6 -left-6 bg-white border border-[#E5E2DA] rounded-xl p-5 shadow-sm">
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C6B61] mb-1">Global avg / person</p>
              <p className="font-heading text-3xl font-extrabold">12.9 kg <span className="text-base font-medium text-[#5C6B61]">CO₂ / day</span></p>
              <p className="text-xs text-[#2D5A3F] font-medium mt-1">Where do you stand?</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[#E5E2DA] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center md:text-left">
          {[
            ["4", "emission categories tracked"],
            ["26+", "activity types with real factors"],
            ["9", "achievements to unlock"],
          ].map(([num, label], i) => (
            <div key={i}>
              <p className="font-heading text-3xl md:text-4xl font-extrabold text-[#1A2E20]">{num}</p>
              <p className="text-sm text-[#5C6B61] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bento features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs tracking-[0.2em] uppercase text-[#5C6B61] mb-3">How it works</p>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight mb-12 max-w-lg">
            Everything you need to act on climate, personally.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`${f.span} rounded-xl p-8 border transition-all duration-200 hover:-translate-y-[2px] hover:shadow-sm ${
                  f.dark
                    ? "bg-[#1A2E20] border-[#1A2E20] text-white"
                    : f.accent
                    ? "bg-[#E06D53]/10 border-[#E06D53]/30"
                    : "bg-white border-[#E5E2DA]"
                }`}
              >
                <span className={`w-11 h-11 rounded-lg flex items-center justify-center mb-5 ${
                  f.dark ? "bg-white/10" : f.accent ? "bg-[#E06D53] text-white" : "bg-[#8BA888]/20 text-[#2D5A3F]"
                }`}>
                  <f.icon className="w-5 h-5" />
                </span>
                <h3 className="font-heading text-xl font-bold mb-2">{f.title}</h3>
                <p className={`text-sm leading-relaxed ${f.dark ? "text-white/70" : "text-[#5C6B61]"}`}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto rounded-2xl bg-[#1A2E20] p-12 md:p-16 text-center relative overflow-hidden">
          <Leaf className="absolute -right-8 -bottom-8 w-48 h-48 text-[#8BA888]/10" />
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Your first log takes 30 seconds.
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto text-sm md:text-base">
            Join EcoTrace and turn climate anxiety into clear, measurable daily action.
          </p>
          <Link
            to={ctaLink}
            data-testid="footer-cta-button"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-[#E06D53] text-white font-semibold hover:bg-[#C95B42] transition-colors duration-200"
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E5E2DA] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[#5C6B61]">
          <span className="flex items-center gap-2"><Leaf className="w-4 h-4 text-[#2D5A3F]" /> EcoTrace</span>
          <span>Built for the Carbon Footprint Awareness Challenge</span>
        </div>
      </footer>
    </div>
  );
}
