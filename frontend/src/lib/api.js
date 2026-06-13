/**
 * @fileoverview lib/api.js
 *
 * Public API surface for the EcoTrace static frontend.
 * Re-exports constants that were previously fetched from the backend so the
 * rest of the codebase can keep the same import paths.
 */
export { EMISSION_FACTORS, GLOBAL_WEEKLY_AVG_KG, CO2_PER_TREE_PER_YEAR_KG, CALC_INPUT } from "./constants";

/**
 * Format a FastAPI / generic error detail value into a human-readable string.
 * @param {unknown} detail
 * @returns {string}
 */
export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
