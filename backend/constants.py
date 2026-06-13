"""Domain constants: emission factors, gamification badges and benchmarks.

Emission factors are expressed in kg CO2e per unit, sourced from public
datasets (UK DEFRA/BEIS conversion factors and Our World in Data food
footprints, rounded for clarity).
"""

FACTORS = {
    "transport": {
        "car_petrol": {"label": "Petrol Car", "unit": "km", "factor": 0.192},
        "car_electric": {"label": "Electric Car", "unit": "km", "factor": 0.053},
        "motorbike": {"label": "Motorbike", "unit": "km", "factor": 0.114},
        "bus": {"label": "Bus", "unit": "km", "factor": 0.105},
        "train": {"label": "Train / Metro", "unit": "km", "factor": 0.041},
        "flight": {"label": "Flight", "unit": "km", "factor": 0.255},
        "bicycle": {"label": "Bicycle", "unit": "km", "factor": 0.0},
        "walk": {"label": "Walking", "unit": "km", "factor": 0.0},
    },
    "energy": {
        "electricity": {"label": "Electricity", "unit": "kWh", "factor": 0.475},
        "natural_gas": {"label": "Natural Gas", "unit": "kWh", "factor": 0.185},
        "heating_oil": {"label": "Heating Oil", "unit": "litre", "factor": 2.52},
        "lpg": {"label": "LPG", "unit": "kg", "factor": 2.98},
    },
    "food": {
        "beef": {"label": "Beef Meal", "unit": "serving", "factor": 7.7},
        "lamb": {"label": "Lamb Meal", "unit": "serving", "factor": 5.8},
        "pork": {"label": "Pork Meal", "unit": "serving", "factor": 3.8},
        "chicken": {"label": "Chicken Meal", "unit": "serving", "factor": 1.8},
        "fish": {"label": "Fish Meal", "unit": "serving", "factor": 1.6},
        "dairy": {"label": "Dairy Heavy", "unit": "serving", "factor": 1.3},
        "vegetarian": {"label": "Vegetarian Meal", "unit": "serving", "factor": 0.6},
        "vegan": {"label": "Vegan Meal", "unit": "serving", "factor": 0.4},
    },
    "shopping": {
        "clothing": {"label": "Clothing", "unit": "item", "factor": 10.0},
        "electronics": {"label": "Electronics", "unit": "item", "factor": 45.0},
        "furniture": {"label": "Furniture", "unit": "item", "factor": 30.0},
        "books": {"label": "Books / Paper", "unit": "item", "factor": 1.2},
        "plastic_goods": {"label": "Plastic Goods", "unit": "item", "factor": 2.5},
        "groceries": {"label": "Packaged Groceries", "unit": "bag", "factor": 1.5},
    },
}

# ~4.7 t CO2e per person per year (global average) => ~90 kg per week.
GLOBAL_WEEKLY_AVG_KG = 90.0
# A mature tree absorbs roughly 21 kg CO2 per year => ~1.75 kg per month.
TREE_ABSORPTION_KG_PER_MONTH = 1.75

BADGES = [
    {"id": "first_step", "name": "First Step", "desc": "Log your first activity", "icon": "footprints"},
    {"id": "eco_curious", "name": "Eco Curious", "desc": "Log 10 activities", "icon": "sprout"},
    {"id": "data_devotee", "name": "Data Devotee", "desc": "Log 50 activities", "icon": "bar-chart"},
    {"id": "streak_3", "name": "Momentum", "desc": "3-day logging streak", "icon": "flame"},
    {"id": "streak_7", "name": "Week Warrior", "desc": "7-day logging streak", "icon": "calendar"},
    {"id": "streak_30", "name": "Habit Hero", "desc": "30-day logging streak", "icon": "trophy"},
    {"id": "explorer", "name": "Full Spectrum", "desc": "Log in all 4 categories", "icon": "compass"},
    {"id": "light_day", "name": "Light Footprint", "desc": "A logged day under 5 kg CO2", "icon": "feather"},
    {"id": "insight_seeker", "name": "Insight Seeker", "desc": "Generate an AI insight", "icon": "lightbulb"},
]
