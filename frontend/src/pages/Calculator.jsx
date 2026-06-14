import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car, Bus, TrainFront, Plane, Bike, Footprints, Zap, Flame, Droplet, Cylinder,
  Beef, Drumstick, Fish, Ham, Milk, Salad, Leaf, Shirt, Smartphone, Armchair,
  BookOpen, Package, ShoppingBasket, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { EMISSION_FACTORS, CALC_INPUT } from "../lib/api";

/** Maps category IDs to display labels + icons */
const CATEGORIES = [
  { id: "transport", label: "Transport", icon: Car },
  { id: "energy",    label: "Energy",    icon: Zap },
  { id: "food",      label: "Food",      icon: Salad },
  { id: "shopping",  label: "Shopping",  icon: ShoppingBasket },
];

/** Maps activity type keys to representative icon components */
const TYPE_ICONS = {
  car_petrol: Car, car_electric: Car, motorbike: Bike, bus: Bus, train: TrainFront,
  flight: Plane, bicycle: Bike, walk: Footprints,
  electricity: Zap, natural_gas: Flame, heating_oil: Droplet, lpg: Cylinder,
  beef: Beef, lamb: Ham, pork: Ham, chicken: Drumstick, fish: Fish, dairy: Milk,
  vegetarian: Salad, vegan: Leaf,
  clothing: Shirt, electronics: Smartphone, furniture: Armchair, books: BookOpen,
  plastic_goods: Package, groceries: ShoppingBasket,
};

/**
 * Carbon Calculator page.
 * Lets users select an activity, enter a quantity and see the instant CO₂
 * impact before logging it locally (no network requests).
 */
export default function Calculator() {
  const [category, setCategory] = useState("transport");
  const [type,     setType]     = useState(null);
  const [value,    setValue]    = useState("");
  const [date,     setDate]     = useState(new Date().toISOString().slice(0, 10));
  const [saving,   setSaving]   = useState(false);
  const navigate = useNavigate();

  /**
   * Switches the active category tab and resets type/value selections.
   * @param {string} id - Category ID ("transport" | "energy" | "food" | "shopping")
   * @returns {void}
   */
  const selectCategory = useCallback((id) => {
    setCategory(id);
    setType(null);
    setValue("");
  }, []);

  const info    = useMemo(() => type ? EMISSION_FACTORS[category][type] : null, [category, type]);
  const preview = useMemo(
    () => (info && Number(value) > 0) ? (Number(value) * info.factor).toFixed(2) : null,
    [info, value],
  );

  /**
   * Clamps a numeric string input within the allowed calculator bounds.
   * Rejects non-numeric, empty, or negative values gracefully.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   * @returns {void}
   */
  const handleValueChange = useCallback((e) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") { setValue(""); return; }
    const n = parseFloat(raw);
    if (!isNaN(n)) setValue(Math.min(Math.max(n, 0), CALC_INPUT.MAX).toString());
  }, []);

  /**
   * Validates inputs, computes CO₂ kg, persists to localStorage, and shows toast.
   * Uses a guarded try/catch so a localStorage quota error never breaks the UI.
   * @returns {void}
   */
  const submit = useCallback(() => {
    const n = Number(value);
    if (!type) {
      toast.error("Please choose an activity first");
      return;
    }
    if (!n || n < CALC_INPUT.MIN) {
      toast.error(`Please enter a value of at least ${CALC_INPUT.MIN}`);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      try {
        const STORAGE_KEY = "ecotrace_activities";
        const newEntry = {
          id: Date.now().toString(),
          label: `${info.label} — ${n} ${info.unit}`,
          date,
          value: n,
          unit: info.unit,
          co2_kg: parseFloat((n * info.factor).toFixed(2)),
          category,
        };
        const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        // Prune entries older than 90 days to keep storage under 1 MB
        const cutoff = Date.now() - 90 * 86400000;
        const pruned = prev.filter((e) => !e.timestamp || e.timestamp > cutoff);

        localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...pruned]));
        toast.success(`Logged ${info.label}: ${newEntry.co2_kg} kg CO\u2082`);
        setType(null);
        setValue("");
      } catch (storageError) {
        // Handles QuotaExceededError or JSON parse failures gracefully
        toast.error("Could not save activity — storage may be full.");
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [type, value, info, category, date]);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto" data-testid="calculator-page">
      <p className="text-xs tracking-[0.2em] uppercase text-[#4A5A50] mb-1.5">Carbon Calculator</p>
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E20] mb-2">
        Log an activity
      </h1>
      <p className="text-sm text-[#4A5A50] mb-8">
        Emission factors from <strong>UK DEFRA/BEIS 2023</strong> and <strong>Poore &amp; Nemecek 2018</strong>.
      </p>

      {/* Category selection — fieldset for a11y grouping */}
      <fieldset className="mb-8 border-0 p-0 m-0">
        <legend className="text-xs tracking-[0.15em] uppercase text-[#4A5A50] font-semibold mb-3">
          Choose category
        </legend>
        <div className="grid grid-cols-4 gap-3">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectCategory(id)}
              data-testid={`category-tab-${id}`}
              aria-pressed={category === id}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-4 rounded-lg border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8BA888] ${
                category === id
                  ? "bg-[#1A2E20] border-[#1A2E20] text-white"
                  : "bg-white border-[#E5E2DA] text-[#4A5A50] hover:border-[#8BA888]"
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Activity type selection */}
      <fieldset className="mb-8 border-0 p-0 m-0">
        <legend className="text-xs tracking-[0.15em] uppercase text-[#4A5A50] font-semibold mb-3">
          Choose activity
        </legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(EMISSION_FACTORS[category]).map(([key, f]) => {
            const Icon   = TYPE_ICONS[key] || Leaf;
            const active = type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                data-testid={`activity-type-${key}`}
                aria-pressed={active}
                className={`relative text-left p-4 rounded-lg border transition-all duration-200 hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#8BA888] ${
                  active
                    ? "border-[#2D5A3F] bg-[#8BA888]/10 ring-1 ring-[#2D5A3F]"
                    : "border-[#E5E2DA] bg-white hover:border-[#8BA888]"
                }`}
              >
                {active && (
                  <CheckCircle2
                    className="absolute top-3 right-3 w-4 h-4 text-[#2D5A3F]"
                    aria-hidden="true"
                  />
                )}
                <Icon className={`w-5 h-5 mb-3 ${active ? "text-[#2D5A3F]" : "text-[#8BA888]"}`} aria-hidden="true" />
                <p className="text-sm font-semibold text-[#1A2E20]">{f.label}</p>
                <p className="text-xs text-[#4A5A50] mt-0.5">
                  {f.factor} kg / {f.unit}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Amount, date and preview */}
      <div className="bg-white border border-[#E5E2DA] rounded-lg p-6">
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="sm:col-span-1">
            <label htmlFor="activity-value" className="text-xs tracking-[0.15em] uppercase text-[#4A5A50] font-semibold">
              Amount {info ? `(${info.unit})` : ""}
            </label>
            <input
              id="activity-value"
              type="number"
              min={CALC_INPUT.MIN}
              max={CALC_INPUT.MAX}
              step={CALC_INPUT.STEP}
              value={value}
              onChange={handleValueChange}
              placeholder={info ? `e.g. 10 ${info.unit}` : "Select activity first"}
              disabled={!type}
              data-testid="activity-value-input"
              aria-describedby={preview ? "co2-preview-value" : undefined}
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-[#F9F8F6] border border-[#E5E2DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] disabled:opacity-50 transition-shadow"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="activity-date" className="text-xs tracking-[0.15em] uppercase text-[#4A5A50] font-semibold">
              Date
            </label>
            <input
              id="activity-date"
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              data-testid="activity-date-input"
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-[#F9F8F6] border border-[#E5E2DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-shadow"
            />
          </div>
          <div className="sm:col-span-1 flex flex-col justify-end">
            <div
              className={`rounded-lg px-4 py-3 text-center border ${preview ? "bg-[#E06D53]/10 border-[#E06D53]/30" : "bg-[#F9F8F6] border-[#E5E2DA]"}`}
              data-testid="co2-preview"
              aria-live="polite"
              aria-label="Estimated CO₂ impact"
            >
              <p className="text-xs text-[#4A5A50]">Estimated impact</p>
              <p id="co2-preview-value" className="font-heading font-extrabold text-lg text-[#1A2E20]">
                {preview ? `${preview} kg CO₂` : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={saving || !type || !value}
            data-testid="log-activity-submit-button"
            className="flex-1 px-6 py-3.5 rounded-lg bg-[#E06D53] text-white font-semibold text-sm hover:bg-[#C95B42] transition-colors duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#E06D53] focus:ring-offset-2"
            aria-busy={saving}
          >
            {saving ? "Logging…" : "Log this activity"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            data-testid="back-to-dashboard-button"
            className="px-6 py-3.5 rounded-lg border border-[#1A2E20] text-[#1A2E20] font-semibold text-sm hover:bg-[#1A2E20] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1A2E20] focus:ring-offset-2"
          >
            View dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
