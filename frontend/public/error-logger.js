/**
 * Suppress harmless PerformanceServerTiming DataCloneErrors
 * caused by browser extensions or devtools.
 */
window.addEventListener("error", function(e) {
  if (
    e.error instanceof DOMException &&
    e.error.name === "DataCloneError" &&
    e.message &&
    e.message.includes("PerformanceServerTiming")
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}, true);
