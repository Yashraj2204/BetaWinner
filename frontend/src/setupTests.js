/**
 * @file setupTests.js
 * Global Jest test setup for EcoTrace.
 *
 * - Imports jest-dom custom matchers (toBeInTheDocument, toHaveClass, etc.)
 * - Stubs browser APIs unavailable in jsdom
 */
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ── Browser API stubs ──────────────────────────────────────────────────────

/**
 * IntersectionObserver — used by Framer Motion & lazy-loading images.
 * Not available in jsdom.
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe()    {}
  unobserve()  {}
  disconnect() {}
};

/**
 * ResizeObserver — used by Recharts for responsive containers.
 * Not available in jsdom.
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe()    {}
  unobserve()  {}
  disconnect() {}
};

/**
 * matchMedia — used by Framer Motion for prefers-reduced-motion.
 * Not available in jsdom.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener:    () => {},
    removeListener: () => {},
    addEventListener:    () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// ── Silence expected console output in tests ──────────────────────────────

const SILENT_PATTERNS = [
  /Warning: ReactDOM.render/,
  /Warning: An update to/,
  /Not implemented: navigation/,
];

const originalError = console.error.bind(console);
console.error = (...args) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (SILENT_PATTERNS.some((p) => p.test(msg))) { return; }
  originalError(...args);
};
