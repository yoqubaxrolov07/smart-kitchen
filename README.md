# 🍽️ SmartKitchen AI

> AI-powered food waste reduction platform for restaurants and households.

**BTEC Unit 21: Introduction to Artificial Intelligence**

![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.6-orange)
![Flask](https://img.shields.io/badge/Flask-3.1-green)

---

## 📖 Overview

SmartKitchen AI combines **machine learning**, **rule-based logic**, and **generative AI** to help restaurants reduce food waste through predictive analytics and smart decision-making.

### Two Modes:

| Mode | Target User | Features |
|------|-------------|----------|
| 🏢 **Business** | Restaurant managers | Dashboard, waste prediction, CSV upload, model comparison, AI pipeline |
| 🏠 **Personal** | Home cooks | Ingredient-based recipe finder, AI cooking assistant |

---

## 🧠 AI Strategy

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Main Prediction | Random Forest Regressor | Predict daily food waste (kg) |
| Baseline | Linear Regression | Comparison benchmark |
| Recipe Matching | Rule-based (JSON) | Match ingredients → recipes |
| AI Assistant | Gemini API (optional) | Cooking help & tips |

---

## 🚀 Quick Start

### Backend (Flask API)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Train models (first time)
cd backend/ml
python train_model.py

# Start API server
cd backend
python app.py
# → API running at http://localhost:5000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
# → App running at http://localhost:5173
```

---

## 📁 Project Structure

```
smart-kitchen/
├── README.md
├── requirements.txt
├── .gitignore
│
├── data/
│   ├── raw/smartkitchen_ai_dataset.csv    ← Original dataset (with imperfections)
│   └── processed/smartkitchen_clean.csv   ← Cleaned version
│
├── backend/
│   ├── app.py                             ← Flask API (all endpoints)
│   ├── ml/
│   │   ├── preprocessing.py              ← Data cleaning pipeline
│   │   └── train_model.py                ← Model training script
│   └── data/recipes.json                  ← 45 recipes database
│
├── frontend/
│   ├── src/
│   │   ├── pages/                         ← React page components
│   │   ├── components/                    ← Shared UI components
│   │   └── api/client.ts                  ← API client functions
│   └── package.json
│
├── models/
│   ├── random_forest.joblib              ← Trained RF model
│   └── linear_regression.joblib          ← Trained LR model
│
├── notebooks/
│   ├── 01_eda.ipynb                       ← Exploratory Data Analysis
│   ├── 02_data_cleansing.ipynb           ← Cleaning process (screenshot evidence)
│   └── 03_model_training.ipynb           ← Training + evaluation
│
├── docs/
│   ├── Task1_AI_Investigation.md          ← Learning Aim A report
│   ├── Task2_Data_Report.md              ← Learning Aim B report
│   └── Task3_Model_Report.md             ← Learning Aim C report
│
├── reports/
│   ├── training_report.json              ← Auto-generated metrics
│   └── figures/                           ← Charts and plots
│
└── scripts/
    └── generate_dataset.py               ← Dataset generation script
```

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/stats` | GET | Dashboard statistics |
| `/api/predict` | POST | Predict waste for given inputs |
| `/api/train` | POST | Retrain models |
| `/api/upload` | POST | Upload CSV for analysis |
| `/api/compare-models` | GET | Linear vs Random Forest metrics |
| `/api/feature-importance` | GET | Feature importance scores |
| `/api/recipes` | POST | Get recipe suggestions |
| `/api/gemini` | POST | AI assistant chat |
| `/api/pipeline` | GET | AI pipeline steps |

---

## 📈 Model Performance

| Model | MAE (kg) | RMSE (kg) | R² Score |
|-------|----------|-----------|----------|
| Linear Regression | 0.987 | 1.424 | 0.497 |
| Random Forest | 1.044 | 1.477 | 0.459 |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, TailwindCSS, Recharts
- **Backend:** Python 3.11, Flask, Flask-CORS
- **ML:** Scikit-learn, Pandas, NumPy, Matplotlib
- **AI:** Gemini API (optional)
- **Database:** SQLite (optional for logs)

---

## 📝 BTEC Evidence Mapping

| Criteria | Evidence Location |
|----------|------------------|
| A.P1, A.P2, A.M1, A.D1 | `docs/Task1_AI_Investigation.md` |
| B.P3, B.P4, B.M2, B.D2 | `docs/Task2_Data_Report.md` + `notebooks/01_eda.ipynb` + `notebooks/02_data_cleansing.ipynb` |
| C.P5, C.M3, C.D3 | `docs/Task3_Model_Report.md` + `notebooks/03_model_training.ipynb` + Backend code |

---

## 👤 Author

**[Your Name]** — BTEC International Level 3 Information Technology

---

*Built with ❤️ and AI*
