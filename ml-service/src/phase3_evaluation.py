"""
Phase 3 - Evaluation et comparaison des modeles sur le jeu de test.

Pour chaque modele: accuracy, precision/recall/F1 (macro + weighted),
matrice de confusion (image). Tableau comparatif + identification du
modele champion selon le F1-score macro.
"""
import json
import numpy as np
import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay,
)

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

y_test = np.load(DATA_DIR / "y_test.npy")
label_encoder = joblib.load(MODELS_DIR / "label_encoder.joblib")
class_names = list(label_encoder.classes_)

model_names = [
    "LogisticRegression",
    "RandomForest",
    "SVM",
    "MultinomialNB",
    "LightGBM",
]
model_names = [n for n in model_names if (DATA_DIR / f"y_pred_{n}.npy").exists()]

rows = []
reports = {}

fig, axes = plt.subplots(1, len(model_names), figsize=(5 * len(model_names), 4.5))
if len(model_names) == 1:
    axes = [axes]

for ax, name in zip(axes, model_names):
    y_pred = np.load(DATA_DIR / f"y_pred_{name}.npy")

    acc = accuracy_score(y_test, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_test, y_pred, average="macro", zero_division=0
    )
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_test, y_pred, average="weighted", zero_division=0
    )

    rows.append(
        {
            "model": name,
            "accuracy": acc,
            "precision_macro": p_macro,
            "recall_macro": r_macro,
            "f1_macro": f1_macro,
            "precision_weighted": p_weighted,
            "recall_weighted": r_weighted,
            "f1_weighted": f1_weighted,
        }
    )

    reports[name] = classification_report(
        y_test, y_pred, target_names=class_names, zero_division=0, output_dict=True
    )

    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=class_names)
    disp.plot(ax=ax, colorbar=False, cmap="Blues", xticks_rotation=45)
    ax.set_title(name)

plt.tight_layout()
cm_path = REPORTS_DIR / "confusion_matrices.png"
plt.savefig(cm_path, dpi=150)
print(f"Matrices de confusion sauvegardees -> {cm_path}")

# --- Tableau comparatif -----------------------------------------------------
rows.sort(key=lambda r: -r["f1_macro"])
best = rows[0]

print("\n" + "=" * 100)
print("TABLEAU COMPARATIF (jeu de test)")
print("=" * 100)
header = (
    f"{'Modele':20s} {'Accuracy':>10s} {'Prec.macro':>11s} {'Rec.macro':>10s} "
    f"{'F1.macro':>9s} {'Prec.wght':>10s} {'Rec.wght':>9s} {'F1.wght':>8s}"
)
print(header)
print("-" * len(header))
for r in rows:
    print(
        f"{r['model']:20s} {r['accuracy']:>10.4f} {r['precision_macro']:>11.4f} "
        f"{r['recall_macro']:>10.4f} {r['f1_macro']:>9.4f} {r['precision_weighted']:>10.4f} "
        f"{r['recall_weighted']:>9.4f} {r['f1_weighted']:>8.4f}"
    )

print(
    f"\n>>> Modele champion (F1-macro le plus eleve, robuste au desequilibre "
    f"des classes): {best['model']} (F1-macro = {best['f1_macro']:.4f})"
)

# --- Detail par classe pour le champion -------------------------------------
print(f"\nDetail par classe - {best['model']}:")
for cls in class_names:
    r = reports[best["model"]][cls]
    print(
        f"  {cls:15s} precision={r['precision']:.3f} recall={r['recall']:.3f} "
        f"f1={r['f1-score']:.3f} support={int(r['support'])}"
    )

with open(DATA_DIR / "phase3_comparison.json", "w") as f:
    json.dump({"rows": rows, "best_model": best["model"], "reports": reports}, f, indent=2)

print(f"\nResultats detailles sauvegardes -> {DATA_DIR / 'phase3_comparison.json'}")
