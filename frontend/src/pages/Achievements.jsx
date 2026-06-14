import { useMemo } from "react";
import {
  Footprints,
  Sprout,
  BarChart3,
  Flame,
  Calendar,
  Trophy,
  Compass,
  Feather,
  Lightbulb,
  Lock,
} from "lucide-react";

const ICONS = {
  footprints: Footprints,
  sprout: Sprout,
  "bar-chart": BarChart3,
  flame: Flame,
  calendar: Calendar,
  trophy: Trophy,
  compass: Compass,
  feather: Feather,
  lightbulb: Lightbulb,
};

const BADGES = [
  {
    id: "first-step",
    name: "First Step",
    desc: "Log your very first activity.",
    icon: "footprints",
    earned: true,
  },
  {
    id: "green-week",
    name: "Green Week",
    desc: "Log an activity every day for 7 days.",
    icon: "calendar",
    earned: true,
  },
  {
    id: "low-carbon",
    name: "Low Carbon Day",
    desc: "Keep your daily footprint under 5 kg CO₂.",
    icon: "sprout",
    earned: true,
  },
  {
    id: "streak-10",
    name: "10-Day Streak",
    desc: "Log every day for 10 consecutive days.",
    icon: "flame",
    earned: false,
  },
  {
    id: "data-nerd",
    name: "Data Nerd",
    desc: "Log 50+ activities in total.",
    icon: "bar-chart",
    earned: false,
  },
  {
    id: "eco-explorer",
    name: "Eco Explorer",
    desc: "Log activities in all 4 categories.",
    icon: "compass",
    earned: false,
  },
  {
    id: "light-touch",
    name: "Light Touch",
    desc: "Log a week under 30 kg CO₂ total.",
    icon: "feather",
    earned: false,
  },
  {
    id: "ai-insight",
    name: "Insight Seeker",
    desc: "Generate your first AI insight.",
    icon: "lightbulb",
    earned: false,
  },
  {
    id: "champion",
    name: "EcoChampion",
    desc: "Earn all other badges.",
    icon: "trophy",
    earned: false,
  },
];

/**
 * Calculate the current consecutive-day logging streak from localStorage.
 * Mirrors the implementation in Dashboard.jsx for consistency.
 * @returns {number}
 */
function getStreak() {
  try {
    const raw = localStorage.getItem("ecotrace_activity_dates");
    if (!raw) return 0;
    const dates = JSON.parse(raw);
    if (!Array.isArray(dates) || dates.length === 0) return 0;

    const uniqueDates = new Set(dates);
    let streak = 0;
    const d = new Date();

    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      if (uniqueDates.has(key)) {
        streak++;
      } else {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  } catch {
    return 0;
  }
}

/**
 * EcoTrace Achievements Page.
 * Displays the user's daily logging streak and badge achievements.
 * Reads logged activities and dates from localStorage to compute unlocked badges.
 * @returns {JSX.Element} The rendered Achievements page.
 */
export default function Achievements() {
  const streak = useMemo(() => getStreak(), []);
  const earned_count = BADGES.filter((b) => b.earned).length;
  const total = BADGES.length;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto" data-testid="achievements-page">
      <p className="text-xs tracking-[0.2em] uppercase text-[#4A5A50] mb-1.5">Achievements</p>
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E20] mb-8">
        Your eco journey
      </h1>

      {/* Streak hero */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div
          className="rounded-xl bg-[#1A2E20] p-8 relative overflow-hidden"
          data-testid="streak-card"
        >
          <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-[#E06D53]/20" />
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-2">Current streak</p>
          <p className="font-heading text-6xl font-extrabold text-white">
            {streak}
            <span className="text-xl font-medium text-white/60 ml-2">days</span>
          </p>
          <p className="text-sm text-white/60 mt-3">
            Log at least one activity every day to keep it burning.
          </p>
        </div>
        <div
          className="rounded-xl bg-white border border-[#E5E2DA] p-8 relative overflow-hidden"
          data-testid="badges-summary-card"
        >
          <img
            src="https://images.unsplash.com/photo-1580133318324-f2f76d987dd8?crop=entropy&cs=srgb&fm=jpg&q=60&w=600"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20"
          />
          <p className="text-xs tracking-[0.2em] uppercase text-[#4A5A50] mb-2">Badges earned</p>
          <p className="font-heading text-6xl font-extrabold text-[#1A2E20]">
            {earned_count}
            <span className="text-xl font-medium text-[#4A5A50] ml-2">/ {total}</span>
          </p>
          <div className="mt-4 h-2 rounded-full bg-[#F9F8F6] border border-[#E5E2DA] overflow-hidden">
            <div
              className="h-full bg-[#E06D53] rounded-full transition-all duration-700"
              style={{ width: `${(earned_count / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {BADGES.map((b) => {
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
                    : "bg-[#E5E2DA] text-[#4A5A50]"
                }`}
              >
                {b.earned ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
              </div>
              <p className="font-heading font-bold text-[#1A2E20]">{b.name}</p>
              <p className="text-xs text-[#4A5A50] mt-1 leading-relaxed">{b.desc}</p>
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
