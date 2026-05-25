"""
SmartKitchen AI - Model Training Module
Trains both Linear Regression (baseline) and Random Forest Regressor (main).
Performs 80/20 train-test split and evaluates with MAE, RMSE, R².
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

from preprocessing import full_preprocessing_pipeline, get_feature_columns

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(os.path.dirname(BASE_DIR))
RAW_DATA = os.path.join(PROJECT_DIR, "data", "raw", "smartkitchen_ai_dataset.csv")
PROCESSED_DATA = os.path.join(PROJECT_DIR, "data", "processed", "smartkitchen_clean.csv")
MODELS_DIR = os.path.join(PROJECT_DIR, "models")
REPORTS_DIR = os.path.join(PROJECT_DIR, "reports")


def evaluate_model(model, X_test, y_test, model_name: str) -> dict:
    """Evaluate model and return metrics."""
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    return {
        "model_name": model_name,
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4),
        "predictions_sample": y_pred[:10].tolist(),
        "actuals_sample": y_test[:10].tolist(),
    }


def get_feature_importance(model, feature_names: list) -> dict:
    """Get feature importance from Random Forest."""
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        feature_imp = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1],
            reverse=True
        )
        return {name: round(float(imp), 4) for name, imp in feature_imp}
    return {}


def train_models(data_path: str = None) -> dict:
    """
    Full training pipeline:
    1. Preprocess data
    2. Split 80/20
    3. Train Linear Regression (baseline)
    4. Train Random Forest (main model)
    5. Evaluate both
    6. Save models + report
    """
    if data_path is None:
        data_path = RAW_DATA
    
    # Step 1: Preprocess
    df, preprocess_report = full_preprocessing_pipeline(data_path)
    
    # Save cleaned data
    os.makedirs(os.path.dirname(PROCESSED_DATA), exist_ok=True)
    df.to_csv(PROCESSED_DATA, index=False)
    
    # Step 2: Prepare features and target
    feature_cols = get_feature_columns()
    
    # Ensure all expected columns exist
    available_features = [col for col in feature_cols if col in df.columns]
    
    X = df[available_features]
    y = df['waste_kg']
    
    # Drop rows where target is NaN (shouldn't happen after preprocessing, but safety)
    mask = ~y.isnull()
    X = X[mask]
    y = y[mask]
    
    # Step 3: 80/20 Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Step 4: Train Linear Regression (baseline)
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)
    lr_metrics = evaluate_model(lr_model, X_test, y_test, "Linear Regression")
    
    # Cross-validation for LR
    lr_cv_scores = cross_val_score(lr_model, X, y, cv=5, scoring='r2')
    lr_metrics['cv_r2_mean'] = round(float(lr_cv_scores.mean()), 4)
    lr_metrics['cv_r2_std'] = round(float(lr_cv_scores.std()), 4)
    
    # Step 5: Train Random Forest (main model)
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    rf_metrics = evaluate_model(rf_model, X_test, y_test, "Random Forest")
    
    # Cross-validation for RF
    rf_cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='r2')
    rf_metrics['cv_r2_mean'] = round(float(rf_cv_scores.mean()), 4)
    rf_metrics['cv_r2_std'] = round(float(rf_cv_scores.std()), 4)
    
    # Feature importance
    feature_importance = get_feature_importance(rf_model, available_features)
    rf_metrics['feature_importance'] = feature_importance
    
    # Step 6: Save models
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(lr_model, os.path.join(MODELS_DIR, "linear_regression.joblib"))
    joblib.dump(rf_model, os.path.join(MODELS_DIR, "random_forest.joblib"))
    
    # Save feature list for prediction time
    model_meta = {
        "features": available_features,
        "trained_at": datetime.now().isoformat(),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "dataset_rows": len(df),
    }
    with open(os.path.join(MODELS_DIR, "model_meta.json"), 'w') as f:
        json.dump(model_meta, f, indent=2)
    
    # Full training report
    training_report = {
        "preprocessing": preprocess_report,
        "split": {"train": len(X_train), "test": len(X_test), "ratio": "80/20"},
        "linear_regression": lr_metrics,
        "random_forest": rf_metrics,
        "model_meta": model_meta,
    }
    
    # Save report
    os.makedirs(REPORTS_DIR, exist_ok=True)
    with open(os.path.join(REPORTS_DIR, "training_report.json"), 'w') as f:
        json.dump(training_report, f, indent=2, default=str)
    
    print("=" * 60)
    print("SMARTKITCHEN AI - MODEL TRAINING COMPLETE")
    print("=" * 60)
    print(f"\nDataset: {len(df)} rows, {len(available_features)} features")
    print(f"Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"\n--- Linear Regression (Baseline) ---")
    print(f"  MAE:  {lr_metrics['mae']:.4f} kg")
    print(f"  RMSE: {lr_metrics['rmse']:.4f} kg")
    print(f"  R²:   {lr_metrics['r2_score']:.4f}")
    print(f"  CV R² (5-fold): {lr_metrics['cv_r2_mean']:.4f} ± {lr_metrics['cv_r2_std']:.4f}")
    print(f"\n--- Random Forest (Main Model) ---")
    print(f"  MAE:  {rf_metrics['mae']:.4f} kg")
    print(f"  RMSE: {rf_metrics['rmse']:.4f} kg")
    print(f"  R²:   {rf_metrics['r2_score']:.4f}")
    print(f"  CV R² (5-fold): {rf_metrics['cv_r2_mean']:.4f} ± {rf_metrics['cv_r2_std']:.4f}")
    print(f"\n--- Top 5 Feature Importances ---")
    for i, (feat, imp) in enumerate(list(feature_importance.items())[:5]):
        print(f"  {i+1}. {feat}: {imp:.4f}")
    print(f"\nModels saved to: {MODELS_DIR}/")
    print(f"Report saved to: {REPORTS_DIR}/training_report.json")
    
    return training_report


if __name__ == "__main__":
    train_models()
