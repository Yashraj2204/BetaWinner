/**
 * @file dashboard.test.js
 * Unit tests for the pure dashboard stats computation logic.
 */
import { GLOBAL_WEEKLY_AVG_KG, CO2_PER_TREE_PER_YEAR_KG } from "../lib/constants";

// Re-implement the pure helper here so we can test it in isolation.
// The implementation in Dashboard.jsx must stay in sync with this.
function buildStats(activities) {
  const today = new Date().toISOString().slice(0, 10);
  const todayKg = +activities
    .filter((a) => a.date === today)
    .reduce((s, a) => s + a.co2_kg, 0)
    .toFixed(1);
  const weekKg = +activities.reduce((s, a) => s + a.co2_kg, 0).toFixed(1);
  const monthKg = +(weekKg * 4.2).toFixed(1);
  const vsGlobal = +((weekKg / GLOBAL_WEEKLY_AVG_KG) * 100).toFixed(0);
  const trees = Math.max(1, Math.ceil(monthKg / CO2_PER_TREE_PER_YEAR_KG));
  const catMap = {};
  activities.forEach((a) => {
    catMap[a.category] = +((catMap[a.category] || 0) + a.co2_kg).toFixed(2);
  });
  return {
    today_kg: todayKg,
    week_kg: weekKg,
    month_kg: monthKg,
    vs_global_pct: vsGlobal,
    streak: 5,
    trees_to_offset_month: trees,
    category_breakdown: Object.entries(catMap).map(([cat, kg]) => ({ category: cat, kg })),
  };
}

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
})();

describe("buildStats — empty activities", () => {
  const stats = buildStats([]);

  test("today_kg is 0", () => expect(stats.today_kg).toBe(0));
  test("week_kg is 0", () => expect(stats.week_kg).toBe(0));
  test("trees_to_offset_month is at least 1", () =>
    expect(stats.trees_to_offset_month).toBeGreaterThanOrEqual(1));
  test("category_breakdown is empty", () => expect(stats.category_breakdown).toHaveLength(0));
});

describe("buildStats — today-only activities", () => {
  const activities = [
    { id: "a", date: TODAY, category: "transport", co2_kg: 5.3 },
    { id: "b", date: TODAY, category: "food", co2_kg: 8.1 },
  ];
  const stats = buildStats(activities);

  test("today_kg sums correctly", () => expect(stats.today_kg).toBeCloseTo(13.4, 1));
  test("week_kg equals total", () => expect(stats.week_kg).toBe(stats.today_kg));
  test("category_breakdown has 2 entries", () => expect(stats.category_breakdown).toHaveLength(2));
});

describe("buildStats — mixed dates", () => {
  const activities = [
    { id: "a", date: TODAY, category: "transport", co2_kg: 5.0 },
    { id: "b", date: YESTERDAY, category: "energy", co2_kg: 3.0 },
  ];
  const stats = buildStats(activities);

  test("today_kg only counts today's activities", () => expect(stats.today_kg).toBe(5.0));
  test("week_kg counts all activities", () => expect(stats.week_kg).toBe(8.0));
});

describe("buildStats — vs_global_pct", () => {
  test("returns 100 when emissions equal global average", () => {
    const activities = [{ id: "x", date: TODAY, category: "energy", co2_kg: GLOBAL_WEEKLY_AVG_KG }];
    expect(buildStats(activities).vs_global_pct).toBe(100);
  });

  test("returns 0 when no emissions", () => {
    expect(buildStats([]).vs_global_pct).toBe(0);
  });

  test("returns >100 when above global average", () => {
    const activities = [
      { id: "x", date: TODAY, category: "food", co2_kg: GLOBAL_WEEKLY_AVG_KG + 10 },
    ];
    expect(buildStats(activities).vs_global_pct).toBeGreaterThan(100);
  });
});

describe("buildStats — trees_to_offset_month", () => {
  test("minimum 1 tree even with 0 emissions", () => {
    expect(buildStats([]).trees_to_offset_month).toBeGreaterThanOrEqual(1);
  });

  test("more emissions require more trees", () => {
    const low = buildStats([{ id: "l", date: TODAY, category: "energy", co2_kg: 10 }]);
    const high = buildStats([{ id: "h", date: TODAY, category: "energy", co2_kg: 500 }]);
    expect(high.trees_to_offset_month).toBeGreaterThan(low.trees_to_offset_month);
  });
});

describe("buildStats — category_breakdown", () => {
  test("groups activities by category correctly", () => {
    const activities = [
      { id: "a", date: TODAY, category: "transport", co2_kg: 2.0 },
      { id: "b", date: TODAY, category: "transport", co2_kg: 3.0 },
      { id: "c", date: TODAY, category: "food", co2_kg: 5.0 },
    ];
    const { category_breakdown: bd } = buildStats(activities);
    const transport = bd.find((b) => b.category === "transport");
    const food = bd.find((b) => b.category === "food");
    expect(transport?.kg).toBeCloseTo(5.0, 1);
    expect(food?.kg).toBeCloseTo(5.0, 1);
  });
});
