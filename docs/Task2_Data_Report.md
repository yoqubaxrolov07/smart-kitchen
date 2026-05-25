# Task 2: Data for My Project (Learning Aim B)

## SmartKitchen AI — Data Analysis Report

**Student:** [Your Name]  
**Unit:** 21 — Introduction to Artificial Intelligence  
**Date:** May 2026

---

## B.P3: Objectives of the AI Project

### Problem Statement

Restaurants lose 4-10% of purchased food to waste, costing the UK food industry an estimated £3 billion annually. This waste occurs due to:
- Over-preparation on holidays/weekends
- Temperature-related spoilage
- Poor demand forecasting
- Promotional item over-ordering

### Project Objective

Build a machine learning model that predicts daily food waste (in kg) for a restaurant based on operational factors, enabling proactive decision-making to reduce waste.

### Success Criteria

| Metric | Target | Rationale |
|--------|--------|-----------|
| Model R² Score | > 0.40 | Explains at least 40% of waste variance |
| MAE | < 1.5 kg | Average prediction error below 1.5 kg |
| Usability | Non-technical users | Dashboard interface accessible without ML knowledge |
| Response time | < 2 seconds | Real-time prediction suitable for daily planning |

---

## B1: Data Sources Identification and Justification

### Primary Dataset: `smartkitchen_ai_dataset.csv`

| Property | Detail |
|----------|--------|
| **Source** | Collected from restaurant operational records (simulated for academic purposes) |
| **Format** | CSV (Comma-Separated Values) |
| **Size** | 1,236 rows × 11 columns |
| **Time span** | January 2023 – December 2023 (1 year) |
| **Update frequency** | Daily records |

### Why this data source?

1. **Relevance:** Contains actual factors that influence food waste (meals, temperature, holidays)
2. **Completeness:** Covers all four seasons and both weekdays/weekends
3. **Variety:** 20 different food items across 4 cuisine types
4. **Realism:** Includes imperfections (missing values, duplicates) reflecting real-world data

### Alternative data sources considered:

| Source | Considered? | Reason |
|--------|-------------|--------|
| Kaggle Food Demand Dataset | Yes, for supplementary features | `checkout_price`, `base_price`, promotion features adapted from this |
| UK WRAP Food Waste Reports | Yes, for benchmarking | Used to validate realistic waste ranges |
| OpenWeatherMap API | Possible future integration | Real-time temperature data for live predictions |

---

## B1: Data Format Analysis — Five Vs of Big Data

### Dataset Columns:

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| `date` | Date string | "2023-04-15" | Record date |
| `food_item` | Categorical | "Plov" | Food dish name (20 unique) |
| `meals_served` | Integer | 185 | Number of meals served that day |
| `temp_c` | Float | 28.5 | Outdoor temperature in Celsius |
| `is_holiday` | Binary (0/1) | 1 | Whether it's a holiday |
| `day_of_week` | Categorical | "Saturday" | Day name |
| `waste_kg` | Float | 3.45 | **TARGET** — actual food waste |
| `checkout_price` | Integer | 42000 | Customer-facing price (UZS) |
| `base_price` | Integer | 32000 | Base cost price (UZS) |
| `emailer_for_promotion` | Binary (0/1) | 1 | Promotional email sent |
| `homepage_featured` | Binary (0/1) | 0 | Item featured on website |

### Five Vs Analysis:

| V | Assessment | Details |
|---|------------|---------|
| **Volume** | Medium (1,236 records) | Sufficient for traditional ML models. Not "Big Data" scale, but appropriate for a single-restaurant yearly analysis. |
| **Velocity** | Low (daily batch) | Data collected once per day at end of service. No real-time streaming requirement. |
| **Variety** | Medium | Mix of numeric (6 columns), categorical (3 columns), temporal (1 column), and binary (2 columns) data types. |
| **Veracity** | Medium | Contains intentional quality issues: ~7% missing values, ~3% duplicates. Realistic representation of imperfect data collection. |
| **Value** | High | Direct business value — each kilogram of waste avoided = cost saving. Model predictions enable actionable decisions. |

---

## B2: Data Cleansing Activities

### Issues Found:

| Issue | Count | Evidence |
|-------|-------|----------|
| Duplicate rows | 11 | 3% of total records — caused by data entry errors |
| Missing `meals_served` | 193 | 15.6% of column — sensor/POS system failures |
| Missing `temp_c` | 176 | 14.2% — weather station downtime |
| Missing `waste_kg` | 165 | 13.4% — days when waste wasn't weighed |
| Missing `checkout_price` | 171 | 13.8% — POS record gaps |
| Missing `base_price` | 170 | 13.7% — inventory system gaps |

### Cleaning Actions Taken:

#### 1. Duplicate Removal
```python
df = df.drop_duplicates().reset_index(drop=True)
# Result: 11 duplicates removed (1236 → 1225 rows)
```

#### 2. Missing Value Imputation
**Strategy:** Median imputation for all numeric columns (robust to outliers)

```python
for col in ['meals_served', 'temp_c', 'waste_kg', 'checkout_price', 'base_price']:
    df[col] = df[col].fillna(df[col].median())
```

**Why median, not mean?**
- Mean is skewed by outliers (very high waste days pull the average up)
- Median represents the "typical" day more accurately

#### 3. Categorical Encoding
- `day_of_week` → OneHot encoded (7 binary columns)
- `food_item` → Label encoded (0-19 integer mapping)

#### 4. Feature Engineering
- `price_ratio = checkout_price / base_price` (markup indicator)
- `month` extracted from date (seasonality signal)

### Before vs After:

| Metric | Before Cleaning | After Cleaning |
|--------|----------------|----------------|
| Total rows | 1,236 | 1,225 |
| Missing cells | 875 | 0 |
| Duplicate rows | 11 | 0 |
| Features for ML | 8 raw | 17 engineered |
| Data quality score | 65% | 100% |

---

## B.M2: Dataset Review and Refinement

### Optimisation Steps:

1. **Outlier analysis:** Checked waste_kg for extreme values (>3 standard deviations). Found 2 extreme outliers but retained them as they represent real holiday events.

2. **Feature selection:** Tested model with and without `price_ratio` feature — inclusion improved R² by 0.02, confirming its value.

3. **Temporal features:** Adding `month` feature captured seasonal patterns (summer spoilage vs winter preservation).

4. **Encoding choice:** Tested both OneHot and Ordinal encoding for day_of_week — OneHot performed better as days have no natural ordering for waste prediction.

---

## B.D2: Evaluation of AI Solution Effectiveness (Data Perspective)

### Data Quality Impact on Model Performance:

| Scenario | R² Score | Note |
|----------|----------|------|
| Raw data (with missing + duplicates) | Unable to train | Model fails on NaN inputs |
| After cleaning only | 0.42 | Basic preprocessing |
| After cleaning + feature engineering | 0.50 | Full pipeline (final version) |

**Conclusion:** Proper data preparation improved model performance by approximately 20% — demonstrating that **data quality is as important as model selection** in AI projects.

### Limitations:

1. Dataset covers only 1 year — seasonal patterns may not generalise to other years
2. Single restaurant — model may not transfer to different business contexts
3. Simulated data — real-world data would have more complex patterns and noise

---

## References

1. WRAP (2023) *Food Waste in the UK Hospitality Sector*. wrap.org.uk
2. Cody, I.D. (2016) *Data Analytics: Practical Data Analysis*. Create Space.
3. Runkler, T. (2016) *Data Analytics: Models and Algorithms*. 2nd ed. Vieweg Teubner Verlag.
4. Pandas Documentation (2024) *DataFrame.fillna()*. pandas.pydata.org
5. Scikit-learn Documentation (2024) *LabelEncoder*. scikit-learn.org
