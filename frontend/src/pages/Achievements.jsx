import { useEffect, useState } from "react";
import {
  Footprints, Sprout, BarChart3, Flame, Calendar, Trophy, Compass, Feather, Lightbulb, Lock,
} from "lucide-react";
import { api } from "../lib/api";

const ICONS = {
  footprints: Footprints, sprout: Sprout, "bar-chart": BarChart3, flame: Flame,
  calendar: Calendar, trophy: Trophy, compass: Compass, feather: Feather, lightbulb: Lightbulb,
};

export default function Achievements() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/achievements").then(({ data }) => setData(data)).catch(() => {});
  }, []);

  if (!data)
    return (
      <div className="p-8 flex justify-center pt-32">
        <div className="w-8 h-8 rounded-full border-2 border-[#1A2E20] border-t-transparent animate-spin" />
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto" data-testid="achievements-page">
      <p className="text-xs tracking-[0.2em] uppercase text-[#5C6B61] mb-1.5">Achievements</p>
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E20] mb-8">
        Your eco journey
      </h1>

      {/* Streak hero */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="rounded-xl bg-[#1A2E20] p-8 relative overflow-hidden" data-testid="streak-card">
          <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-[#E06D53]/20" />
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-2">Current streak</p>
          <p className="font-heading text-6xl font-extrabold text-white">
            {data.streak}
            <span className="text-xl font-medium text-white/60 ml-2">{data.streak === 1 ? "day" : "days"}</span>
          </p>
          <p className="text-sm text-white/60 mt-3">Log at least one activity every day to keep it burning.</p>
        </div>
        <div className="rounded-xl bg-white border border-[#E5E2DA] p-8 relative overflow-hidden" data-testid="badges-summary-card">
          <img
            src="https://images.unsplash.com/photo-1580133318324-f2f76d987dd8?crop=entropy&cs=srgb&fm=jpg&q=60&w=600"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20"
          />
          <p className="text-xs tracking-[0.2em] uppercase text-[#5C6B61] mb-2">Badges earned</p>
          <p className="font-heading text-6xl font-extrabold text-[#1A2E20]">
            {data.earned_count}
            <span className="text-xl font-medium text-[#5C6B61] ml-2">/ {data.total}</span>
          </p>
          <div className="mt-4 h-2 rounded-full bg-[#F9F8F6] border border-[#E5E2DA] overflow-hidden">
            <div
              className="h-full bg-[#E06D53] rounded-full transition-all duration-700"
              style={{ width: `${(data.earned_count / data.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.badges.map((b) => {
          const Icon = ICONS[b.icon] || Trophy;
          return (
            <div
              key={b.id}
              data-testid={`badge-${b.id}`}
              className={`rounded-xl p-6 border transition-all duration-200 ${
                b.earned
                  ? "bg-white border-[#E06D53]/40 hover:-translate-y-[2px] hover:shadow-sm"
                  : "bg-[#F9F8F6] border-[#E5E2DA] opacity-70"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  b.earned
                    ? "bg-[#E06D53] text-white shadow-[0_4px_14px_rgba(224,109,83,0.4)]"
                    : "bg-[#E5E2DA] text-[#5C6B61]"
                }`}
              >
                {b.earned ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>
              <p className="font-heading font-bold text-[#1A2E20]">{b.name}</p>
              <p className="text-xs text-[#5C6B61] mt-1 leading-relaxed">{b.desc}</p>
              {b.earned && (
                <span className="inline-block mt-3 text-[10px] tracking-[0.15em] uppercase font-bold text-[#E06D53]">
                  Unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
