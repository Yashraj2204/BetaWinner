import { Component } from "react";
import PropTypes from "prop-types";

/**
 * Top-level React error boundary.
 * Catches any unhandled render / lifecycle errors and shows a friendly
 * fallback instead of a blank screen.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(_error, _info) {
    // In production: errors are silently contained by the boundary.
    // Wire to an error-tracking service (e.g. Sentry) here if needed.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6] px-6 text-center"
        >
          <span className="text-5xl mb-4" aria-hidden="true">🌿</span>
          <h1 className="font-heading text-2xl font-extrabold text-[#1A2E20] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[#4A5A50] mb-6 max-w-sm">
            EcoTrace encountered an unexpected error. Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-lg bg-[#1A2E20] text-white text-sm font-semibold hover:bg-[#2D5A3F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8BA888] focus:ring-offset-2"
          >
            Refresh page
          </button>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 text-xs text-[#E06D53] max-w-lg text-left overflow-auto">
              {this.state.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};
