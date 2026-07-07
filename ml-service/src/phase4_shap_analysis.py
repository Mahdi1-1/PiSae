"""
Phase 4 - Analyse SHAP sur le modele champion de la Phase 3 (MultinomialNB).

MultinomialNB n'expose pas de coef_ lineaire au sens sklearn standard, on
utilise donc un KernelExplainer (model-agnostic, base sur predict_proba) avec
un petit echantillon de fond + un echantillon de test reduit pour rester
raisonnable en temps de calcul.

Sorties:
  ml-service/reports/shap_summary_<classe>.png   (importance globale par classe)
  ml-service/reports/shap_waterfall_<i>.png       (explication de predictions individuelles)
"""
import numpy as np
import joblib
import shap
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
import scipy.sparse as sp

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

CHAMPION = "MultinomialNB"

model = joblib.load(MODELS_DIR / f"model_{CHAMPION}.joblib")
tfidf = joblib.load(MODELS_DIR / "tfidf_vectorizer.joblib")
university_encoder = joblib.load(MODELS_DIR / "university_encoder.joblib")
category_encoder = joblib.load(MODELS_DIR / "category_encoder.joblib")
label_encoder = joblib.load(MODELS_DIR / "label_encoder.joblib")
class_names = list(label_encoder.classes_)

feature_names = (
    list(tfidf.get_feature_names_out())
    + [f"univ={c}" for c in university_encoder.categories_[0]]
    + [f"cat={c}" for c in category_encoder.categories_[0]]
)

X_train = sp.load_npz(DATA_DIR / "X_train.npz")
X_test = sp.load_npz(DATA_DIR / "X_test.npz")
y_test = np.load(DATA_DIR / "y_test.npy")

# Echantillons reduits pour rester raisonnable avec un KernelExplainer
# (model-agnostic donc couteux : O(n_background * n_samples_explained)).
rng = np.random.RandomState(42)
BACKGROUND_SIZE = 40
EXPLAIN_SIZE = 60

bg_idx = rng.choice(X_train.shape[0], size=BACKGROUND_SIZE, replace=False)
background = X_train[bg_idx].toarray()
background_summary = shap.kmeans(background, 15)

explain_idx = rng.choice(X_test.shape[0], size=EXPLAIN_SIZE, replace=False)
X_explain = X_test[explain_idx].toarray()
y_explain = y_test[explain_idx]

print(f"Background summary: {background_summary.data.shape}")
print(f"Echantillon explique: {X_explain.shape}")

explainer = shap.KernelExplainer(model.predict_proba, background_summary)

print("Calcul des valeurs SHAP (KernelExplainer, model-agnostic sur predict_proba)...")
shap_values = explainer.shap_values(X_explain, nsamples=150)
# shap_values shape: (n_samples, n_features, n_classes) en shap >=0.45
shap_values = np.array(shap_values)
if shap_values.shape[0] == len(class_names):
    # (n_classes, n_samples, n_features) -> transpose vers (n_samples, n_features, n_classes)
    shap_values = np.transpose(shap_values, (1, 2, 0))
print(f"shap_values shape: {shap_values.shape}")

np.save(DATA_DIR / "shap_values_champion.npy", shap_values)
np.save(DATA_DIR / "shap_explain_idx.npy", explain_idx)

# ---------------------------------------------------------------------------
# Summary plot par classe (importance globale)
# ---------------------------------------------------------------------------
for c_idx, c_name in enumerate(class_names):
    plt.figure(figsize=(8, 6))
    shap.summary_plot(
        shap_values[:, :, c_idx],
        X_explain,
        feature_names=feature_names,
        show=False,
        max_display=20,
    )
    plt.title(f"SHAP summary - classe {c_name}")
    plt.tight_layout()
    out = REPORTS_DIR / f"shap_summary_{c_name}.png"
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"Summary plot sauvegarde -> {out}")

# ---------------------------------------------------------------------------
# Waterfall plots sur 3 predictions individuelles
# ---------------------------------------------------------------------------
sample_positions = [0, 1, 2]
for pos in sample_positions:
    pred_class = model.predict(X_explain[pos : pos + 1])[0]
    pred_class_idx = pred_class
    true_class = y_explain[pos]

    expl = shap.Explanation(
        values=shap_values[pos, :, pred_class_idx],
        base_values=explainer.expected_value[pred_class_idx],
        data=X_explain[pos],
        feature_names=feature_names,
    )
    plt.figure(figsize=(9, 6))
    shap.plots.waterfall(expl, max_display=15, show=False)
    plt.title(
        f"Waterfall #{pos} - predit={class_names[pred_class_idx]} "
        f"(vrai={class_names[true_class]})"
    )
    plt.tight_layout()
    out = REPORTS_DIR / f"shap_waterfall_{pos}.png"
    plt.savefig(out, dpi=150)
    plt.close()
    print(f"Waterfall plot sauvegarde -> {out}")

# ---------------------------------------------------------------------------
# Synthese texte : top features par classe (moyenne |SHAP|)
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("SYNTHESE - top mots-cles/skills par classe (moyenne |valeur SHAP|)")
print("=" * 70)
for c_idx, c_name in enumerate(class_names):
    mean_abs = np.abs(shap_values[:, :, c_idx]).mean(axis=0)
    top_idx = np.argsort(-mean_abs)[:15]
    print(f"\n--- {c_name} ---")
    for i in top_idx:
        print(f"  {feature_names[i]:35s} {mean_abs[i]:.5f}")
