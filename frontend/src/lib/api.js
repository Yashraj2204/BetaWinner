/**
 * @fileoverview lib/api.js
 *
 * Public API surface for the EcoTrace static frontend.
 * Re-exports constants that were previously fetched from the backend so the
 * rest of the codebase can keep the same import paths.
 */
export {
  EMISSION_FACTORS,
  GLOBAL_WEEKLY_AVG_KG,
  CO2_PER_TREE_PER_YEAR_KG,
  CALC_INPUT,
} from "./constants";

/**
 * Converts a FastAPI / generic API error detail value into a human-readable string.
 * Handles all four shapes the backend may return: null, string, array, or object.
 *
 * @param {null | undefined | string | Array<{msg: string}> | {msg: string} | unknown} detail
 *   The raw error detail from an API response body.
 * @returns {string} A non-empty, user-facing error message. Never throws.
 * @example
 *   formatApiErrorDetail(null)          // "Something went wrong. Please try again."
 *   formatApiErrorDetail("Bad input")   // "Bad input"
 *   formatApiErrorDetail([{msg:"X"}])   // "X"
 */
export function formatApiErrorDetail(detail) {
  if (detail === null || detail === undefined) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
