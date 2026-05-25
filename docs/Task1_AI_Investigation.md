# Task 1: AI Investigation (Learning Aim A)

## SmartKitchen AI — Artificial Intelligence Research Report

**Student:** [Your Name]  
**Unit:** 21 — Introduction to Artificial Intelligence  
**Date:** May 2026

---

## A1: Definition of AI and Fundamental Concepts

### What is Artificial Intelligence?

Artificial Intelligence (AI) is the simulation of human intelligence by computer systems. It encompasses the ability of machines to perform tasks that typically require human cognitive functions such as learning, reasoning, problem-solving, perception, and decision-making.

AI can be broadly divided into two categories:

| Type | Description | Example |
|------|-------------|---------|
| **Weak AI (Narrow AI)** | Designed to perform a specific task. Cannot generalise beyond its training domain. | Siri, spam filters, recommendation engines |
| **Strong AI (General AI)** | Hypothetical AI with human-level reasoning across all domains. Does not exist yet. | Theoretical — no real-world examples |

### Is SmartKitchen AI "Weak" or "Strong" AI?

**SmartKitchen AI is an example of Weak AI (Narrow AI)** because:
- It is trained **only** to predict food waste in restaurants — it cannot generalise to other tasks
- It uses a specific mathematical model (Random Forest Regression) with fixed input features
- It does not "understand" food or waste; it identifies statistical patterns in numerical data
- The recipe recommendation system uses rule-based logic, not true intelligence

### AI Type Classification for SmartKitchen AI

| Classification | Our Choice | Justification |
|----------------|-----------|---------------|
| **AI Type** | Limited Memory AI | The model learns from historical data (past waste records) to make future predictions. It does not retain new information after training unless retrained. |
| **AI Subset** | Machine Learning (Supervised Learning) | We use labelled training data (waste_kg is the known target) to train a regression model. |
| **Specific Technique** | Random Forest Regressor + Linear Regression | Ensemble of 100 decision trees for non-linear pattern recognition, with linear regression as baseline. |

### Additional AI Concepts Used

1. **Rule-Based Systems** — Recipe recommendations use if-then logic (ingredient matching)
2. **Generative AI** — Gemini API provides natural language cooking assistance (bonus feature)
3. **Data Pipeline** — Automated preprocessing (imputation, encoding, feature engineering)

---

## A1: AI Types and Subsets

### The Four Types of AI (by capability):

1. **Reactive Machines** — No memory, responds to current input only (e.g., Deep Blue chess)
2. **Limited Memory** — Uses historical data for predictions (e.g., **SmartKitchen AI**, self-driving cars)
3. **Theory of Mind** — Understands emotions and beliefs (research stage only)
4. **Self-Aware** — Has consciousness (theoretical, does not exist)

### Machine Learning Subsets:

| Subset | How it works | SmartKitchen Use |
|--------|-------------|------------------|
| **Supervised Learning** | Learns from labelled data (input→output pairs) | ✅ Main model — predicts waste_kg from features |
| **Unsupervised Learning** | Finds hidden patterns without labels | ❌ Not used |
| **Reinforcement Learning** | Learns through trial and error / rewards | ❌ Not used |

---

## A2: Ethical and Legal Implications

### Data Privacy and GDPR Compliance

SmartKitchen AI processes **restaurant operational data**, not personal data. However:

| Concern | Risk Level | Mitigation |
|---------|-----------|------------|
| **Personal data** | Low | No customer names, addresses, or PII collected. Only aggregate metrics (meals_served, waste_kg). |
| **Employee data** | Low | No individual staff performance tracked. |
| **GDPR Article 5** | Compliant | Data minimisation — we only collect what is necessary for prediction. |
| **Data retention** | Medium | Data is stored locally (SQLite). In production, we would implement retention policies. |
| **Right to erasure** | N/A | No personal data to erase. |

### Ethical Considerations

1. **Algorithmic Bias:** If training data only includes one type of restaurant (e.g., Central Asian cuisine), predictions may be inaccurate for others. **Mitigation:** Include diverse food categories in dataset.

2. **Job Displacement:** AI predictions might reduce the need for experienced kitchen managers. **Mitigation:** Position AI as an assistant tool, not a replacement.

3. **Environmental Claims:** Must not overstate waste reduction without evidence. **Mitigation:** Report actual measured savings vs predictions.

4. **Data Accuracy:** Wrong predictions could lead to under-preparation (customer dissatisfaction) or over-preparation (more waste). **Mitigation:** Model confidence indicators and human oversight.

5. **Transparency:** Restaurant owners should understand how predictions are made. **Mitigation:** Feature importance visualisation explains model decisions.

---

## A2: AI Development Pipeline

### SmartKitchen AI Pipeline:

```
[1] DATA COLLECTION
    ↓
[2] DATA CLEANING (remove duplicates, handle missing values)
    ↓
[3] FEATURE ENGINEERING (encoding, new features)
    ↓
[4] MODEL TRAINING (80/20 split, Random Forest + Linear Regression)
    ↓
[5] MODEL EVALUATION (MAE, RMSE, R², cross-validation)
    ↓
[6] DEPLOYMENT (Flask API → React Dashboard)
```

### Detailed Pipeline Steps:

| Step | Input | Process | Output | Tool |
|------|-------|---------|--------|------|
| 1. Data Collection | Raw CSV/XLSX | Restaurant records food waste daily | 1,200+ rows with 11 columns | Manual / CSV |
| 2. Data Cleaning | Raw dataset | Remove duplicates (3%), impute missing (7%) with median | Clean dataset | Pandas |
| 3. Feature Engineering | Clean data | OneHot encode days, label encode foods, create price_ratio | 17 ML-ready features | Scikit-learn |
| 4. Model Training | Features (X) + Target (y) | Train-test split → fit models | Trained .joblib models | Scikit-learn |
| 5. Evaluation | Test predictions vs actual | Calculate MAE, RMSE, R² | Performance report | Scikit-learn metrics |
| 6. Deployment | Trained model + API | REST endpoints serve predictions | Live dashboard | Flask + React |

---

## Impact of AI on Different Industries

### A.P1/P2: Benefits, Risks, and Drawbacks

| Industry | AI Application | Benefits | Risks/Drawbacks |
|----------|---------------|----------|-----------------|
| **Food & Hospitality** | Waste prediction, demand forecasting | Reduces waste 15-30%, saves costs, better stock management | Initial investment, requires quality data, may not account for unpredictable events |
| **Healthcare** | Diagnosis, drug discovery | Faster diagnosis, personalised treatment | Liability issues, data privacy (HIPAA), algorithmic bias in patient populations |
| **Finance** | Fraud detection, trading | Real-time threat detection, faster transactions | Flash crashes, job displacement, regulatory challenges |
| **Transportation** | Autonomous vehicles, route optimisation | Fewer accidents, fuel efficiency | Safety incidents, ethical dilemmas (trolley problem), insurance liability |
| **Education** | Personalised learning, automated grading | Individual pacing, teacher time savings | Data privacy of minors, reduced human interaction, digital divide |
| **Retail** | Recommendation engines, inventory | Higher sales, reduced overstock | Filter bubbles, privacy concerns, market manipulation |

### A.M1: Analysis of Benefits and Drawbacks

**Key Tension:** AI systems offer significant efficiency gains but raise concerns about:
1. **Accountability** — Who is responsible when AI makes wrong decisions?
2. **Transparency** — "Black box" models are hard to explain
3. **Equity** — Biased training data leads to biased outputs
4. **Employment** — Automation displaces routine jobs while creating new technical roles

### A.D1: Evaluation of AI Impact

The impact of AI varies significantly by industry maturity:
- **High-impact, low-risk:** Food waste prediction (operational improvement with minimal personal data risk)
- **High-impact, high-risk:** Healthcare diagnosis (life-critical with severe bias consequences)
- **Medium-impact, medium-risk:** Financial trading (efficiency gains but systemic risk)

SmartKitchen AI specifically targets a **low-risk, high-value** application — reducing food waste without collecting personal data, making it an ideal entry point for AI adoption in small businesses.

---

## References

1. Russell, S. and Norvig, P. (2021) *Artificial Intelligence: A Modern Approach*. 4th ed. Pearson.
2. Evans, J. (2016) *Business Analytics*. 2nd ed. Pearson.
3. UK Government (2023) *AI Regulation White Paper*. Available at: gov.uk
4. Information Commissioner's Office (2024) *Guide to the UK GDPR*. ico.org.uk
5. Scikit-learn Documentation (2024) *RandomForestRegressor*. scikit-learn.org
