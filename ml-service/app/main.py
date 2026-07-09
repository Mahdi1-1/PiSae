"""
Microservice FastAPI exposant deux modeles de prediction :
  - POST /predict-difficulty  : niveau de difficulte d'un cours (Coursera)
  - POST /predict-dropout     : risque de decrochage d'un apprenant (OULAD)
  - GET  /health              : health check global
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from src.predict import predict_difficulty, _load_artifacts
from src.predict_dropout import predict_dropout, _load_dropout_artifacts

app = FastAPI(
    title="ml-service",
    description=(
        "Deux modeles de ML :\n"
        "1. Prediction du niveau de difficulte d'un cours (Beginner/Intermediate/Advanced) "
        "a partir de ses competences et description (Coursera dataset).\n"
        "2. Prediction du risque de decrochage d'un apprenant (HIGH/MEDIUM/LOW) "
        "a partir de ses donnees comportementales (OULAD dataset)."
    ),
    version="2.0.0",
)


# ── Modele 1 : Difficulty Level ───────────────────────────────────────────────

class PredictRequest(BaseModel):
    skills: str = Field(..., description="Competences du cours, texte libre.")
    description: str = Field(..., description="Description du cours, texte libre.")


class PredictResponse(BaseModel):
    difficulty: str
    predicted_level: str
    confidence: float
    probabilities: dict[str, float]
    shap_values: dict[str, float]
    top_features: list[dict]


# ── Modele 2 : Dropout Prediction ────────────────────────────────────────────

class DropoutRequest(BaseModel):
    # Features comportementales VLE
    total_clicks:               Optional[float] = Field(0, description="Nombre total de clics sur la plateforme VLE")
    nb_active_days:             Optional[float] = Field(0, description="Nombre de jours avec au moins 1 clic")
    avg_clicks_per_day:         Optional[float] = Field(0, description="Moyenne de clics par jour actif")
    last_active_day:            Optional[float] = Field(0, description="Dernier jour d'activite (relatif au debut du cours)")
    days_before_start_activity: Optional[float] = Field(0, description="Nb jours d'engagement avant le debut officiel")
    click_trend:                Optional[float] = Field(0, description="Pente de regression lineaire des clics hebdomadaires (negatif = declin)")
    nb_resource_types:          Optional[float] = Field(0, description="Diversite des types de ressources consultees")
    # Features evaluations
    nb_assessments_submitted:   Optional[float] = Field(0, description="Nombre d'evaluations soumises")
    avg_score:                  Optional[float] = Field(None, description="Score moyen aux evaluations (0-100)")
    pct_late_submissions:       Optional[float] = Field(0, description="Proportion de soumissions en retard (0-1)")
    first_assessment_score:     Optional[float] = Field(None, description="Score a la premiere evaluation")
    nb_missing_assessments:     Optional[float] = Field(0, description="Nombre d'evaluations non soumises")
    # Features demographiques
    studied_credits:            Optional[float] = Field(60, description="Nombre de credits inscrits")
    num_of_prev_attempts:       Optional[float] = Field(0, description="Nombre de tentatives precedentes au meme module")
    age_band_enc:               Optional[float] = Field(1, description="Tranche d'age : 0=0-35, 1=35-55, 2=55+")
    highest_education_enc:      Optional[float] = Field(2, description="Niveau d'education : 0=aucun ... 4=post-grad")
    imd_band_enc:               Optional[float] = Field(5, description="Indice de defavorisation : 0=plus defavorise, 9=moins defavorise")
    gender_enc:                 Optional[float] = Field(0, description="Genre : 0=F, 1=M")
    disability_enc:             Optional[float] = Field(0, description="Handicap declare : 0=non, 1=oui")
    date_registration:          Optional[float] = Field(-30, description="Jours avant/apres le debut du cours a l'inscription (negatif = en avance)")


class TopRiskFactor(BaseModel):
    factor: str
    impact: float
    direction: str
    raw_value: float


class DropoutResponse(BaseModel):
    will_dropout: bool
    dropout_probability: float
    risk_level: str  # HIGH / MEDIUM / LOW
    shap_values: dict[str, float]
    top_risk_factors: list[TopRiskFactor]


# ── Startup ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
def load_models_at_startup():
    _load_artifacts()
    _load_dropout_artifacts()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "models": ["difficulty", "dropout"]}


@app.post("/predict-difficulty", response_model=PredictResponse)
def predict_difficulty_endpoint(payload: PredictRequest):
    if not payload.skills.strip() and not payload.description.strip():
        raise HTTPException(
            status_code=422,
            detail="skills et description ne peuvent pas etre vides tous les deux."
        )
    return predict_difficulty(payload.skills, payload.description)


@app.post("/predict-dropout", response_model=DropoutResponse)
def predict_dropout_endpoint(payload: DropoutRequest):
    data = payload.model_dump()
    # Imputer avg_score et first_assessment_score si non fournis
    if data.get("avg_score") is None:
        data["avg_score"] = 50.0
    if data.get("first_assessment_score") is None:
        data["first_assessment_score"] = 50.0
    return predict_dropout(data)


@app.get("/predict-dropout/health")
def dropout_model_health():
    try:
        _load_dropout_artifacts()
        return {"status": "ok", "model": "XGBoost", "dataset": "OULAD"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
