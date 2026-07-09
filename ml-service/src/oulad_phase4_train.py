"""
OULAD - Phase 4 : Entraînement et comparaison de 5 modèles
Stratégie : pour chaque modèle, on teste SMOTE vs class_weight='balanced'
            et on garde la variante avec le meilleur recall withdrawn.
"""
import numpy as np
import joblib
import json
import warnings
from pathlib import Path
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score, RandomizedSearchCV
from sklearn.metrics import recall_score, f1_score
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

DATA_DIR   = Path(__file__).parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"


# ── Chargement ────────────────────────────────────────────────────────────────

def load():
    print("Chargement des artefacts Phase 3...")
    X_train_raw   = np.load(DATA_DIR / "oulad_X_train_raw.npy")
    X_train_smote = np.load(DATA_DIR / "oulad_X_train_smote.npy")
    X_test        = np.load(DATA_DIR / "oulad_X_test.npy")
    y_train       = np.load(DATA_DIR / "oulad_y_train.npy")
    y_train_smote = np.load(DATA_DIR / "oulad_y_train_smote.npy")
    y_test        = np.load(DATA_DIR / "oulad_y_test.npy")
    print(f"  X_train_raw   : {X_train_raw.shape}")
    print(f"  X_train_smote : {X_train_smote.shape}")
    print(f"  X_test        : {X_test.shape}")
    return X_train_raw, X_train_smote, X_test, y_train, y_train_smote, y_test


# ── Utilitaires ───────────────────────────────────────────────────────────────

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def best_variant(model_balanced, model_smote,
                 X_raw, y_raw, X_smote, y_smote, X_test, y_test, name):
    """Entraîne les deux variantes et retourne celle avec le meilleur recall withdrawn."""
    model_balanced.fit(X_raw, y_raw)
    model_smote.fit(X_smote, y_smote)

    r_bal  = recall_score(y_test, model_balanced.predict(X_test))
    r_smo  = recall_score(y_test, model_smote.predict(X_test))

    if r_bal >= r_smo:
        print(f"    → variante retenue : class_weight (recall={r_bal:.4f} vs SMOTE={r_smo:.4f})")
        return model_balanced, "class_weight"
    else:
        print(f"    → variante retenue : SMOTE       (recall={r_smo:.4f} vs balanced={r_bal:.4f})")
        return model_smote, "smote"


def cv_recall(model, X, y):
    scores = cross_val_score(model, X, y, cv=cv,
                             scoring="recall", n_jobs=1)
    return scores.mean(), scores.std()


# ── 1. Logistic Regression ────────────────────────────────────────────────────

def train_logreg(X_raw, y_raw, X_smote, y_smote, X_test, y_test):
    print("\n[1/5] Logistic Regression...")

    param_dist = {"C": [0.01, 0.1, 1, 10, 100]}
    best_C, best_recall = 1.0, 0.0
    for C in param_dist["C"]:
        m = LogisticRegression(C=C, class_weight="balanced",
                               max_iter=1000, random_state=42)
        r, _ = cv_recall(m, X_raw, y_raw)
        if r > best_recall:
            best_recall, best_C = r, C
    print(f"    Best C={best_C} (CV recall={best_recall:.4f})")

    m_bal = LogisticRegression(C=best_C, class_weight="balanced",
                               max_iter=1000, random_state=42)
    m_smo = LogisticRegression(C=best_C, max_iter=1000, random_state=42)
    model, variant = best_variant(m_bal, m_smo, X_raw, y_raw, X_smote, y_smote, X_test, y_test, "LR")
    return model, variant


# ── 2. Random Forest ──────────────────────────────────────────────────────────

def train_rf(X_raw, y_raw, X_smote, y_smote, X_test, y_test):
    print("\n[2/5] Random Forest...")

    param_dist = {
        "n_estimators": [200, 400],
        "max_depth": [None, 20, 40],
        "min_samples_leaf": [1, 5],
    }
    m_search = RandomForestClassifier(class_weight="balanced", random_state=42, n_jobs=1)
    search = RandomizedSearchCV(m_search, param_dist, n_iter=6, cv=3,
                                scoring="recall", random_state=42, n_jobs=1)
    search.fit(X_raw, y_raw)
    bp = search.best_params_
    print(f"    Best params : {bp} (CV recall={search.best_score_:.4f})")

    m_bal = RandomForestClassifier(**bp, class_weight="balanced", random_state=42, n_jobs=1)
    m_smo = RandomForestClassifier(**bp, random_state=42, n_jobs=1)
    model, variant = best_variant(m_bal, m_smo, X_raw, y_raw, X_smote, y_smote, X_test, y_test, "RF")
    return model, variant


# ── 3. XGBoost ────────────────────────────────────────────────────────────────

def train_xgb(X_raw, y_raw, X_smote, y_smote, X_test, y_test):
    print("\n[3/5] XGBoost...")

    # scale_pos_weight = ratio négatifs/positifs (équivalent class_weight)
    ratio = int((y_raw == 0).sum() / (y_raw == 1).sum())

    param_dist = {
        "n_estimators": [200, 400],
        "max_depth": [4, 6, 8],
        "learning_rate": [0.05, 0.1],
        "subsample": [0.8, 1.0],
    }
    m_search = XGBClassifier(scale_pos_weight=ratio, use_label_encoder=False,
                             eval_metric="logloss", random_state=42, n_jobs=1)
    search = RandomizedSearchCV(m_search, param_dist, n_iter=8, cv=3,
                                scoring="recall", random_state=42, n_jobs=1)
    search.fit(X_raw, y_raw)
    bp = search.best_params_
    print(f"    Best params : {bp} (CV recall={search.best_score_:.4f})")

    m_bal = XGBClassifier(**bp, scale_pos_weight=ratio, use_label_encoder=False,
                          eval_metric="logloss", random_state=42, n_jobs=1)
    m_smo = XGBClassifier(**bp, use_label_encoder=False,
                          eval_metric="logloss", random_state=42, n_jobs=1)
    model, variant = best_variant(m_bal, m_smo, X_raw, y_raw, X_smote, y_smote, X_test, y_test, "XGB")
    return model, variant


# ── 4. SVM ────────────────────────────────────────────────────────────────────

def train_svm(X_raw, y_raw, X_smote, y_smote, X_test, y_test):
    print("\n[4/5] SVM (RBF)...")

    param_dist = {"C": [0.1, 1, 10], "gamma": ["scale", "auto"]}
    best_C, best_gamma, best_recall = 1.0, "scale", 0.0
    for C in param_dist["C"]:
        for gamma in param_dist["gamma"]:
            m = SVC(C=C, gamma=gamma, kernel="rbf",
                    class_weight="balanced", probability=True, random_state=42)
            r, _ = cv_recall(m, X_raw, y_raw)
            if r > best_recall:
                best_recall, best_C, best_gamma = r, C, gamma
    print(f"    Best C={best_C}, gamma={best_gamma} (CV recall={best_recall:.4f})")

    m_bal = SVC(C=best_C, gamma=best_gamma, kernel="rbf",
                class_weight="balanced", probability=True, random_state=42)
    m_smo = SVC(C=best_C, gamma=best_gamma, kernel="rbf",
                probability=True, random_state=42)
    model, variant = best_variant(m_bal, m_smo, X_raw, y_raw, X_smote, y_smote, X_test, y_test, "SVM")
    return model, variant


# ── 5. MLP ────────────────────────────────────────────────────────────────────

def train_mlp(X_raw, y_raw, X_smote, y_smote, X_test, y_test):
    print("\n[5/5] MLP (réseau de neurones)...")

    param_dist = {
        "hidden_layer_sizes": [(128, 64), (256, 128, 64), (128, 64, 32)],
        "alpha": [0.0001, 0.001],
        "learning_rate_init": [0.001, 0.01],
    }
    best_params, best_recall = {"hidden_layer_sizes": (128, 64), "alpha": 0.001, "learning_rate_init": 0.001}, 0.0
    for hls in param_dist["hidden_layer_sizes"]:
        for alpha in param_dist["alpha"]:
            m = MLPClassifier(hidden_layer_sizes=hls, alpha=alpha,
                              max_iter=300, random_state=42)
            r, _ = cv_recall(m, X_smote, y_smote)  # MLP → toujours SMOTE car pas de class_weight natif
            if r > best_recall:
                best_recall = r
                best_params = {"hidden_layer_sizes": hls, "alpha": alpha, "learning_rate_init": 0.001}
    print(f"    Best params : {best_params} (CV recall SMOTE={best_recall:.4f})")

    model = MLPClassifier(**best_params, max_iter=300, random_state=42)
    model.fit(X_smote, y_smote)
    variant = "smote"
    r = recall_score(y_test, model.predict(X_test))
    print(f"    → variante retenue : SMOTE (recall test={r:.4f})")
    return model, variant


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("OULAD — Phase 4 : Entraînement des modèles\n")
    X_raw, X_smote, X_test, y_raw, y_smote, y_test = load()

    results = {}

    lr_model,  lr_v  = train_logreg(X_raw, y_raw, X_smote, y_smote, X_test, y_test)
    rf_model,  rf_v  = train_rf    (X_raw, y_raw, X_smote, y_smote, X_test, y_test)
    xgb_model, xgb_v = train_xgb  (X_raw, y_raw, X_smote, y_smote, X_test, y_test)
    svm_model, svm_v = train_svm  (X_raw, y_raw, X_smote, y_smote, X_test, y_test)
    mlp_model, mlp_v = train_mlp  (X_raw, y_raw, X_smote, y_smote, X_test, y_test)

    models = {
        "LogisticRegression": (lr_model,  lr_v),
        "RandomForest":       (rf_model,  rf_v),
        "XGBoost":            (xgb_model, xgb_v),
        "SVM":                (svm_model, svm_v),
        "MLP":                (mlp_model, mlp_v),
    }

    print(f"\n{'='*60}")
    print("SAUVEGARDE DES MODÈLES")
    print(f"{'='*60}")
    for name, (model, variant) in models.items():
        path = MODELS_DIR / f"oulad_model_{name}.joblib"
        joblib.dump(model, path)

        y_pred = model.predict(X_test)
        results[name] = {
            "variant": variant,
            "recall_withdrawn": float(recall_score(y_test, y_pred)),
            "f1_withdrawn": float(f1_score(y_test, y_pred)),
        }
        print(f"  ✓ {name:20s} → recall={results[name]['recall_withdrawn']:.4f}  "
              f"f1={results[name]['f1_withdrawn']:.4f}  [{variant}]")
        np.save(DATA_DIR / f"oulad_y_pred_{name}.npy", y_pred)
        if hasattr(model, "predict_proba"):
            np.save(DATA_DIR / f"oulad_y_proba_{name}.npy",
                    model.predict_proba(X_test)[:, 1])

    with open(DATA_DIR / "oulad_phase4_results.json", "w") as f:
        json.dump(results, f, indent=2)

    best = max(results, key=lambda k: results[k]["recall_withdrawn"])
    print(f"\n→ Meilleur recall Withdrawn : {best} ({results[best]['recall_withdrawn']:.4f})")
    print("\n✓ Phase 4 terminée. Valider avant de passer à la Phase 5.")


if __name__ == "__main__":
    main()
