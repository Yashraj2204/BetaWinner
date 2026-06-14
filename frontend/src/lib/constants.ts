/**
 * @fileoverview Application-wide constants for EcoTrace typed in TypeScript.
 *
 * Emission factors are sourced from:
 *   - UK DEFRA/BEIS Greenhouse Gas Conversion Factors (transport & energy)
 *   - Poore & Nemecek 2018 / Our World in Data (food)
 *   - Industry averages (shopping)
 *
 * Global benchmark: ~4.7 t CO₂e / person / year  →  ~90 kg / week
 */

export interface Activity {
  label: string;
  factor: number;
  unit: string;
  source: string;
}

export type ActivityCategory = Record<string, Activity>;

export interface ActivityType {
  id: string;
  label: string;
  category: "transport" | "energy" | "food" | "shopping";
  unit: string;
  kgCO2PerUnit: number;
  minValue: number;
  maxValue: number;
}

/**
 * kg CO₂e per unit for each activity type, grouped by category.
 */
export const EMISSION_FACTORS: Record<string, ActivityCategory> = {
  transport: {
    car_petrol: { label: "Car (Petrol)", factor: 0.21, unit: "km", source: "DEFRA 2023" },
    car_electric: { label: "Car (Electric)", factor: 0.053, unit: "km", source: "DEFRA 2023" },
    motorbike: { label: "Motorbike", factor: 0.114, unit: "km", source: "DEFRA 2023" },
    bus: { label: "Bus", factor: 0.089, unit: "km", source: "DEFRA 2023" },
    train: { label: "Train", factor: 0.041, unit: "km", source: "DEFRA 2023" },
    flight: { label: "Flight", factor: 0.255, unit: "km", source: "DEFRA 2023" },
    bicycle: { label: "Bicycle", factor: 0.0, unit: "km", source: "Zero emission" },
    walk: { label: "Walking", factor: 0.0, unit: "km", source: "Zero emission" },
  },
  energy: {
    electricity: { label: "Electricity", factor: 0.233, unit: "kWh", source: "DEFRA 2023" },
    natural_gas: { label: "Natural Gas", factor: 2.04, unit: "m³", source: "DEFRA 2023" },
    heating_oil: { label: "Heating Oil", factor: 2.68, unit: "litre", source: "DEFRA 2023" },
    lpg: { label: "LPG", factor: 1.51, unit: "litre", source: "DEFRA 2023" },
  },
  food: {
    beef: { label: "Beef", factor: 60.0, unit: "kg", source: "Poore & Nemecek 2018" },
    lamb: { label: "Lamb", factor: 39.2, unit: "kg", source: "Poore & Nemecek 2018" },
    pork: { label: "Pork", factor: 12.1, unit: "kg", source: "Poore & Nemecek 2018" },
    chicken: { label: "Chicken", factor: 6.9, unit: "kg", source: "Poore & Nemecek 2018" },
    fish: { label: "Fish", factor: 6.1, unit: "kg", source: "Poore & Nemecek 2018" },
    dairy: { label: "Dairy", factor: 3.2, unit: "kg", source: "Poore & Nemecek 2018" },
    vegetarian: {
      label: "Vegetarian Meal",
      factor: 1.5,
      unit: "meal",
      source: "Poore & Nemecek 2018",
    },
    vegan: { label: "Vegan Meal", factor: 0.7, unit: "meal", source: "Poore & Nemecek 2018" },
  },
  shopping: {
    clothing: { label: "Clothing", factor: 25.0, unit: "item", source: "WRAP 2022" },
    electronics: { label: "Electronics", factor: 70.0, unit: "item", source: "WRAP 2022" },
    furniture: { label: "Furniture", factor: 45.0, unit: "item", source: "WRAP 2022" },
    books: { label: "Books", factor: 1.0, unit: "item", source: "WRAP 2022" },
    plastic_goods: { label: "Plastic Goods", factor: 6.0, unit: "item", source: "WRAP 2022" },
    groceries: { label: "Groceries", factor: 0.8, unit: "kg", source: "WRAP 2022" },
  },
};

/** Weekly global average CO₂e in kg — World Bank / Our World in Data (~4.7 t/person/yr ÷ 52 weeks) */
export const GLOBAL_WEEKLY_AVG_KG: number = 90;
export const GLOBAL_AVG_KG_PER_WEEK: number = 90;

/** kg CO₂ absorbed by one mature tree per year (EPA estimate) */
export const CO2_PER_TREE_PER_YEAR_KG: number = 21;

/** Input validation bounds for the carbon calculator */
export const CALC_INPUT: { MIN: number; MAX: number; STEP: number } = {
  MIN: 0.01,
  MAX: 10_000,
  STEP: 0.01,
};

/** Colour palette — must maintain ≥ 4.5:1 contrast on white/near-white bg */
export const COLORS: Record<string, string> = {
  primary: "#1A2E20",
  secondary: "#2D5A3F",
  muted: "#4A5A50",
  accent: "#E06D53",
  green: "#8BA888",
  bg: "#F9F8F6",
  border: "#E5E2DA",
};

/** Chart colour sequence */
export const CHART_COLORS: string[] = ["#1A2E20", "#8BA888", "#E06D53", "#D99E48", "#C1CFC5"];

/** Human-readable category labels */
export const CAT_LABELS: Record<string, string> = {
  transport: "Transport",
  energy: "Energy",
  food: "Food",
  shopping: "Shopping",
};
