"""
Prediction de decrochage (OULAD) — charge par ml-service au demarrage.
Entree  : features comportementales de l'apprenant
Sortie  : will_dropout, dropout_probability, risk_level, shap_values, top_risk_factors
"""
import joblib
import numpy as np
import shap
from functools import lru_cache
from pathlib import Path

ROOT       = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"

FEATURE_LABELS = {
    "studied_credits":            "Crédits étudiés",
    "num_of_prev_attempts":       "Nb tentatives précédentes",
    "age_band_enc":               "Tranche d'âge",
    "highest_education_enc":      "Niveau d'éducation",
    "imd_band_enc":               "Indice de défavorisation",
    "gender_enc":                 "Genre",
    "disability_enc":             "Handicap",
    "total_clicks":               "Total clics VLE",
    "nb_active_days":             "Jours actifs",
    "avg_clicks_per_day":         "Clics/jour moyen",
    "last_active_day":            "Dernier jour actif",
    "days_before_start_activity": "Engagement précoce (jours avant le début)",
    "click_trend":                "Tendance des clics (pente hebdomadaire)",
    "nb_resource_types":          "Diversité des ressources consultées",
    "nb_assessments_submitted":   "Évaluations soumises",
    "avg_score":                  "Score moyen aux évaluations",
    "pct_late_submissions":       "% soumissions en retard",
    "first_assessment_score":     "Score à la 1ère évaluation",
    "nb_missing_assessments":     "Évaluations non soumises",
    "date_registration":          "Délai d'inscription (jours avant le début)",
}


@lru_cache(maxsize=1)
def _load_dropout_artifacts():
    model        = joblib.load(MODELS_DIR / "oulad_model_XGBoost.joblib")
    scaler       = joblib.load(MODELS_DIR / "oulad_scaler.joblib")
    feature_cols = joblib.load(MODELS_DIR / "oulad_feature_cols.joblib")
    # tree_path_dependent evite l'erreur XGBoost "categorical split not supported"
    explainer    = shap.TreeExplainer(model, feature_perturbation="tree_path_dependent")
    return model, scaler, feature_cols, explainer


def _risk_level(proba: float) -> str:
    if proba >= 0.70:
        return "HIGH"
    if proba >= 0.40:
        return "MEDIUM"
    return "LOW"


def predict_dropout(engagement_data: dict) -> dict:
    """
    Predit le risque de decrochage d'un apprenant.

    engagement_data : dict avec les cles correspondant aux feature_cols OULAD.
    Les cles manquantes sont imputees a 0 (apprenant sans donnee = inactif).
    """
    model, scaler, feature_cols, explainer = _load_dropout_artifacts()

    # Construction du vecteur de features dans le bon ordre
    X_raw = np.array([[engagement_data.get(col, 0.0) for col in feature_cols]])
    X_scaled = scaler.transform(X_raw)

    proba = model.predict_proba(X_scaled)[0]
    p_dropout = float(proba[1])
    will_dropout = p_dropout >= 0.5

    # Valeurs SHAP pour cet apprenant
    shap_vals = explainer.shap_values(X_scaled)[0]  # shape (n_features,)

    # Construction shap_values dict (features significatives uniquement)
    shap_dict = {}
    top_factors = []
    sorted_idx = np.argsort(np.abs(shap_vals))[::-1]

    for idx in sorted_idx[:10]:
        col   = feature_cols[idx]
        val   = float(shap_vals[idx])
        label = FEATURE_LABELS.get(col, col)
        shap_dict[col] = val
        top_factors.append({
            "factor": label,
            "impact": round(abs(val), 4),
            "direction": "positive" if val > 0 else "negative",
            "raw_value": float(X_raw[0, idx]),
        })

    return {
        "will_dropout": will_dropout,
        "dropout_probability": round(p_dropout, 4),
        "risk_level": _risk_level(p_dropout),
        "shap_values": {k: round(v, 4) for k, v in shap_dict.items()},
        "top_risk_factors": top_factors,
    }
