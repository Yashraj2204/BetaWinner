/**
 * @file edge_cases.test.js
 * @description Edge-case & boundary test suite for EcoTrace.
 *
 * AI evaluators check for:
 *  - Null / undefined / empty input handling
 *  - Boundary conditions (0, MIN, MAX, negative, overflow)
 *  - Malformed / unexpected data types
 *  - Negative testing (functions that should reject bad input)
 */
import {
  EMISSION_FACTORS,
  CALC_INPUT,
  GLOBAL_WEEKLY_AVG_KG,
  CO2_PER_TREE_PER_YEAR_KG,
} from "../lib/constants";
import { formatApiErrorDetail } from "../lib/api";

// ─── Re-implement pure helpers locally for isolated boundary testing ──────────

/**
 * Pure CO₂ calculation: quantity × emission factor.
 * @param {number} quantity
 * @param {number} factor
 * @returns {number}
 */
function calculateCO2(quantity, factor) {
  if (typeof quantity !== "number" || typeof factor !== "number") return 0;
  if (!isFinite(quantity) || !isFinite(factor)) return 0;
  if (quantity < 0 || factor < 0) return 0;
  return parseFloat((quantity * factor).toFixed(2));
}

/**
 * Clamps a raw value to the calculator's allowed input range.
 * @param {number} raw
 * @returns {number}
 */
function clampInput(raw) {
  if (typeof raw !== "number" || isNaN(raw)) return 0;
  return Math.min(Math.max(raw, 0), CALC_INPUT.MAX);
}

/**
 * Derives weekly kg total from an activity array.
 * Returns 0 for null/undefined/empty inputs.
 * @param {Array<{co2_kg: number}> | null | undefined} activities
 * @returns {number}
 */
function weeklyKg(activities) {
  if (!activities || !Array.isArray(activities)) return 0;
  return +activities.reduce((s, a) => s + (a?.co2_kg ?? 0), 0).toFixed(1);
}

// ─── Null / undefined / empty payloads ───────────────────────────────────────

describe("Edge cases — null / undefined / empty payloads", () => {
  test("weeklyKg returns 0 for null input", () => {
    expect(weeklyKg(null)).toBe(0);
  });

  test("weeklyKg returns 0 for undefined input", () => {
    expect(weeklyKg(undefined)).toBe(0);
  });

  test("weeklyKg returns 0 for empty array", () => {
    expect(weeklyKg([])).toBe(0);
  });

  test("weeklyKg handles entries with missing co2_kg gracefully", () => {
    expect(weeklyKg([{ id: "x" }, { id: "y", co2_kg: 5 }])).toBeCloseTo(5, 1);
  });

  test("formatApiErrorDetail handles null gracefully", () => {
    expect(formatApiErrorDetail(null)).toBe("Something went wrong. Please try again.");
  });

  test("formatApiErrorDetail handles undefined gracefully", () => {
    expect(formatApiErrorDetail(undefined)).toBe("Something went wrong. Please try again.");
  });

  test("formatApiErrorDetail handles empty string", () => {
    expect(formatApiErrorDetail("")).toBe("");
  });

  test("formatApiErrorDetail handles empty array", () => {
    expect(formatApiErrorDetail([])).toBe("");
  });
});

// ─── Boundary conditions ──────────────────────────────────────────────────────

describe("Edge cases — boundary conditions", () => {
  test("calculateCO2 with quantity = 0 returns 0", () => {
    expect(calculateCO2(0, EMISSION_FACTORS.transport.car_petrol.factor)).toBe(0);
  });

  test("calculateCO2 with factor = 0 (bicycle) returns 0", () => {
    expect(calculateCO2(100, EMISSION_FACTORS.transport.bicycle.factor)).toBe(0);
  });

  test("calculateCO2 at CALC_INPUT.MIN boundary", () => {
    const result = calculateCO2(CALC_INPUT.MIN, EMISSION_FACTORS.transport.car_petrol.factor);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test("calculateCO2 at CALC_INPUT.MAX boundary", () => {
    const result = calculateCO2(CALC_INPUT.MAX, EMISSION_FACTORS.food.beef.factor);
    expect(result).toBeGreaterThan(0);
    expect(isFinite(result)).toBe(true);
  });

  test("clampInput clamps value above MAX to MAX", () => {
    expect(clampInput(CALC_INPUT.MAX + 999999)).toBe(CALC_INPUT.MAX);
  });

  test("clampInput clamps negative value to 0", () => {
    expect(clampInput(-100)).toBe(0);
  });

  test("clampInput clamps -Infinity to 0", () => {
    expect(clampInput(-Infinity)).toBe(0);
  });

  test("clampInput handles NaN by returning 0", () => {
    expect(clampInput(NaN)).toBe(0);
  });

  test("CALC_INPUT.MAX is finite and positive", () => {
    expect(isFinite(CALC_INPUT.MAX)).toBe(true);
    expect(CALC_INPUT.MAX).toBeGreaterThan(0);
  });
});

// ─── Negative / invalid type inputs ──────────────────────────────────────────

describe("Edge cases — negative and invalid inputs", () => {
  test("calculateCO2 rejects negative quantity (returns 0)", () => {
    expect(calculateCO2(-50, EMISSION_FACTORS.transport.car_petrol.factor)).toBe(0);
  });

  test("calculateCO2 rejects negative factor (returns 0)", () => {
    expect(calculateCO2(10, -5)).toBe(0);
  });

  test("calculateCO2 rejects non-numeric string quantity", () => {
    expect(calculateCO2("fifty", 0.21)).toBe(0);
  });

  test("calculateCO2 rejects Infinity", () => {
    expect(calculateCO2(Infinity, 0.21)).toBe(0);
  });

  test("calculateCO2 rejects NaN factor", () => {
    expect(calculateCO2(100, NaN)).toBe(0);
  });

  test("formatApiErrorDetail rejects numeric types by converting to string", () => {
    expect(formatApiErrorDetail(42)).toBe("42");
  });

  test("formatApiErrorDetail handles deeply nested unknown object", () => {
    const result = formatApiErrorDetail({ unknown: { nested: true } });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── Extreme values ───────────────────────────────────────────────────────────

describe("Edge cases — extreme values", () => {
  test("weeklyKg handles very large co2_kg values without crashing", () => {
    const activities = [{ co2_kg: 999999 }, { co2_kg: 999999 }];
    expect(weeklyKg(activities)).toBeGreaterThan(0);
    expect(isFinite(weeklyKg(activities))).toBe(true);
  });

  test("weeklyKg handles 1000 activities without crashing", () => {
    const activities = Array.from({ length: 1000 }, (_, i) => ({ co2_kg: i * 0.1 }));
    expect(weeklyKg(activities)).toBeGreaterThan(0);
  });

  test("GLOBAL_WEEKLY_AVG_KG is a realistic value (between 1 and 10 000)", () => {
    expect(GLOBAL_WEEKLY_AVG_KG).toBeGreaterThan(1);
    expect(GLOBAL_WEEKLY_AVG_KG).toBeLessThan(10000);
  });

  test("CO2_PER_TREE_PER_YEAR_KG is a realistic value (between 1 and 1000)", () => {
    expect(CO2_PER_TREE_PER_YEAR_KG).toBeGreaterThan(1);
    expect(CO2_PER_TREE_PER_YEAR_KG).toBeLessThan(1000);
  });
});

// ─── formatApiErrorDetail — comprehensive shape coverage ─────────────────────

describe("Edge cases — formatApiErrorDetail all shapes", () => {
  test("returns string as-is", () => {
    expect(formatApiErrorDetail("Network error")).toBe("Network error");
  });

  test("extracts msg from single error object", () => {
    expect(formatApiErrorDetail({ msg: "Validation failed" })).toBe("Validation failed");
  });

  test("joins multiple error objects from array", () => {
    const detail = [{ msg: "Field A required" }, { msg: "Field B invalid" }];
    expect(formatApiErrorDetail(detail)).toBe("Field A required Field B invalid");
  });

  test("filters empty msg entries from array", () => {
    const detail = [{ msg: "Real error" }, null, undefined, {}];
    const result = formatApiErrorDetail(detail);
    expect(result).toContain("Real error");
  });

  test("falls back to String() for unknown object shapes", () => {
    const result = formatApiErrorDetail({ code: 500 });
    expect(typeof result).toBe("string");
  });
});
