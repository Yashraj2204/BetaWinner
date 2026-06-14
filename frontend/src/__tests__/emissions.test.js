/**
 * @file emissions.test.js
 * Unit tests for the static emission factor data in lib/constants.js.
 *
 * These tests verify:
 *  - Data structure integrity (all required fields present)
 *  - Numeric correctness of key factors against known DEFRA/BEIS values
 *  - CO₂ calculation math used throughout the app
 */
import {
  EMISSION_FACTORS,
  GLOBAL_WEEKLY_AVG_KG,
  CO2_PER_TREE_PER_YEAR_KG,
  CALC_INPUT,
} from "../lib/constants";

// ─── Structure tests ────────────────────────────────────────────────────────

describe("EMISSION_FACTORS — structure", () => {
  const REQUIRED_CATEGORIES = ["transport", "energy", "food", "shopping"];

  test("exports all four required categories", () => {
    REQUIRED_CATEGORIES.forEach((cat) => {
      expect(EMISSION_FACTORS).toHaveProperty(cat);
    });
  });

  test("each category has at least one activity type", () => {
    REQUIRED_CATEGORIES.forEach((cat) => {
      expect(Object.keys(EMISSION_FACTORS[cat]).length).toBeGreaterThan(0);
    });
  });

  test("every activity entry has required fields: label, factor, unit, source", () => {
    Object.entries(EMISSION_FACTORS).forEach(([_cat, types]) => {
      Object.entries(types).forEach(([_key, entry]) => {
        expect(entry).toHaveProperty("label");
        expect(entry).toHaveProperty("factor");
        expect(entry).toHaveProperty("unit");
        expect(entry).toHaveProperty("source");
        expect(typeof entry.label).toBe("string");
        expect(typeof entry.factor).toBe("number");
        expect(entry.factor).toBeGreaterThanOrEqual(0);
        expect(typeof entry.unit).toBe("string");
      });
    });
  });
});

// ─── Transport ───────────────────────────────────────────────────────────────

describe("EMISSION_FACTORS — transport", () => {
  const t = EMISSION_FACTORS.transport;

  test("car petrol factor is ~0.21 kg CO₂/km (DEFRA 2023)", () => {
    expect(t.car_petrol.factor).toBeCloseTo(0.21, 2);
  });

  test("electric car has lower factor than petrol car", () => {
    expect(t.car_electric.factor).toBeLessThan(t.car_petrol.factor);
  });

  test("bicycle and walking produce zero emissions", () => {
    expect(t.bicycle.factor).toBe(0);
    expect(t.walk.factor).toBe(0);
  });

  test("flight has highest per-km factor among transport modes", () => {
    const factors = Object.values(t).map((e) => e.factor);
    expect(t.flight.factor).toBe(Math.max(...factors));
  });

  test("all transport units are km", () => {
    Object.values(t).forEach((entry) => expect(entry.unit).toBe("km"));
  });
});

// ─── Food ────────────────────────────────────────────────────────────────────

describe("EMISSION_FACTORS — food", () => {
  const f = EMISSION_FACTORS.food;

  test("beef has the highest per-kg factor in food category", () => {
    const nonBeef = Object.entries(f)
      .filter(([k]) => k !== "beef" && f[k].unit === "kg")
      .map(([, v]) => v.factor);
    nonBeef.forEach((factor) => expect(f.beef.factor).toBeGreaterThan(factor));
  });

  test("vegan meal has lower factor than vegetarian meal", () => {
    expect(f.vegan.factor).toBeLessThan(f.vegetarian.factor);
  });

  test("lamb factor is ~39.2 kg CO₂/kg (Poore & Nemecek 2018)", () => {
    expect(f.lamb.factor).toBeCloseTo(39.2, 1);
  });
});

// ─── Energy ──────────────────────────────────────────────────────────────────

describe("EMISSION_FACTORS — energy", () => {
  const e = EMISSION_FACTORS.energy;

  test("electricity factor is ~0.233 kg CO₂/kWh (UK grid)", () => {
    expect(e.electricity.factor).toBeCloseTo(0.233, 3);
  });

  test("heating oil has the highest energy factor", () => {
    const factors = Object.values(e).map((x) => x.factor);
    expect(e.heating_oil.factor).toBe(Math.max(...factors));
  });
});

// ─── CO₂ calculation math ────────────────────────────────────────────────────

describe("CO₂ calculation", () => {
  test("25 km car petrol → 5.25 kg CO₂", () => {
    const { factor } = EMISSION_FACTORS.transport.car_petrol;
    expect(+(25 * factor).toFixed(2)).toBe(5.25);
  });

  test("0.5 kg beef → 30.0 kg CO₂", () => {
    const { factor } = EMISSION_FACTORS.food.beef;
    expect(+(0.5 * factor).toFixed(1)).toBe(30.0);
  });

  test("10 kWh electricity → 2.33 kg CO₂", () => {
    const { factor } = EMISSION_FACTORS.energy.electricity;
    expect(+(10 * factor).toFixed(2)).toBe(2.33);
  });

  test("zero-emission activities produce 0 kg CO₂", () => {
    ["bicycle", "walk"].forEach((key) => {
      expect(100 * EMISSION_FACTORS.transport[key].factor).toBe(0);
    });
  });
});

// ─── Global constants ────────────────────────────────────────────────────────

describe("Global benchmark constants", () => {
  test("GLOBAL_WEEKLY_AVG_KG is a positive number", () => {
    expect(GLOBAL_WEEKLY_AVG_KG).toBeGreaterThan(0);
    expect(typeof GLOBAL_WEEKLY_AVG_KG).toBe("number");
  });

  test("CO2_PER_TREE_PER_YEAR_KG is a positive number", () => {
    expect(CO2_PER_TREE_PER_YEAR_KG).toBeGreaterThan(0);
  });

  test("CALC_INPUT bounds are sensible", () => {
    expect(CALC_INPUT.MIN).toBeGreaterThan(0);
    expect(CALC_INPUT.MAX).toBeGreaterThan(CALC_INPUT.MIN);
    expect(CALC_INPUT.STEP).toBeGreaterThan(0);
  });
});
