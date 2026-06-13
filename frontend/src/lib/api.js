// Static emission factors — no backend needed
export const EMISSION_FACTORS = {
  transport: {
    car_petrol:   { label: "Car (Petrol)",    factor: 0.21,  unit: "km" },
    car_electric: { label: "Car (Electric)",  factor: 0.05,  unit: "km" },
    motorbike:    { label: "Motorbike",        factor: 0.114, unit: "km" },
    bus:          { label: "Bus",              factor: 0.089, unit: "km" },
    train:        { label: "Train",            factor: 0.041, unit: "km" },
    flight:       { label: "Flight",           factor: 0.255, unit: "km" },
    bicycle:      { label: "Bicycle",          factor: 0,     unit: "km" },
    walk:         { label: "Walking",          factor: 0,     unit: "km" },
  },
  energy: {
    electricity:  { label: "Electricity",     factor: 0.233, unit: "kWh" },
    natural_gas:  { label: "Natural Gas",     factor: 2.04,  unit: "m³" },
    heating_oil:  { label: "Heating Oil",     factor: 2.68,  unit: "litre" },
    lpg:          { label: "LPG",             factor: 1.51,  unit: "litre" },
  },
  food: {
    beef:         { label: "Beef",            factor: 27.0,  unit: "kg" },
    lamb:         { label: "Lamb",            factor: 39.2,  unit: "kg" },
    pork:         { label: "Pork",            factor: 12.1,  unit: "kg" },
    chicken:      { label: "Chicken",         factor: 6.9,   unit: "kg" },
    fish:         { label: "Fish",            factor: 6.1,   unit: "kg" },
    dairy:        { label: "Dairy",           factor: 3.2,   unit: "kg" },
    vegetarian:   { label: "Vegetarian Meal", factor: 1.5,   unit: "meal" },
    vegan:        { label: "Vegan Meal",      factor: 0.7,   unit: "meal" },
  },
  shopping: {
    clothing:     { label: "Clothing",        factor: 25.0,  unit: "item" },
    electronics:  { label: "Electronics",     factor: 70.0,  unit: "item" },
    furniture:    { label: "Furniture",       factor: 45.0,  unit: "item" },
    books:        { label: "Books",           factor: 1.0,   unit: "item" },
    plastic_goods:{ label: "Plastic Goods",   factor: 6.0,   unit: "item" },
    groceries:    { label: "Groceries",       factor: 0.8,   unit: "kg" },
  },
};

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  return String(detail);
}
