"""
OULAD - Phase 5 : Évaluation complète et comparaison des modèles
"""
import numpy as np
import json
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from pathlib import Path
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, confusion_matrix, classification_report
)

DATA_DIR    = Path(__file__).parent.parent / "data"
REPORTS_DIR = Path(__file__).parent.parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

MODELS = ["LogisticRegression", "RandomForest", "XGBoost", "SVM", "MLP"]
COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]


def load():
    y_test = np.load(DATA_DIR / "oulad_y_test.npy")
    preds, probas = {}, {}
    for m in MODELS:
        preds[m] = np.load(DATA_DIR / f"oulad_y_pred_{m}.npy")
        p = DATA_DIR / f"oulad_y_proba_{m}.npy"
        if p.exists():
            probas[m] = np.load(p)
    return y_test, preds, probas


def compute_metrics(y_test, preds, probas):
    rows = []
    for m in MODELS:
        y_pred = preds[m]
        row = {
            "model": m,
            "accuracy":          round(accuracy_score(y_test, y_pred), 4),
            "precision_wd":      round(precision_score(y_test, y_pred), 4),
            "recall_wd":         round(recall_score(y_test, y_pred), 4),
            "f1_wd":             round(f1_score(y_test, y_pred), 4),
            "auc":               round(roc_auc_score(y_test, probas[m]), 4) if m in probas else None,
        }
        rows.append(row)
    return rows


def print_table(rows):
    print(f"\n{'='*80}")
    print("TABLEAU COMPARATIF — MÉTRIQUES SUR LE TEST SET")
    print(f"{'='*80}")
    header = f"{'Modèle':22s} {'Accuracy':>9s} {'Prec(W)':>9s} {'Recall(W)':>10s} {'F1(W)':>7s} {'AUC':>7s}"
    print(header)
    print("-" * 80)
    for r in rows:
        auc_str = f"{r['auc']:.4f}" if r["auc"] else "  N/A "
        print(f"  {r['model']:20s} {r['accuracy']:>9.4f} {r['precision_wd']:>9.4f} "
              f"{r['recall_wd']:>10.4f} {r['f1_wd']:>7.4f} {auc_str:>7s}")

    best_recall = max(rows, key=lambda x: x["recall_wd"])
    best_f1     = max(rows, key=lambda x: x["f1_wd"])
    best_auc    = max((r for r in rows if r["auc"]), key=lambda x: x["auc"])
    print(f"\n  → Meilleur recall  : {best_recall['model']} ({best_recall['recall_wd']:.4f})")
    print(f"  → Meilleur F1      : {best_f1['model']} ({best_f1['f1_wd']:.4f})")
    print(f"  → Meilleur AUC     : {best_auc['model']} ({best_auc['auc']:.4f})")


def plot_roc_curves(y_test, probas):
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.plot([0, 1], [0, 1], "k--", lw=1, label="Aléatoire (AUC=0.50)")

    for m, color in zip(MODELS, COLORS):
        if m not in probas:
            continue
        fpr, tpr, _ = roc_curve(y_test, probas[m])
        auc = roc_auc_score(y_test, probas[m])
        ax.plot(fpr, tpr, color=color, lw=2, label=f"{m} (AUC={auc:.4f})")

    ax.set_xlabel("Taux de faux positifs (FPR)", fontsize=12)
    ax.set_ylabel("Taux de vrais positifs (TPR / Recall)", fontsize=12)
    ax.set_title("Courbes ROC — Prédiction de décrochage OULAD", fontsize=13, fontweight="bold")
    ax.legend(loc="lower right", fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_xlim([0, 1])
    ax.set_ylim([0, 1.02])

    out = REPORTS_DIR / "oulad_roc_curves.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n✓ Courbes ROC → {out}")


def plot_confusion_matrices(y_test, preds):
    fig, axes = plt.subplots(1, 5, figsize=(22, 4))
    fig.suptitle("Matrices de confusion — Classe 1 = Withdrawn", fontsize=13, fontweight="bold")

    for ax, m, color in zip(axes, MODELS, COLORS):
        cm = confusion_matrix(y_test, preds[m])
        im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
        ax.set_title(m, fontsize=10, fontweight="bold")
        ax.set_xlabel("Prédit")
        ax.set_ylabel("Réel")
        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Non-WD", "WD"])
        ax.set_yticklabels(["Non-WD", "WD"])

        thresh = cm.max() / 2
        for i in range(2):
            for j in range(2):
                ax.text(j, i, f"{cm[i, j]:,}", ha="center", va="center",
                        color="white" if cm[i, j] > thresh else "black", fontsize=11)

    plt.tight_layout()
    out = REPORTS_DIR / "oulad_confusion_matrices.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"✓ Matrices de confusion → {out}")


def print_champion_report(y_test, preds, probas):
    champion = "XGBoost"
    print(f"\n{'='*60}")
    print(f"RAPPORT DÉTAILLÉ — CHAMPION : {champion}")
    print(f"{'='*60}")
    print(classification_report(y_test, preds[champion],
                                target_names=["Non-withdrawn", "Withdrawn"]))

    cm = confusion_matrix(y_test, preds[champion])
    tn, fp, fn, tp = cm.ravel()
    total_wd = tp + fn
    print(f"  Vrais décrocheurs détectés  : {tp:,} / {total_wd:,} ({tp/total_wd*100:.1f}%)")
    print(f"  Décrocheurs manqués (FN)    : {fn:,} / {total_wd:,} ({fn/total_wd*100:.1f}%)")
    print(f"  Faux positifs (non-WD prédit WD) : {fp:,}")
    print(f"\n  → Interprétation : sur 100 vrais décrocheurs, le modèle en")
    print(f"    détecte {tp/total_wd*100:.0f} et en rate {fn/total_wd*100:.0f}.")
    print(f"    En contexte pédagogique, rater un décrocheur coûte plus cher")
    print(f"    qu'alerter inutilement — ce recall est excellent.")


def save_results(rows):
    with open(DATA_DIR / "oulad_phase5_results.json", "w") as f:
        json.dump(rows, f, indent=2)
    print(f"\n✓ Résultats sauvegardés → {DATA_DIR / 'oulad_phase5_results.json'}")


def main():
    print("OULAD — Phase 5 : Évaluation complète\n")
    y_test, preds, probas = load()

    rows = compute_metrics(y_test, preds, probas)
    print_table(rows)
    plot_roc_curves(y_test, probas)
    plot_confusion_matrices(y_test, preds)
    print_champion_report(y_test, preds, probas)
    save_results(rows)

    print("\n✓ Phase 5 terminée. Valider avant de passer à la Phase 6 (SHAP).")


if __name__ == "__main__":
    main()
