"""
Phase 2 - Entrainement et comparaison de 4 algorithmes de classification
pour predire Difficulty Level (Beginner / Intermediate / Advanced).

Modeles:
  - Logistic Regression (baseline interpretable)
  - Random Forest
  - Gradient Boosting (LightGBM si dispo, sinon GradientBoostingClassifier sklearn)
  - Multinomial Naive Bayes (4e point de comparaison, rapide et adapte au texte TF-IDF)

Pour chaque modele: entrainement + validation croisee 5-fold (sur train, macro F1)
+ predictions sur test. Les predictions/probas sont sauvegardees pour la Phase 3.
"""
import json
import time
import joblib
import numpy as np
import scipy.sparse as sp
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import StratifiedKFold, cross_val_score

try:
    from lightgbm import LGBMClassifier

    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"

X_train = sp.load_npz(DATA_DIR / "X_train.npz")
X_test = sp.load_npz(DATA_DIR / "X_test.npz")
y_train = np.load(DATA_DIR / "y_train.npy")
y_test = np.load(DATA_DIR / "y_test.npy")

label_encoder = joblib.load(MODELS_DIR / "label_encoder.joblib")
print(f"Classes: {list(label_encoder.classes_)}")
print(f"Train: {X_train.shape}, Test: {X_test.shape}")

# MultinomialNB exige des features non-negatives : notre matrice est deja
# non-negative (TF-IDF + one-hot), donc utilisable telle quelle.
models = {
    "LogisticRegression": LogisticRegression(
        max_iter=2000, class_weight="balanced", random_state=42
    ),
    "RandomForest": RandomForestClassifier(
        n_estimators=300, class_weight="balanced", random_state=42, n_jobs=-1
    ),
    "SVM": SVC(
        kernel="linear", probability=True, class_weight="balanced", random_state=42
    ),
    "MultinomialNB": MultinomialNB(),
}

if HAS_LGBM:
    models["LightGBM"] = LGBMClassifier(
        n_estimators=300, random_state=42, verbosity=-1
    )
else:
    models["GradientBoosting"] = GradientBoostingClassifier(random_state=42)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

results = {}
fitted_models = {}

for name, model in models.items():
    print("\n" + "=" * 70)
    print(f"Modele: {name}")
    print("=" * 70)

    t0 = time.time()
    cv_scores = cross_val_score(
        model, X_train, y_train, cv=cv, scoring="f1_macro", n_jobs=-1
    )
    t_cv = time.time() - t0
    print(
        f"CV 5-fold F1-macro (train): {cv_scores.mean():.4f} +/- {cv_scores.std():.4f} "
        f"({t_cv:.1f}s)"
    )

    t0 = time.time()
    model.fit(X_train, y_train)
    t_fit = time.time() - t0

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test) if hasattr(model, "predict_proba") else None

    fitted_models[name] = model
    results[name] = {
        "cv_f1_macro_mean": float(cv_scores.mean()),
        "cv_f1_macro_std": float(cv_scores.std()),
        "fit_time_s": round(t_fit, 2),
    }

    np.save(DATA_DIR / f"y_pred_{name}.npy", y_pred)
    if y_proba is not None:
        np.save(DATA_DIR / f"y_proba_{name}.npy", y_proba)

    joblib.dump(model, MODELS_DIR / f"model_{name}.joblib")
    print(f"Fit time: {t_fit:.1f}s | modele sauvegarde -> models/model_{name}.joblib")

with open(DATA_DIR / "phase2_cv_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("\n" + "=" * 70)
print("RESUME VALIDATION CROISEE (train, F1-macro 5-fold)")
print("=" * 70)
for name, r in sorted(results.items(), key=lambda kv: -kv[1]["cv_f1_macro_mean"]):
    print(f"{name:20s} F1-macro CV = {r['cv_f1_macro_mean']:.4f} (+/- {r['cv_f1_macro_std']:.4f})")
