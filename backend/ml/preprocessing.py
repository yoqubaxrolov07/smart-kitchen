"""
SmartKitchen AI - Data Preprocessing Module
Handles: missing values, duplicates, encoding, feature engineering
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer


def load_raw_data(filepath: str) -> pd.DataFrame:
    """Load raw dataset from CSV or Excel."""
    if filepath.endswith('.xlsx'):
        return pd.read_excel(filepath)
    return pd.read_csv(filepath)


def remove_duplicates(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Remove duplicate rows and return count of removed duplicates."""
    n_before = len(df)
    df = df.drop_duplicates().reset_index(drop=True)
    n_removed = n_before - len(df)
    return df, n_removed


def handle_missing_values(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Handle missing values:
    - Numeric columns: fill with median
    - Categorical columns: fill with mode
    Returns cleaned df and report of imputation counts.
    """
    report = {}
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    
    for col in numeric_cols:
        n_missing = df[col].isnull().sum()
        if n_missing > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            report[col] = {"missing_count": int(n_missing), "filled_with": f"median={median_val:.2f}"}
    
    for col in categorical_cols:
        n_missing = df[col].isnull().sum()
        if n_missing > 0:
            mode_val = df[col].mode()[0]
            df[col] = df[col].fillna(mode_val)
            report[col] = {"missing_count": int(n_missing), "filled_with": f"mode={mode_val}"}
    
    return df, report


def encode_categorical(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Encode categorical columns:
    - day_of_week: OneHot encoding
    - food_item: Label encoding (too many categories for OneHot)
    Returns encoded df and encoding mappings.
    """
    mappings = {}
    
    # Day of week: OneHot
    if 'day_of_week' in df.columns:
        day_dummies = pd.get_dummies(df['day_of_week'], prefix='day', dtype=int)
        df = pd.concat([df, day_dummies], axis=1)
        df = df.drop('day_of_week', axis=1)
        mappings['day_of_week'] = list(day_dummies.columns)
    
    # Food item: Label encoding
    if 'food_item' in df.columns:
        le = LabelEncoder()
        df['food_item_encoded'] = le.fit_transform(df['food_item'])
        mappings['food_item'] = dict(zip(le.classes_, le.transform(le.classes_).tolist()))
        df = df.drop('food_item', axis=1)
    
    return df, mappings


def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features."""
    # Price ratio
    if 'checkout_price' in df.columns and 'base_price' in df.columns:
        df['price_ratio'] = df['checkout_price'] / df['base_price'].replace(0, 1)
    
    # Month from date
    if 'date' in df.columns:
        df['month'] = pd.to_datetime(df['date']).dt.month
        df = df.drop('date', axis=1)
    
    return df


def get_feature_columns():
    """Return the list of feature columns used for model training."""
    return [
        'meals_served', 'temp_c', 'is_holiday',
        'checkout_price', 'base_price',
        'homepage_featured', 'emailer_for_promotion',
        'food_item_encoded', 'price_ratio', 'month',
        'day_Friday', 'day_Monday', 'day_Saturday',
        'day_Sunday', 'day_Thursday', 'day_Tuesday', 'day_Wednesday'
    ]


def full_preprocessing_pipeline(filepath: str) -> tuple[pd.DataFrame, dict]:
    """
    Complete preprocessing pipeline:
    1. Load data
    2. Remove duplicates
    3. Handle missing values
    4. Feature engineering
    5. Encode categorical
    Returns (clean_df, pipeline_report)
    """
    report = {}
    
    # Step 1: Load
    df = load_raw_data(filepath)
    report['original_shape'] = list(df.shape)
    
    # Step 2: Remove duplicates
    df, n_dupes = remove_duplicates(df)
    report['duplicates_removed'] = n_dupes
    
    # Step 3: Handle missing values
    df, missing_report = handle_missing_values(df)
    report['missing_values_handled'] = missing_report
    
    # Step 4: Feature engineering
    df = feature_engineering(df)
    
    # Step 5: Encode categorical
    df, encoding_maps = encode_categorical(df)
    report['encodings'] = encoding_maps
    
    report['final_shape'] = list(df.shape)
    
    return df, report
