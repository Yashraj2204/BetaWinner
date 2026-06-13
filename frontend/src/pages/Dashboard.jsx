import { useState, useCallback, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Flame, CalendarDays, Activity, Globe2, Trash2, PlusCircle, TreePine,
} from "lucide-react";
import { toast } from "sonner";
import PropTypes from "prop-types";
import {
  CHART_COLORS, CAT_LABELS,
  GLOBAL_WEEKLY_AVG_KG, CO2_PER_TREE_PER_YEAR_KG,
} from "../lib/constants";
import { InsightsPanel } from "../components/InsightsPanel";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Generates a plausible 14-day emission trend for the demo. */
function makeTrend() {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    return {
      label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      kg:    +(Math.random() * 8 + 2).toFixed(1),
    };
  });
}

const TREND_DATA = makeTrend();

const INITIAL_ACTIVITIES = [
  { id: "1", label: "Car (Petrol) — 25 km",  date: new Date().toISOString().slice(0, 10), value: 25,  unit: "km",   co2_kg: 5.25, category: "transport" },
  { id: "2", label: "Electricity — 4 kWh",   date: new Date().toISOString().slice(0, 10), value: 4,   unit: "kWh",  co2_kg: 0.93, category: "energy"    },
  { id: "3", label: "Beef — 0.3 kg",         date: new Date().toISOString().slice(0, 10), value: 0.3, unit: "kg",   co2_kg: 8.10, category: "food"      },
  { id: "4", label: "Bus — 10 km",           date: new Date().toISOString().slice(0, 10), value: 10,  unit: "km",   co2_kg: 0.89, category: "transport" },
  { id: "5", label: "Vegetarian Meal",        date: new Date().toISOString().slice(0, 10), value: 1,   unit: "meal", co2_kg: 1.50, category: "food"      },
];

/**
 * Derives dashboard stats from an activity list.
 * @param {typeof INITIAL_ACTIVITIES} activities
 */
function buildStats(activities) {
  const today     = new Date().toISOString().slice(0, 10);
  const todayKg   = +activities.filter(a => a.date === today).reduce((s, a) => s + a.co2_kg, 0).toFixed(1);
  const weekKg    = +activities.reduce((s, a) => s + a.co2_kg, 0).toFixed(1);
  const monthKg   = +(weekKg * 4.2).toFixed(1);
  const vsGlobal  = +((weekKg / GLOBAL_WEEKLY_AVG_KG) * 100).toFixed(0);
  const trees     = Math.max(1, Math.ceil(monthKg / CO2_PER_TREE_PER_YEAR_KG));

  const catMap = {};
  activities.forEach(a => {
    catMap[a.category] = +(((catMap[a.category] || 0) + a.co2_kg).toFixed(2));
  });

  return {
    today_kg:              todayKg,
    week_kg:               weekKg,
    month_kg:              monthKg,
    vs_global_pct:         vsGlobal,
    streak:                5,
    trees_to_offset_month: trees,
    category_breakdown:    Object.entries(catMap).map(([cat, kg]) => ({ category: cat, kg })),
  };
}

// ─── sub-components ─────────────────────────────────────────────────────────

/**
 * A single KPI tile on the dashboard.
 * @param {{ label:string, value:string, sub?:string, icon:React.ElementType, accent?:boolean, testId:string }} props
 */
const StatTile = memo(function StatTile({ label, value, sub, icon: Icon, accent, testId }) {
  return (
    <article
      className="bg-white border border-[#E5E2DA] rounded-lg p-5 transition-all duration-200 hover:shadow-sm hover:-translate-y-[1px]"
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs tracking-[0.15em] uppercase text-[#4A5A50] font-semibold">{label}</p>
        <Icon className={`w-4 h-4 ${accent ? "text-[#E06D53]" : "text-[#8BA888]"}`} aria-hidden="true" />
      </div>
      <p className="font-heading text-3xl font-extrabold text-[#1A2E20]">{value}</p>
      {sub && <p className="text-xs text-[#4A5A50] mt-1">{sub}</p>}
    </article>
  );
});

StatTile.propTypes = {
  label:   PropTypes.string.isRequired,
  value:   PropTypes.string.isRequired,
  sub:     PropTypes.string,
  icon:    PropTypes.elementType.isRequired,
  accent:  PropTypes.bool,
  testId:  PropTypes.string.isRequired,
};

// ─── main page ──────────────────────────────────────────────────────────────

/** Dashboard page — shows aggregated stats, charts and recent activities. */
export default function Dashboard() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  const data    = useMemo(() => buildStats(activities), [activities]);
  const pieData = useMemo(
    () => data.category_breakdown.map(c => ({ name: CAT_LABELS[c.category] || c.category, value: c.kg })),
    [data.category_breakdown],
  );

  const deleteActivity = useCallback((id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success("Activity removed");
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto" data-testid="dashboard-page">

      {/* Page header */}
      <header className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#4A5A50] mb-1.5">Dashboard</p>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E20]">
            Here's your impact.
          </h1>
        </div>
        <Link
          to="/log"
          data-testid="dashboard-log-activity-button"
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#E06D53] text-white text-sm font-semibold hover:bg-[#C95B42] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#E06D53] focus:ring-offset-2"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          Log activity
        </Link>
      </header>

      {/* Context banner — problem-statement alignment */}
      <section
        aria-label="Global context"
        className="mb-6 rounded-lg border border-[#8BA888]/40 bg-[#8BA888]/10 px-5 py-4 flex items-center gap-4"
      >
        <Globe2 className="w-5 h-5 text-[#2D5A3F] shrink-0" aria-hidden="true" />
        <p className="text-sm text-[#2D5A3F]">
          The global average is <strong>~{GLOBAL_WEEKLY_AVG_KG} kg CO₂ / person / week.</strong>{" "}
          Your logged week total is <strong>{data.week_kg} kg</strong>{" "}
          ({data.vs_global_pct}% of the global average).{" "}
          {data.vs_global_pct < 100
            ? "🎉 You're below the global average — keep it up!"
            : "🌱 There's room to improve — check the tips below."}
        </p>
      </section>

      {/* KPI tiles */}
      <section aria-label="Key metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Today"      value={`${data.today_kg} kg`}  sub="CO₂ emitted today"                         icon={Activity} testId="stat-today" />
        <StatTile label="This week"  value={`${data.week_kg} kg`}   sub={`${data.vs_global_pct}% of global avg`}    icon={Globe2}   testId="stat-week" />
        <StatTile label="Streak"     value={`${data.streak} days`}  sub="consecutive logging"                       icon={Flame}    accent testId="stat-streak" />
        <StatTile label="30-day est" value={`${data.month_kg} kg`}  sub={`≈ ${data.trees_to_offset_month} trees to offset`} icon={TreePine} testId="stat-month" />
      </section>

      {/* Charts */}
      <section aria-label="Emission charts" className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E2DA] rounded-lg p-6" data-testid="trend-chart">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-[#1A2E20]">14-day emission trend</h2>
            <span className="text-xs text-[#4A5A50]">kg CO₂ / day</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8BA888" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8BA888" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#4A5A50" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#4A5A50" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E2DA", fontSize: 13 }}
                formatter={(v) => [`${v} kg CO₂`, "Emissions"]}
              />
              <Area type="monotone" dataKey="kg" stroke="#2D5A3F" strokeWidth={2} fill="url(#trendFill)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E5E2DA] rounded-lg p-6" data-testid="category-breakdown-chart">
          <h2 className="font-heading font-bold text-[#1A2E20] mb-5">
            By category <span className="text-xs font-normal text-[#4A5A50]">(all logged)</span>
          </h2>
          {pieData.length ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3} animationDuration={800}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E2DA", fontSize: 13 }} formatter={(v) => [`${v} kg CO₂`]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-2 mt-3 list-none" aria-label="Category breakdown">
                {pieData.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#4A5A50]">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} aria-hidden="true" />
                      {p.name}
                    </span>
                    <span className="font-semibold text-[#1A2E20]">{p.value} kg</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-[#4A5A50] py-12 text-center">No data yet. Log your first activity!</p>
          )}
        </div>
      </section>

      {/* Insights + recent activities */}
      <section aria-label="Insights and recent activity" className="grid lg:grid-cols-2 gap-6">
        <InsightsPanel />

        <div className="bg-white border border-[#E5E2DA] rounded-lg p-6" data-testid="recent-activities">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-[#1A2E20]">Recent activity</h2>
            <CalendarDays className="w-4 h-4 text-[#8BA888]" aria-hidden="true" />
          </div>
          {activities.length ? (
            <ul className="space-y-1 list-none" aria-label="Recent activity list">
              {activities.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between py-2.5 border-b border-[#E5E2DA]/60 last:border-0 group"
                  data-testid={`activity-row-${a.id}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A2E20] truncate">{a.label}</p>
                    <p className="text-xs text-[#4A5A50]">{a.date} · {a.value} {a.unit}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#1A2E20]">{a.co2_kg.toFixed(1)} kg</span>
                    <button
                      onClick={() => deleteActivity(a.id)}
                      data-testid={`delete-activity-${a.id}`}
                      className="opacity-0 group-hover:opacity-100 text-[#4A5A50] hover:text-[#E06D53] transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#E06D53] rounded"
                      aria-label={`Delete activity: ${a.label}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#4A5A50] py-10 text-center" role="status">Nothing logged yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
