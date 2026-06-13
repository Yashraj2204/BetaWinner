import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api, BACKEND_URL } from "../lib/api";

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
  const [text, setText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    api.get("/insights/latest").then(({ data }) => setText(data.text)).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    setStreaming(true);
    setText("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/insights/generate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate insights");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setText(acc);
      }
      if (!acc.trim()) throw new Error("Insight generation failed. Please try again.");
    } catch (e) {
      toast.error(e.message);
      setText(null);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

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
              <p className="text-xs text-[#5C6B61]">AI-powered, based on your real data</p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            data-testid="generate-insights-button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2E20] text-white text-sm font-medium hover:bg-[#2D5A3F] transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {text && !streaming ? "Refresh" : "Generate"}
          </button>
        </div>
        {text ? (
          <div data-testid="insights-content" aria-live="polite">{renderInsight(text)}{streaming && <span className="inline-block w-2 h-4 bg-[#8BA888] animate-pulse ml-0.5" />}</div>
        ) : (
          <div className="py-8 text-center" data-testid="insights-empty-state">
            <p className="text-sm text-[#5C6B61]">
              {loading ? "Analyzing your footprint..." : "Get a personalized assessment and 4 tailored reduction tips."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
