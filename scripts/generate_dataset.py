"""
SmartKitchen AI - Synthetic Dataset Generator
Generates realistic food waste data for restaurant prediction model.
Intentionally includes:
  - ~7% missing values
  - ~3% duplicate rows
  - Realistic correlations between features and waste_kg
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta

np.random.seed(42)

# --- CONFIG ---
NUM_ROWS = 1200  # Good size for BTEC assignment
START_DATE = datetime(2023, 1, 1)

FOOD_ITEMS = [
    "Plov", "Shashlik", "Lagman", "Samsa", "Manti",
    "Caesar Salad", "Grilled Chicken", "Pasta Carbonara",
    "Burger & Fries", "Sushi Set", "Tom Yum Soup",
    "Margherita Pizza", "Fish and Chips", "Beef Steak",
    "Vegetable Stir Fry", "Chicken Tikka", "Lamb Kebab",
    "Seafood Paella", "Mushroom Risotto", "Thai Green Curry"
]

# Price ranges per food item (checkout_price, base_price)
PRICE_MAP = {
    "Plov": (35000, 28000), "Shashlik": (45000, 35000),
    "Lagman": (30000, 22000), "Samsa": (15000, 10000),
    "Manti": (25000, 18000), "Caesar Salad": (40000, 30000),
    "Grilled Chicken": (50000, 38000), "Pasta Carbonara": (42000, 32000),
    "Burger & Fries": (38000, 28000), "Sushi Set": (65000, 50000),
    "Tom Yum Soup": (35000, 25000), "Margherita Pizza": (40000, 30000),
    "Fish and Chips": (45000, 34000), "Beef Steak": (75000, 58000),
    "Vegetable Stir Fry": (30000, 22000), "Chicken Tikka": (42000, 32000),
    "Lamb Kebab": (55000, 42000), "Seafood Paella": (60000, 45000),
    "Mushroom Risotto": (38000, 28000), "Thai Green Curry": (40000, 30000),
}

def generate_dataset():
    rows = []
    
    for i in range(NUM_ROWS):
        date = START_DATE + timedelta(days=np.random.randint(0, 365))
        day_of_week = date.strftime("%A")
        is_weekend = 1 if day_of_week in ["Saturday", "Sunday"] else 0
        
        # Holidays: New Year, Navruz, Ramadan period, Independence Day
        is_holiday = 0
        if date.month == 1 and date.day <= 3:
            is_holiday = 1
        elif date.month == 3 and 20 <= date.day <= 23:
            is_holiday = 1
        elif date.month == 9 and date.day == 1:
            is_holiday = 1
        elif np.random.random() < 0.03:  # Random holidays
            is_holiday = 1
        
        food_item = np.random.choice(FOOD_ITEMS)
        checkout_price, base_price = PRICE_MAP[food_item]
        
        # Add noise to prices
        checkout_price = int(checkout_price * np.random.uniform(0.85, 1.15))
        base_price = int(base_price * np.random.uniform(0.90, 1.10))
        
        # Temperature: Tashkent-like climate
        month = date.month
        if month in [12, 1, 2]:
            temp_c = np.random.normal(-2, 5)
        elif month in [3, 4, 5]:
            temp_c = np.random.normal(18, 6)
        elif month in [6, 7, 8]:
            temp_c = np.random.normal(35, 5)
        else:
            temp_c = np.random.normal(15, 6)
        temp_c = round(np.clip(temp_c, -15, 45), 1)
        
        # Meals served: more on weekends/holidays, affected by temp
        base_meals = np.random.randint(80, 250)
        if is_weekend:
            base_meals = int(base_meals * 1.3)
        if is_holiday:
            base_meals = int(base_meals * 1.5)
        if temp_c > 35:
            base_meals = int(base_meals * 0.85)  # Too hot, fewer customers
        meals_served = max(40, base_meals + np.random.randint(-20, 20))
        
        # Promotion features
        emailer_for_promotion = np.random.choice([0, 1], p=[0.7, 0.3])
        homepage_featured = np.random.choice([0, 1], p=[0.75, 0.25])
        
        # --- WASTE MODEL (realistic correlations) ---
        # Base waste proportional to meals
        waste = meals_served * np.random.uniform(0.008, 0.025)
        
        # Holiday effect: more waste (over-preparation)
        if is_holiday:
            waste *= np.random.uniform(1.2, 1.6)
        
        # Weekend slightly more waste
        if is_weekend:
            waste *= np.random.uniform(1.05, 1.2)
        
        # Hot weather: more spoilage
        if temp_c > 30:
            waste *= np.random.uniform(1.1, 1.4)
        elif temp_c < 0:
            waste *= np.random.uniform(0.8, 1.0)  # Less spoilage when cold
        
        # Promoted items: over-ordered → more waste
        if emailer_for_promotion:
            waste *= np.random.uniform(1.05, 1.15)
        if homepage_featured:
            waste *= np.random.uniform(1.05, 1.2)
        
        # Expensive items: less waste (more careful handling)
        price_factor = checkout_price / 75000  # normalize
        waste *= (1.1 - price_factor * 0.3)
        
        waste_kg = round(max(0.2, waste), 2)
        
        rows.append({
            "date": date.strftime("%Y-%m-%d"),
            "food_item": food_item,
            "meals_served": meals_served,
            "temp_c": temp_c,
            "is_holiday": is_holiday,
            "day_of_week": day_of_week,
            "waste_kg": waste_kg,
            "checkout_price": checkout_price,
            "base_price": base_price,
            "emailer_for_promotion": emailer_for_promotion,
            "homepage_featured": homepage_featured,
        })
    
    df = pd.DataFrame(rows)
    
    # --- INTENTIONALLY ADD PROBLEMS ---
    
    # 1. Add ~3% duplicate rows (36 rows)
    n_duplicates = int(len(df) * 0.03)
    duplicate_indices = np.random.choice(df.index, size=n_duplicates, replace=False)
    duplicates = df.iloc[duplicate_indices].copy()
    df = pd.concat([df, duplicates], ignore_index=True)
    
    # 2. Add ~7% missing values (spread across columns)
    total_cells = df.shape[0] * df.shape[1]
    n_missing = int(total_cells * 0.07)
    
    # Only add NaN to appropriate columns (not all)
    nullable_cols = ["meals_served", "temp_c", "waste_kg", "checkout_price", "base_price"]
    for _ in range(n_missing):
        row_idx = np.random.randint(0, len(df))
        col = np.random.choice(nullable_cols)
        df.at[row_idx, col] = np.nan
    
    # Shuffle the dataframe
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df


if __name__ == "__main__":
    df = generate_dataset()
    
    # Save raw dataset
    output_path = "/projects/sandbox/smart-kitchen/data/raw/smartkitchen_ai_dataset.csv"
    df.to_csv(output_path, index=False)
    
    print(f"Dataset generated: {len(df)} rows x {df.shape[1]} columns")
    print(f"Saved to: {output_path}")
    print(f"\nColumn types:\n{df.dtypes}")
    print(f"\nMissing values:\n{df.isnull().sum()}")
    print(f"\nDuplicate rows: {df.duplicated().sum()}")
    print(f"\nFirst 5 rows:\n{df.head()}")
    print(f"\nBasic stats:\n{df.describe()}")
