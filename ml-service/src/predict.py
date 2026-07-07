"""
Fonction de prediction de Difficulty Level a partir de Skills + Description,
utilisant les artefacts sauvegardes en Phase 1 (vectorizer/encoders) et
Phase 5 (modele champion). Concue pour etre importee telle quelle par le
microservice FastAPI de la Phase 6.
"""
import joblib
import numpy as np
import scipy.sparse as sp
from pathlib import Path
from functools import lru_cache

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"


@lru_cache(maxsize=1)
def _load_artifacts():
    model = joblib.load(MODELS_DIR / "champion_model.joblib")
    tfidf = joblib.load(MODELS_DIR / "tfidf_vectorizer.joblib")
    university_encoder = joblib.load(MODELS_DIR / "university_encoder.joblib")
    category_encoder = joblib.load(MODELS_DIR / "category_encoder.joblib")
    label_encoder = joblib.load(MODELS_DIR / "label_encoder.joblib")
    return model, tfidf, university_encoder, category_encoder, label_encoder


def predict_difficulty(skills_text: str, description_text: str) -> dict:
    """
    Predit le niveau de difficulte d'un cours a partir de ses competences
    et de sa description.

    A l'inference, University et Category ne sont generalement pas connues
    (le module Suivi & IA n'a que Skills/Description) -> on utilise les
    categories neutres "Other" (University) / "Unknown" (Category), vues
    lors de l'entrainement (OneHotEncoder(handle_unknown="ignore")) donc
    sans risque d'erreur, mais sans biais lie a une universite specifique.

    Retourne un dict {difficulty, confidence, probabilities}.
    """
    model, tfidf, university_encoder, category_encoder, label_encoder = _load_artifacts()

    text = f"{skills_text or ''} {description_text or ''}".strip()
    X_text = tfidf.transform([text])
    X_univ = university_encoder.transform([["Other"]])
    X_cat = category_encoder.transform([["Unknown"]])

    X = sp.hstack([X_text, X_univ, X_cat], format="csr")

    proba = model.predict_proba(X)[0]
    pred_idx = int(np.argmax(proba))
    difficulty = label_encoder.inverse_transform([pred_idx])[0]

    return {
        "difficulty": difficulty,
        "confidence": float(proba[pred_idx]),
        "probabilities": {
            cls: float(p) for cls, p in zip(label_encoder.classes_, proba)
        },
    }


if __name__ == "__main__":
    examples = [
        (
            "python programming basics variables loops functions",
            "This introductory course teaches the fundamentals of Python programming "
            "for absolute beginners, no prior experience required.",
        ),
        (
            "deep learning neural networks optimization research convolutional "
            "transformers advanced mathematics",
            "This advanced course covers state-of-the-art deep learning architectures, "
            "assuming strong prior knowledge of machine learning and linear algebra.",
        ),
        (
            "data analysis sql statistics business intelligence",
            "This intermediate course builds on basic data skills to teach practical "
            "data analysis techniques for working professionals.",
        ),
    ]

    print("Verification du rechargement des artefacts hors notebook :\n")
    for skills, desc in examples:
        result = predict_difficulty(skills, desc)
        print(f"Skills: {skills[:60]}...")
        print(f"  -> {result['difficulty']} (confiance={result['confidence']:.3f})")
        print(f"  probabilities: {result['probabilities']}\n")
