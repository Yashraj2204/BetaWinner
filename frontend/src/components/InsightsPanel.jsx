import { useState } from "react";
import { Sparkles } from "lucide-react";

const STATIC_INSIGHT = `### Your Carbon Snapshot

Based on your logged activities, **transport** is your biggest emission source, followed by **food**.

### Quick Wins This Week

- **Switch to public transport** for your daily commute — could save ~3.5 kg CO₂ per day
- **Try one plant-based meal** per day — saves ~5 kg CO₂ per week on average
- **Turn off unused electronics** at night — saves ~0.5 kg CO₂ daily

### Your Impact vs Global Average

Your weekly footprint is trending **18% below** the global average of 90 kg CO₂/week. Keep it up — small habits compound over time.`;

function renderInsight(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return null;
    const bolded = t
      .replace(/^###\s*/, "")
      .replace(/^- /, "")
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part, j) =>
        part.startsWith("**") ? (
          <strong key={j} className="text-[#1A2E20] font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      );
    if (t.startsWith("###"))
      return (
        <h4 key={i} className="font-heading font-bold text-[#1A2E20] text-sm uppercase tracking-[0.15em] mt-4 first:mt-0 mb-2">
          {bolded}
        </h4>
      );
    if (t.startsWith("- "))
      return (
        <div key={i} className="flex gap-2.5 mb-2 text-sm text-[#3d4a42] leading-relaxed">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E06D53] shrink-0" />
          <span>{bolded}</span>
        </div>
      );
    return (
      <p key={i} className="text-sm text-[#3d4a42] leading-relaxed mb-2">{bolded}</p>
    );
  });
}

export const InsightsPanel = () => {
  const [shown, setShown] = useState(false);

  return (
    <div className="bg-white border border-[#E5E2DA] rounded-lg overflow-hidden relative" data-testid="ai-insights-panel">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1524207874394-5ec7c8c8e1a6?crop=entropy&cs=srgb&fm=jpg&q=60&w=800)" }}
      />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#8BA888]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#2D5A3F]" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-[#1A2E20]">EcoPilot Insights</h3>
              <p className="text-xs text-[#5C6B61]">Personalized reduction tips</p>
            </div>
          </div>
          <button
            onClick={() => setShown(true)}
            data-testid="generate-insights-button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2E20] text-white text-sm font-medium hover:bg-[#2D5A3F] transition-colors duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {shown ? "Refresh" : "Generate"}
          </button>
        </div>
        {shown ? (
          <div data-testid="insights-content">{renderInsight(STATIC_INSIGHT)}</div>
        ) : (
          <div className="py-8 text-center" data-testid="insights-empty-state">
            <p className="text-sm text-[#5C6B61]">
              Get a personalized assessment and 4 tailored reduction tips.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
