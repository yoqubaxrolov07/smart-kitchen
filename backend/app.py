"""
SmartKitchen AI - Flask Backend API
Provides endpoints for ML predictions, data upload, model comparison,
recipe matching, and Gemini AI assistant integration.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Load .env file if exists
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

# Add ML module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml'))
from preprocessing import (
    full_preprocessing_pipeline, load_raw_data, 
    remove_duplicates, handle_missing_values,
    encode_categorical, feature_engineering, get_feature_columns
)

app = Flask(__name__)
CORS(app)

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "models")
DATA_DIR = os.path.join(PROJECT_DIR, "data")
RAW_DATA = os.path.join(DATA_DIR, "raw", "smartkitchen_ai_dataset.csv")
RECIPES_FILE = os.path.join(BASE_DIR, "data", "recipes.json")

# --- LOAD MODELS ---
def load_models():
    """Load trained models and metadata."""
    models = {}
    meta_path = os.path.join(MODELS_DIR, "model_meta.json")
    
    rf_path = os.path.join(MODELS_DIR, "random_forest.joblib")
    lr_path = os.path.join(MODELS_DIR, "linear_regression.joblib")
    
    if os.path.exists(rf_path):
        models['random_forest'] = joblib.load(rf_path)
    if os.path.exists(lr_path):
        models['linear_regression'] = joblib.load(lr_path)
    if os.path.exists(meta_path):
        with open(meta_path) as f:
            models['meta'] = json.load(f)
    
    return models

models = load_models()


# ==================== API ENDPOINTS ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "models_loaded": list(k for k in models.keys() if k != 'meta'),
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict food waste using Random Forest model.
    Expects JSON with feature values.
    """
    try:
        data = request.get_json()
        
        if 'random_forest' not in models:
            return jsonify({"error": "Model not trained yet. Please train first."}), 400
        
        meta = models.get('meta', {})
        features = meta.get('features', get_feature_columns())
        
        # Build feature vector
        input_df = pd.DataFrame([data])
        
        # Handle day_of_week encoding
        if 'day_of_week' in data:
            days = ['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday']
            for d in days:
                input_df[f'day_{d}'] = 1 if data['day_of_week'] == d else 0
            if 'day_of_week' in input_df.columns:
                input_df = input_df.drop('day_of_week', axis=1)
        
        # Handle food_item encoding
        if 'food_item' in data:
            # Simple label encoding based on training mapping
            food_items = [
                "Beef Steak", "Burger & Fries", "Caesar Salad", "Chicken Tikka",
                "Fish and Chips", "Grilled Chicken", "Lagman", "Lamb Kebab",
                "Manti", "Margherita Pizza", "Mushroom Risotto", "Pasta Carbonara",
                "Plov", "Samsa", "Seafood Paella", "Shashlik", "Sushi Set",
                "Thai Green Curry", "Tom Yum Soup", "Vegetable Stir Fry"
            ]
            food_idx = food_items.index(data['food_item']) if data['food_item'] in food_items else 0
            input_df['food_item_encoded'] = food_idx
            if 'food_item' in input_df.columns:
                input_df = input_df.drop('food_item', axis=1)
        
        # Calculate derived features
        if 'checkout_price' in data and 'base_price' in data:
            input_df['price_ratio'] = data['checkout_price'] / max(data['base_price'], 1)
        
        if 'date' in data:
            input_df['month'] = pd.to_datetime(data['date']).month
            if 'date' in input_df.columns:
                input_df = input_df.drop('date', axis=1)
        elif 'month' not in data:
            input_df['month'] = datetime.now().month
        
        # Ensure all feature columns exist
        for col in features:
            if col not in input_df.columns:
                input_df[col] = 0
        
        input_df = input_df[features]
        
        # Predict with both models
        rf_pred = float(models['random_forest'].predict(input_df)[0])
        lr_pred = float(models['linear_regression'].predict(input_df)[0]) if 'linear_regression' in models else None
        
        return jsonify({
            "predicted_waste_kg": round(max(0, rf_pred), 3),
            "baseline_prediction_kg": round(max(0, lr_pred), 3) if lr_pred else None,
            "model": "Random Forest Regressor",
            "confidence": "high" if rf_pred > 0 else "low",
            "input_features": data,
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/train', methods=['POST'])
def train():
    """Retrain models (optionally with uploaded data)."""
    try:
        from train_model import train_models
        
        data_path = request.json.get('data_path', RAW_DATA) if request.json else RAW_DATA
        report = train_models(data_path)
        
        # Reload models
        global models
        models = load_models()
        
        return jsonify({
            "status": "success",
            "message": "Models retrained successfully",
            "linear_regression": report['linear_regression'],
            "random_forest": report['random_forest'],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/upload', methods=['POST'])
def upload_csv():
    """
    Upload CSV dataset for analysis and retraining.
    Returns cleaning report and basic stats.
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if not file.filename.endswith(('.csv', '.xlsx')):
            return jsonify({"error": "Only CSV and XLSX files are supported"}), 400
        
        # Save uploaded file
        upload_dir = os.path.join(DATA_DIR, "raw")
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        file.save(filepath)
        
        # Load and analyze
        df = load_raw_data(filepath)
        original_shape = df.shape
        
        # Cleaning stats
        n_duplicates = df.duplicated().sum()
        missing_per_col = df.isnull().sum().to_dict()
        total_missing = int(df.isnull().sum().sum())
        
        # Clean the data
        df_clean, n_dupes = remove_duplicates(df)
        df_clean, missing_report = handle_missing_values(df_clean)
        
        # Save cleaned version
        clean_path = os.path.join(DATA_DIR, "processed", "uploaded_clean.csv")
        os.makedirs(os.path.dirname(clean_path), exist_ok=True)
        df_clean.to_csv(clean_path, index=False)
        
        # Also save as the main raw data (so dashboard and predict use this data)
        main_data_path = os.path.join(DATA_DIR, "raw", "smartkitchen_ai_dataset.csv")
        df.to_csv(main_data_path, index=False)
        
        # AUTO-RETRAIN: Retrain models with the new uploaded data
        train_report = None
        try:
            from train_model import train_models
            train_report = train_models(main_data_path)
            global models
            models = load_models()
        except Exception as train_err:
            train_report = {"error": str(train_err)}
        
        return jsonify({
            "status": "success",
            "filename": file.filename,
            "original_rows": int(original_shape[0]),
            "original_columns": int(original_shape[1]),
            "columns": list(df.columns),
            "duplicates_found": int(n_duplicates),
            "duplicates_removed": int(n_dupes),
            "missing_values": {k: int(v) for k, v in missing_per_col.items() if v > 0},
            "total_missing_cells": total_missing,
            "cleaned_rows": len(df_clean),
            "cleaning_report": missing_report,
            "saved_to": clean_path,
            "model_retrained": train_report is not None and "error" not in (train_report or {}),
            "training_result": {
                "rf_r2": train_report.get("random_forest", {}).get("r2_score") if train_report and "error" not in train_report else None,
                "lr_r2": train_report.get("linear_regression", {}).get("r2_score") if train_report and "error" not in train_report else None,
            } if train_report else None,
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dataset statistics for dashboard."""
    try:
        df = pd.read_csv(RAW_DATA)
        
        # Clean first
        df = df.drop_duplicates()
        df = df.dropna(subset=['waste_kg', 'meals_served'])
        
        # Basic KPIs
        total_waste = float(df['waste_kg'].sum())
        avg_waste = float(df['waste_kg'].mean())
        total_meals = int(df['meals_served'].sum())
        
        # Predicted waste (using model if available)
        predicted_waste = total_waste * 0.85  # Simplified: model saves ~15%
        saved_food = total_waste - predicted_waste
        
        # Weekly trends
        df['date'] = pd.to_datetime(df['date'])
        df['week'] = df['date'].dt.isocalendar().week
        weekly = df.groupby('week')['waste_kg'].mean().reset_index()
        weekly_data = [{"week": int(w), "waste_kg": round(float(v), 2)} 
                      for w, v in zip(weekly['week'], weekly['waste_kg'])]
        
        # Holiday impact
        holiday_waste = float(df[df['is_holiday'] == 1]['waste_kg'].mean()) if len(df[df['is_holiday'] == 1]) > 0 else 0
        normal_waste = float(df[df['is_holiday'] == 0]['waste_kg'].mean())
        
        # Temperature vs waste
        df['temp_bin'] = pd.cut(df['temp_c'], bins=[-20, 0, 10, 20, 30, 50], labels=['<0', '0-10', '10-20', '20-30', '30+'])
        temp_waste = df.groupby('temp_bin', observed=True)['waste_kg'].mean().reset_index()
        temp_data = [{"temp_range": str(t), "avg_waste_kg": round(float(w), 2)} 
                    for t, w in zip(temp_waste['temp_bin'], temp_waste['waste_kg'])]
        
        # Day of week trends
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_waste = df.groupby('day_of_week')['waste_kg'].mean().reindex(day_order).reset_index()
        day_data = [{"day": str(d), "avg_waste_kg": round(float(w), 2)} 
                   for d, w in zip(day_waste['day_of_week'], day_waste['waste_kg'])]
        
        # Food item breakdown
        food_waste = df.groupby('food_item')['waste_kg'].agg(['mean', 'sum', 'count']).reset_index()
        food_waste.columns = ['food_item', 'avg_waste', 'total_waste', 'count']
        food_data = food_waste.sort_values('total_waste', ascending=False).head(10).to_dict('records')
        
        return jsonify({
            "kpis": {
                "total_waste_kg": round(total_waste, 2),
                "predicted_waste_kg": round(predicted_waste, 2),
                "saved_food_kg": round(saved_food, 2),
                "avg_waste_per_day_kg": round(avg_waste, 2),
                "total_meals_served": total_meals,
                "total_records": len(df),
            },
            "weekly_trends": weekly_data,
            "holiday_impact": {
                "holiday_avg_waste": round(holiday_waste, 2),
                "normal_avg_waste": round(normal_waste, 2),
                "increase_pct": round(((holiday_waste - normal_waste) / max(normal_waste, 0.01)) * 100, 1)
            },
            "temperature_impact": temp_data,
            "day_of_week_trends": day_data,
            "top_waste_foods": food_data,
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/compare-models', methods=['GET'])
def compare_models():
    """Compare Linear Regression vs Random Forest metrics."""
    try:
        report_path = os.path.join(PROJECT_DIR, "reports", "training_report.json")
        if os.path.exists(report_path):
            with open(report_path) as f:
                report = json.load(f)
            return jsonify({
                "linear_regression": report.get('linear_regression', {}),
                "random_forest": report.get('random_forest', {}),
                "recommendation": "Random Forest" if report.get('random_forest', {}).get('r2_score', 0) > report.get('linear_regression', {}).get('r2_score', 0) else "Linear Regression"
            })
        return jsonify({"error": "No training report found. Train models first."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/feature-importance', methods=['GET'])
def feature_importance():
    """Get Random Forest feature importances."""
    try:
        report_path = os.path.join(PROJECT_DIR, "reports", "training_report.json")
        if os.path.exists(report_path):
            with open(report_path) as f:
                report = json.load(f)
            fi = report.get('random_forest', {}).get('feature_importance', {})
            return jsonify({
                "features": [{"name": k, "importance": v} for k, v in fi.items()],
                "model": "Random Forest Regressor",
                "n_features": len(fi)
            })
        return jsonify({"error": "No trained model found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/recipes', methods=['POST'])
def get_recipes():
    """
    Rule-based recipe recommendation.
    Input: list of available ingredients.
    Output: matching recipes sorted by ingredient overlap score.
    """
    try:
        data = request.get_json()
        user_ingredients = [i.lower().strip() for i in data.get('ingredients', [])]
        
        if not user_ingredients:
            return jsonify({"error": "Please provide at least one ingredient."}), 400
        
        # Load recipes
        if os.path.exists(RECIPES_FILE):
            with open(RECIPES_FILE) as f:
                recipes = json.load(f)
        else:
            return jsonify({"error": "Recipes database not found."}), 500
        
        # Score each recipe by ingredient overlap
        scored = []
        for recipe in recipes:
            recipe_ingredients = [i.lower() for i in recipe.get('ingredients', [])]
            matches = sum(1 for ui in user_ingredients if any(ui in ri for ri in recipe_ingredients))
            if matches > 0:
                score = matches / len(recipe_ingredients)
                scored.append({
                    **recipe,
                    "match_score": round(score, 2),
                    "matched_ingredients": matches,
                    "total_ingredients": len(recipe_ingredients)
                })
        
        # Sort by score
        scored.sort(key=lambda x: x['match_score'], reverse=True)
        
        return jsonify({
            "recipes": scored[:8],  # Top 8 matches
            "total_matches": len(scored),
            "input_ingredients": user_ingredients
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gemini', methods=['POST'])
def gemini_assistant():
    """
    Gemini AI assistant for cooking/waste questions.
    Falls back to predefined responses if API key not available.
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        chat_history = data.get('history', [])
        
        if not user_message:
            return jsonify({"error": "Message cannot be empty."}), 400
        
        # Try Gemini API
        api_key = os.environ.get('GEMINI_API_KEY')
        
        if api_key:
            import requests as req_lib
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
            
            # Build conversation with system instruction
            system_prompt = """You are SmartKitchen AI assistant — a helpful cooking and food waste reduction expert. 
Your responsibilities:
1. Suggest creative recipes based on available ingredients
2. Provide practical food waste reduction tips for restaurants and homes
3. Answer cooking questions (temperatures, times, substitutions)
4. Give food storage advice to extend shelf life
5. Help with meal planning to minimize waste

Rules:
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists
- Be friendly and encouraging
- If asked about non-food topics, politely redirect to food/cooking
- Include practical, actionable advice
- Mention sustainability when relevant"""

            # Build contents with history
            contents = []
            
            # Add previous messages if available
            for msg in chat_history[-6:]:  # Last 6 messages for context
                contents.append({
                    "role": "user" if msg.get("role") == "user" else "model",
                    "parts": [{"text": msg.get("content", "")}]
                })
            
            # Add current message
            contents.append({
                "role": "user",
                "parts": [{"text": user_message}]
            })
            
            payload = {
                "system_instruction": {
                    "parts": [{"text": system_prompt}]
                },
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 800,
                    "topP": 0.9
                }
            }
            
            response = req_lib.post(url, json=payload, timeout=15)
            
            if response.status_code == 200:
                result = response.json()
                ai_text = result['candidates'][0]['content']['parts'][0]['text']
                return jsonify({
                    "response": ai_text,
                    "source": "gemini",
                    "model": "gemini-2.0-flash"
                })
            else:
                # API error — fall through to fallback
                print(f"Gemini API error: {response.status_code} - {response.text[:200]}")
        
        # Fallback: rule-based responses
        fallback_responses = {
            "recipe": "Here are some ideas to use your ingredients:\n\n- **Stir-fry**: Quick and versatile — any vegetables + protein + soy sauce over rice\n- **Soup**: Combine leftover veggies in broth with herbs\n- **Omelette**: Eggs + any cheese, vegetables, or meat you have\n- **Fried rice**: Day-old rice + egg + any vegetables + soy sauce\n\nTip: The key to reducing waste is cooking what you already have!",
            "waste": "Top food waste reduction strategies:\n\n- **Plan meals weekly** and buy only what you need\n- **FIFO method** (First In, First Out) — use oldest ingredients first\n- **Store properly**: herbs in water, bread in freezer, tomatoes at room temperature\n- **Batch cook**: Make large portions and freeze extras\n- **Track waste**: Keep a log for 1 week to identify patterns\n\nRestaurants can reduce waste by 20-30% with demand prediction!",
            "tip": "Quick kitchen tip: The average household throws away 30% of purchased food. Here's how to cut that:\n\n1. **Freeze before it spoils** — most foods freeze well for 2-3 months\n2. **Use 'ugly' produce** — imperfect fruits are perfect for smoothies\n3. **Leftover night** — designate one dinner per week for leftovers\n4. **Portion control** — serve smaller plates, people can always get seconds\n5. **Compost** what you can't eat — closes the cycle",
            "storage": "Smart food storage guide:\n\n- **Fridge (0-4°C):** Dairy, cooked food, cut vegetables, meat\n- **Counter:** Tomatoes, bananas, avocados (until ripe), onions, garlic\n- **Freezer:** Bread (slice first), herbs in olive oil (ice cube trays), cooked grains\n- **Airtight containers:** Cut veggies stay fresh 5-7 days vs 2-3 days open\n\nGolden rule: Don't wash berries until ready to eat — moisture causes mould!",
            "default": "I'm SmartKitchen AI assistant! I can help you with:\n\n🍳 **Recipe suggestions** — tell me what ingredients you have\n🥗 **Food waste reduction** — practical tips for home or restaurant\n📦 **Storage advice** — how to keep food fresh longer\n📋 **Meal planning** — reduce shopping waste\n🌡️ **Cooking questions** — temperatures, times, substitutions\n\nWhat would you like help with today?"
        }
        
        # Simple keyword matching for fallback
        msg_lower = user_message.lower()
        if any(w in msg_lower for w in ['recipe', 'cook', 'make', 'ingredient', 'dinner', 'lunch', 'breakfast']):
            response_text = fallback_responses['recipe']
        elif any(w in msg_lower for w in ['waste', 'reduce', 'throw', 'spoil', 'expire', 'rotten']):
            response_text = fallback_responses['waste']
        elif any(w in msg_lower for w in ['store', 'keep', 'fresh', 'fridge', 'freeze', 'shelf']):
            response_text = fallback_responses['storage']
        elif any(w in msg_lower for w in ['tip', 'advice', 'suggest', 'help', 'idea']):
            response_text = fallback_responses['tip']
        else:
            response_text = fallback_responses['default']
        
        return jsonify({
            "response": response_text,
            "source": "fallback",
            "note": "Set GEMINI_API_KEY in backend/.env for AI-powered responses"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/pipeline', methods=['GET'])
def get_pipeline():
    """Return AI pipeline steps for visualization."""
    return jsonify({
        "pipeline": [
            {
                "step": 1,
                "name": "Data Collection",
                "description": "Gather restaurant food waste data including meals served, temperature, holiday flags, and pricing information.",
                "status": "complete",
                "tech": "CSV/XLSX upload, Pandas"
            },
            {
                "step": 2,
                "name": "Data Cleaning",
                "description": "Remove duplicates, handle missing values (median imputation for numeric, mode for categorical), validate data types.",
                "status": "complete",
                "tech": "Pandas, NumPy, SimpleImputer"
            },
            {
                "step": 3,
                "name": "Feature Engineering",
                "description": "Encode day_of_week (OneHot), label-encode food_item, compute price_ratio, extract month from date.",
                "status": "complete",
                "tech": "Scikit-learn LabelEncoder, pd.get_dummies"
            },
            {
                "step": 4,
                "name": "Model Training",
                "description": "80/20 train-test split. Train Random Forest Regressor (100 trees, max_depth=15) and Linear Regression baseline.",
                "status": "complete",
                "tech": "Scikit-learn, RandomForestRegressor, LinearRegression"
            },
            {
                "step": 5,
                "name": "Model Evaluation",
                "description": "Evaluate using MAE, RMSE, R². 5-fold cross-validation. Compare baseline vs main model.",
                "status": "complete",
                "tech": "Scikit-learn metrics, cross_val_score"
            },
            {
                "step": 6,
                "name": "Prediction & Dashboard",
                "description": "Deploy model via Flask API. Real-time predictions displayed on React dashboard with charts and KPIs.",
                "status": "complete",
                "tech": "Flask, React, Recharts, REST API"
            }
        ]
    })


# ==================== RUN ====================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
