"""
OULAD - Phase 7 : Finalisation et vérification des artefacts de production
"""
import joblib
import numpy as np
import shap
from pathlib import Path

DATA_DIR   = Path(__file__).parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"


def verify_and_finalize():
    print("OULAD — Phase 7 : Finalisation des artefacts\n")

    required = [
        MODELS_DIR / "oulad_model_XGBoost.joblib",
        MODELS_DIR / "oulad_scaler.joblib",
        MODELS_DIR / "oulad_feature_cols.joblib",
    ]
    for p in required:
        if not p.exists():
            raise FileNotFoundError(f"Artefact manquant : {p}")
        size_kb = p.stat().st_size / 1024
        print(f"  ✓ {p.name:40s} {size_kb:>8.1f} KB")

    # Test rapide : charger et prédire
    print("\nTest de chargement et prédiction...")
    model        = joblib.load(MODELS_DIR / "oulad_model_XGBoost.joblib")
    scaler       = joblib.load(MODELS_DIR / "oulad_scaler.joblib")
    feature_cols = joblib.load(MODELS_DIR / "oulad_feature_cols.joblib")

    # Vecteur fictif (apprenant inactif = décrocheur probable)
    sample = np.zeros((1, len(feature_cols)))
    sample_scaled = scaler.transform(sample)
    proba = model.predict_proba(sample_scaled)[0]
    pred  = int(np.argmax(proba))
    label = "Withdrawn" if pred == 1 else "Non-withdrawn"
    print(f"  → Apprenant inactif : {label} (P_dropout={proba[1]:.3f})")

    # Vecteur actif (bien engagé = non-décrocheur probable)
    idx_last_active   = feature_cols.index("last_active_day")
    idx_nb_submitted  = feature_cols.index("nb_assessments_submitted")
    idx_nb_active     = feature_cols.index("nb_active_days")
    sample_active = np.zeros((1, len(feature_cols)))
    sample_active[0, idx_last_active]  = 150
    sample_active[0, idx_nb_submitted] = 8
    sample_active[0, idx_nb_active]    = 120
    sample_active_scaled = scaler.transform(sample_active)
    proba2 = model.predict_proba(sample_active_scaled)[0]
    pred2  = int(np.argmax(proba2))
    label2 = "Withdrawn" if pred2 == 1 else "Non-withdrawn"
    print(f"  → Apprenant actif   : {label2} (P_dropout={proba2[1]:.3f})")

    # Pré-calculer explainer SHAP et background pour éviter le cold-start
    print("\nPré-calcul de l'explainer SHAP (TreeExplainer)...")
    X_test = np.load(DATA_DIR / "oulad_X_test.npy")
    background = shap.sample(X_test, 100, random_state=42)
    explainer = shap.TreeExplainer(model, background, feature_perturbation="tree_path_dependent")
    joblib.dump(explainer, MODELS_DIR / "oulad_shap_explainer.joblib")
    print(f"  ✓ oulad_shap_explainer.joblib sauvegardé")

    print("\n✓ Tous les artefacts sont valides et prêts pour la production.")
    print(f"  Artefacts de production :")
    for p in sorted(MODELS_DIR.glob("oulad_*.joblib")):
        print(f"    {p.name}")


if __name__ == "__main__":
    verify_and_finalize()
