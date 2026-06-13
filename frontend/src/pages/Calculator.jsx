import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car, Bus, TrainFront, Plane, Bike, Footprints, Zap, Flame, Droplet, Cylinder,
  Beef, Drumstick, Fish, Ham, Milk, Salad, Leaf, Shirt, Smartphone, Armchair,
  BookOpen, Package, ShoppingBasket, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { EMISSION_FACTORS } from "../lib/api";

const CATEGORIES = [
  { id: "transport", label: "Transport", icon: Car },
  { id: "energy",    label: "Energy",    icon: Zap },
  { id: "food",      label: "Food",      icon: Salad },
  { id: "shopping",  label: "Shopping",  icon: ShoppingBasket },
];

const TYPE_ICONS = {
  car_petrol: Car, car_electric: Car, motorbike: Bike, bus: Bus, train: TrainFront,
  flight: Plane, bicycle: Bike, walk: Footprints,
  electricity: Zap, natural_gas: Flame, heating_oil: Droplet, lpg: Cylinder,
  beef: Beef, lamb: Ham, pork: Ham, chicken: Drumstick, fish: Fish, dairy: Milk,
  vegetarian: Salad, vegan: Leaf,
  clothing: Shirt, electronics: Smartphone, furniture: Armchair, books: BookOpen,
  plastic_goods: Package, groceries: ShoppingBasket,
};

export default function Calculator() {
  const [category, setCategory] = useState("transport");
  const [type, setType] = useState(null);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const selectCategory = (id) => {
    setCategory(id);
    setType(null);
    setValue("");
  };

  const factors = EMISSION_FACTORS;
  const info = type ? factors[category][type] : null;
  const preview = info && value > 0 ? (value * info.factor).toFixed(2) : null;

  const submit = () => {
    if (!type || !value || value <= 0) {
      toast.error("Pick an activity and enter a value");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const co2 = (value * info.factor).toFixed(2);
      toast.success(`Logged ${info.label}: ${co2} kg CO₂`);
      setType(null);
      setValue("");
      setSaving(false);
    }, 600);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto" data-testid="calculator-page">
      <p className="text-xs tracking-[0.2em] uppercase text-[#5C6B61] mb-1.5">Carbon Calculator</p>
      <h1 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A2E20] mb-8">
        Log an activity
      </h1>

      {/* Category tabs */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => selectCategory(id)}
            data-testid={`category-tab-${id}`}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-4 rounded-lg border text-sm font-semibold transition-all duration-200 ${
              category === id
                ? "bg-[#1A2E20] border-[#1A2E20] text-white"
                : "bg-white border-[#E5E2DA] text-[#5C6B61] hover:border-[#8BA888]"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Type cards */}
      <p className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold mb-3">Choose activity</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Object.entries(factors[category]).map(([key, f]) => {
          const Icon = TYPE_ICONS[key] || Leaf;
          const active = type === key;
          return (
            <button
              key={key}
              onClick={() => setType(key)}
              data-testid={`activity-type-${key}`}
              className={`relative text-left p-4 rounded-lg border transition-all duration-200 hover:-translate-y-[1px] ${
                active ? "border-[#2D5A3F] bg-[#8BA888]/10 ring-1 ring-[#2D5A3F]" : "border-[#E5E2DA] bg-white hover:border-[#8BA888]"
              }`}
            >
              {active && <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#2D5A3F]" />}
              <Icon className={`w-5 h-5 mb-3 ${active ? "text-[#2D5A3F]" : "text-[#8BA888]"}`} />
              <p className="text-sm font-semibold text-[#1A2E20]">{f.label}</p>
              <p className="text-xs text-[#5C6B61] mt-0.5">{f.factor} kg / {f.unit}</p>
            </button>
          );
        })}
      </div>

      {/* Value + date + submit */}
      <div className="bg-white border border-[#E5E2DA] rounded-lg p-6">
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="sm:col-span-1">
            <label htmlFor="activity-value" className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold">
              Amount {info ? `(${info.unit})` : ""}
            </label>
            <input
              id="activity-value"
              type="number"
              min="0.1"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={info ? `e.g. 10 ${info.unit}` : "Select activity first"}
              disabled={!type}
              data-testid="activity-value-input"
              className="mt-1.5 w-full px-4 py-3 rounded-lg bg-[#F9F8F6] border border-[#E5E2DA] text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] disabled:opacity-50 transition-shadow"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="activity-date" className="text-xs tracking-[0.15em] uppercase text-[#5C6B61] font-semibold">Date</label>
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
            <div className={`rounded-lg px-4 py-3 text-center border ${preview ? "bg-[#E06D53]/10 border-[#E06D53]/30" : "bg-[#F9F8F6] border-[#E5E2DA]"}`} data-testid="co2-preview">
              <p className="text-xs text-[#5C6B61]">Estimated impact</p>
              <p className="font-heading font-extrabold text-lg text-[#1A2E20]">
                {preview ? `${preview} kg CO₂` : "—"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={submit}
            disabled={saving || !type || !value}
            data-testid="log-activity-submit-button"
            className="flex-1 px-6 py-3.5 rounded-lg bg-[#E06D53] text-white font-semibold text-sm hover:bg-[#C95B42] transition-colors duration-200 disabled:opacity-50"
          >
            {saving ? "Logging..." : "Log this activity"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            data-testid="back-to-dashboard-button"
            className="px-6 py-3.5 rounded-lg border border-[#1A2E20] text-[#1A2E20] font-semibold text-sm hover:bg-[#1A2E20] hover:text-white transition-colors duration-200"
          >
            View dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
