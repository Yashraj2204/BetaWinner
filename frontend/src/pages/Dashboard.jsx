import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Flame, CalendarDays, Activity, Globe2, Trash2, PlusCircle, TreePine } from "lucide-react";
import { toast } from "sonner";
import { EMISSION_FACTORS } from "../lib/api";
import { InsightsPanel } from "../components/InsightsPanel";

const CHART_COLORS = ["#1A2E20", "#8BA888", "#E06D53", "#D99E48", "#C1CFC5"];
const CAT_LABELS = { transport: "Transport", energy: "Energy", food: "Food", shopping: "Shopping" };

// Generate realistic 14-day trend
function makeTrend() {
  const labels = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push({ label: d.toLocaleDateString("en", { month: "short", day: "numeric" }), kg: +(Math.random() * 8 + 2).toFixed(1) });
  }
  return labels;
}

const INITIAL_TREND = makeTrend();

const INITIAL_ACTIVITIES = [
  { id: "1", label: "Car (Petrol) — 25 km",   date: new Date().toISOString().slice(0,10), value: 25,  unit: "km",   co2_kg: 5.25,  category: "transport" },
  { id: "2", label: "Electricity — 4 kWh",     date: new Date().toISOString().slice(0,10), value: 4,   unit: "kWh",  co2_kg: 0.93,  category: "energy" },
  { id: "3", label: "Beef — 0.3 kg",           date: new Date().toISOString().slice(0,10), value: 0.3, unit: "kg",   co2_kg: 8.1,   category: "food" },
  { id: "4", label: "Bus — 10 km",             date: new Date().toISOString().slice(0,10), value: 10,  unit: "km",   co2_kg: 0.89,  category: "transport" },
  { id: "5", label: "Vegetarian Meal",          date: new Date().toISOString().slice(0,10), value: 1,   unit: "meal", co2_kg: 1.5,   category: "food" },
];

function buildStats(activities) {
  const today = new Date().toISOString().slice(0, 10);
  const todayKg = +activities.filter(a => a.date === today).reduce((s, a) => s + a.co2_kg, 0).toFixed(1);
  const weekKg = +activities.reduce((s, a) => s + a.co2_kg, 0).toFixed(1);
  const monthKg = +(weekKg * 4.2).toFixed(1);
  const vsGlobal = +((weekKg / 90) * 100).toFixed(0);
  const trees = Math.ceil(monthKg / 21);
  const catMap = {};
  activities.forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + a.co2_kg; });
  const category_breakdown = Object.entries(catMap).map(([cat, kg]) => ({ category: cat, kg: +kg.toFixed(1) }));
  return { today_kg: todayKg, week_kg: weekKg, month_kg: monthKg, vs_global_pct: vsGlobal, streak: 5, trees_to_offset_month: trees, category_breakdown };
}

const StatTile = ({ label, value, sub, icon: Icon, accent, testId }) => (
  <div className="bg-white border border-[#E5E2DA] rounded-lg p-5 transition-all duration-200 hover:shadow-sm hover:-translate-y-[1px]" data-testid={testId}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold">{label}</p>
      <Icon className={`w-4 h-4 ${accent ? "text-[#E06D53]" : "text-[#8BA888]"}`} />
    </div>
    <p className="font-heading text-3xl font-extrabold text-[#1A2E20]">{value}</p>
    {sub && <p className="text-xs text-[#5C6B61] mt-1">{sub}</p>}
  </div>
);

export default function Dashboard() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const data = buildStats(activities);
  const pieData = data.category_breakdown.map((c) => ({ name: CAT_LABELS[c.category] || c.category, value: c.kg }));

  const deleteActivity = useCallback((id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success("Activity removed");
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto" data-testid="dashboard-page">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#5C6B61] mb-1.5">Dashboard</p>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E20]">
            Here's your impact.
          </h1>
        </div>
        <Link
          to="/log"
          data-testid="dashboard-log-activity-button"
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#E06D53] text-white text-sm font-semibold hover:bg-[#C95B42] transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" /> Log activity
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Today"      value={`${data.today_kg} kg`}  sub="CO₂ emitted"                         icon={Activity}    testId="stat-today" />
        <StatTile label="This week"  value={`${data.week_kg} kg`}   sub={`${data.vs_global_pct}% of global avg (90 kg)`} icon={Globe2} testId="stat-week" />
        <StatTile label="Streak"     value={`${data.streak} days`}  sub="consecutive logging"                 icon={Flame} accent testId="stat-streak" />
        <StatTile label="30-day est" value={`${data.month_kg} kg`}  sub={`≈ ${data.trees_to_offset_month} trees to offset`} icon={TreePine} testId="stat-month" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-[#E5E2DA] rounded-lg p-6" data-testid="trend-chart">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-[#1A2E20]">14-day emission trend</h3>
            <span className="text-xs text-[#5C6B61]">kg CO₂ / day</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={INITIAL_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8BA888" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8BA888" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5C6B61" }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#5C6B61" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #E5E2DA", fontSize: 13 }}
                formatter={(v) => [`${v} kg CO₂`, "Emissions"]}
              />
              <Area type="monotone" dataKey="kg" stroke="#2D5A3F" strokeWidth={2} fill="url(#trendFill)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E5E2DA] rounded-lg p-6" data-testid="category-breakdown-chart">
          <h3 className="font-heading font-bold text-[#1A2E20] mb-5">By category <span className="text-xs font-normal text-[#5C6B61]">(all logged)</span></h3>
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
              <div className="space-y-2 mt-3">
                {pieData.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#5C6B61]">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {p.name}
                    </span>
                    <span className="font-semibold text-[#1A2E20]">{p.value} kg</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#5C6B61] py-12 text-center">No data yet. Log your first activity!</p>
          )}
        </div>
      </div>

      {/* Insights + recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <InsightsPanel />
        <div className="bg-white border border-[#E5E2DA] rounded-lg p-6" data-testid="recent-activities">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-[#1A2E20]">Recent activity</h3>
            <CalendarDays className="w-4 h-4 text-[#8BA888]" />
          </div>
          {activities.length ? (
            <div className="space-y-1">
              {activities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-[#E5E2DA]/60 last:border-0 group" data-testid={`activity-row-${a.id}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A2E20] truncate">{a.label}</p>
                    <p className="text-xs text-[#5C6B61]">{a.date} · {a.value} {a.unit}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-[#1A2E20]">{a.co2_kg.toFixed(1)} kg</span>
                    <button
                      onClick={() => deleteActivity(a.id)}
                      data-testid={`delete-activity-${a.id}`}
                      className="opacity-0 group-hover:opacity-100 text-[#5C6B61] hover:text-[#E06D53] transition-all"
                      aria-label="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#5C6B61] py-10 text-center">Nothing logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
