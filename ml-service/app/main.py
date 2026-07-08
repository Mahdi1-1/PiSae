"""
Microservice FastAPI exposant le modele de prediction de Difficulty Level
(entraine en Phase 1-5) pour consommation par suivi-service (Spring Boot).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from src.predict import predict_difficulty, _load_artifacts

app = FastAPI(
    title="ml-service",
    description="Prediction du niveau de difficulte d'un cours (Beginner / "
    "Intermediate / Advanced) a partir de ses competences et de sa description.",
    version="1.0.0",
)


class PredictRequest(BaseModel):
    skills: str = Field(..., description="Competences du cours, texte libre.")
    description: str = Field(..., description="Description du cours, texte libre.")


class PredictResponse(BaseModel):
    difficulty: str
    confidence: float
    probabilities: dict[str, float]


@app.on_event("startup")
def load_model_at_startup():
    # Force le chargement des artefacts au demarrage pour echouer vite si
    # un fichier de modele est manquant, plutot qu'a la premiere requete.
    _load_artifacts()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict-difficulty", response_model=PredictResponse)
def predict_difficulty_endpoint(payload: PredictRequest):
    if not payload.skills.strip() and not payload.description.strip():
        raise HTTPException(
            status_code=422, detail="skills et description ne peuvent pas etre vides tous les deux."
        )
    result = predict_difficulty(payload.skills, payload.description)
    return result
