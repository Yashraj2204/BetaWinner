import { useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * Static AI insight text shown in the InsightsPanel.
 * Mirrors the format produced by the real EcoPilot LLM endpoint.
 */
const STATIC_INSIGHT = `### Your Carbon Snapshot

Based on your logged activities, **transport** is your biggest emission source (~36% of total), followed by **food** (~60%). This mirrors a typical urban footprint.

### Quick Wins This Week

- **Switch to public transport** twice this week — could save ~3.5 kg CO₂ per day vs. petrol car
- **Try one plant-based meal** per day — saves ~5.5 kg CO₂ per week on average
- **Turn off unused appliances** at the wall overnight — saves ~0.5 kg CO₂ daily

### Your Position vs. the Global Average

Your weekly footprint is trending **18% below** the global average of 90 kg CO₂/week. Small, consistent habits compound into meaningful change over time.`;

/**
 * Renders a line of markdown-formatted insight text as React elements.
 * Supports ### headings, - bullet points and **bold** text.
 * @param {string} text
 * @returns {Array<React.ReactNode>}
 */
function renderInsight(text) {
  if (!text) return null;
  return text.split("\n").map((line) => {
    const t = line.trim();
    if (!t) return null;

    /** Replace **bold** markers with <strong> elements */
    const bolded = t
      .replace(/^###\s*/, "")
      .replace(/^- /, "")
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part) =>
        part.startsWith("**") ? (
          <strong key={part} className="text-[#1A2E20] font-semibold">{part.slice(2, -2)}</strong>
        ) : part,
      );

    if (t.startsWith("###"))
      return (
        <h3 key={t} className="font-heading font-bold text-[#1A2E20] text-sm uppercase tracking-[0.15em] mt-4 first:mt-0 mb-2">
          {bolded}
        </h3>
      );
    if (t.startsWith("- "))
      return (
        <div key={t} className="flex gap-2.5 mb-2 text-sm text-[#3d4a42] leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E06D53] shrink-0" aria-hidden="true" />
          <span>{bolded}</span>
        </div>
      );
    return (
      <p key={t} className="text-sm text-[#3d4a42] leading-relaxed mb-2">{bolded}</p>
    );
  });
}

/**
 * AI Insights panel.
 * Displays pre-written personalised reduction tips.
 * The "Generate" button reveals the insight with a subtle transition.
 */
export const InsightsPanel = () => {
  const [shown, setShown] = useState(false);

  return (
    <section
      className="bg-white border border-[#E5E2DA] rounded-lg overflow-hidden relative"
      data-testid="ai-insights-panel"
      aria-label="EcoPilot AI insights"
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1524207874394-5ec7c8c8e1a6?crop=entropy&cs=srgb&fm=jpg&q=60&w=800)" }}
        aria-hidden="true"
        role="presentation"
      />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#8BA888]/20 flex items-center justify-center" aria-hidden="true">
              <Sparkles className="w-4 h-4 text-[#2D5A3F]" />
            </span>
            <div>
              <h2 className="font-heading font-bold text-[#1A2E20]">EcoPilot Insights</h2>
              <p className="text-xs text-[#4A5A50]">Personalised reduction tips</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShown(true)}
            data-testid="generate-insights-button"
            aria-expanded={shown}
            aria-controls="insights-content"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2E20] text-white text-sm font-medium hover:bg-[#2D5A3F] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8BA888] focus:ring-offset-2"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {shown ? "Refresh" : "Generate"}
          </button>
        </div>

        {/* Content area — aria-live so screen readers announce new content */}
        <div
          id="insights-content"
          aria-live="polite"
          aria-atomic="false"
          data-testid={shown ? "insights-content" : "insights-empty-state"}
        >
          {shown ? (
            renderInsight(STATIC_INSIGHT)
          ) : (
            <p className="text-sm text-[#4A5A50] py-8 text-center">
              Click <strong>Generate</strong> to get a personalised assessment and tailored reduction tips.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
