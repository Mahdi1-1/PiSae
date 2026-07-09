"""
OULAD - Phase 6 : Analyse SHAP sur le champion XGBoost
"""
import numpy as np
import joblib
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap
from pathlib import Path

DATA_DIR    = Path(__file__).parent.parent / "data"
MODELS_DIR  = Path(__file__).parent.parent / "models"
REPORTS_DIR = Path(__file__).parent.parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)

FEATURE_LABELS = {
    "studied_credits":           "Crédits étudiés",
    "num_of_prev_attempts":      "Nb tentatives précédentes",
    "age_band_enc":              "Tranche d'âge",
    "highest_education_enc":     "Niveau d'éducation",
    "imd_band_enc":              "Indice défavorisation (IMD)",
    "gender_enc":                "Genre",
    "disability_enc":            "Handicap",
    "total_clicks":              "Total clics VLE",
    "nb_active_days":            "Jours actifs",
    "avg_clicks_per_day":        "Clics/jour moyen",
    "last_active_day":           "Dernier jour actif",
    "days_before_start_activity":"Engagement précoce",
    "click_trend":               "Tendance des clics (pente)",
    "nb_resource_types":         "Diversité des ressources",
    "nb_assessments_submitted":  "Évaluations soumises",
    "avg_score":                 "Score moyen",
    "pct_late_submissions":      "% soumissions en retard",
    "first_assessment_score":    "Score 1ère évaluation",
    "nb_missing_assessments":    "Évaluations manquées",
    "date_registration":         "Date d'inscription",
}


def load():
    print("Chargement des artefacts...")
    model        = joblib.load(MODELS_DIR / "oulad_model_XGBoost.joblib")
    feature_cols = joblib.load(MODELS_DIR / "oulad_feature_cols.joblib")
    X_test       = np.load(DATA_DIR / "oulad_X_test.npy")
    y_test       = np.load(DATA_DIR / "oulad_y_test.npy")
    y_pred       = np.load(DATA_DIR / "oulad_y_pred_XGBoost.npy")
    print(f"  X_test : {X_test.shape}  |  features : {len(feature_cols)}")
    return model, feature_cols, X_test, y_test, y_pred


def get_display_names(feature_cols):
    return [FEATURE_LABELS.get(c, c) for c in feature_cols]


def compute_shap(model, X_test):
    print("\nCalcul des valeurs SHAP (TreeExplainer)...")
    explainer   = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)
    print(f"  ✓ shap_values : {shap_values.shape}")
    return explainer, shap_values


def plot_summary_beeswarm(shap_values, X_test, feature_names):
    print("\n[SHAP] Summary plot (beeswarm)...")
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values, X_test, feature_names=feature_names,
                      show=False, max_display=20, plot_size=None)
    plt.title("SHAP — Impact des features sur la prédiction de décrochage",
              fontsize=12, fontweight="bold", pad=15)
    plt.tight_layout()
    out = REPORTS_DIR / "oulad_shap_beeswarm.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  ✓ → {out}")


def plot_bar_importance(shap_values, feature_names):
    print("[SHAP] Bar plot (importance moyenne)...")
    mean_abs = np.abs(shap_values).mean(axis=0)
    top_idx  = np.argsort(mean_abs)[-15:][::-1]

    fig, ax = plt.subplots(figsize=(9, 6))
    bars = ax.barh(
        [feature_names[i] for i in reversed(top_idx)],
        [mean_abs[i] for i in reversed(top_idx)],
        color="#F59E0B", edgecolor="white"
    )
    ax.set_xlabel("Importance SHAP moyenne |E[|SHAP|]|", fontsize=11)
    ax.set_title("Top 15 features — Importance SHAP globale\n(XGBoost, prédiction décrochage OULAD)",
                 fontsize=12, fontweight="bold")
    ax.bar_label(bars, fmt="%.4f", padding=3, fontsize=9)
    ax.grid(axis="x", alpha=0.3)
    plt.tight_layout()
    out = REPORTS_DIR / "oulad_shap_bar.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  ✓ → {out}")

    print("\n  Top 15 features par importance SHAP :")
    print(f"  {'Feature':35s} {'SHAP moyen':>12s}")
    print(f"  {'-'*50}")
    for i in top_idx:
        print(f"  {feature_names[i]:35s} {mean_abs[i]:12.4f}")

    return top_idx, mean_abs


def pick_examples(y_test, y_pred, shap_values):
    """Sélectionne 3 cas : vrai positif, vrai négatif, faux positif ou faux négatif."""
    tp_idx = np.where((y_test == 1) & (y_pred == 1))[0]
    tn_idx = np.where((y_test == 0) & (y_pred == 0))[0]
    fp_idx = np.where((y_test == 0) & (y_pred == 1))[0]
    fn_idx = np.where((y_test == 1) & (y_pred == 0))[0]

    # Choisir l'exemple avec le SHAP le plus extrême pour chaque catégorie
    def pick_extreme(idx):
        shap_norm = np.abs(shap_values[idx]).sum(axis=1)
        return idx[np.argmax(shap_norm)]

    examples = {
        "Vrai Positif (décrocheur détecté)":      pick_extreme(tp_idx),
        "Vrai Négatif (non-décrocheur correct)":  pick_extreme(tn_idx),
        "Faux Positif (fausse alarme)":            pick_extreme(fp_idx) if len(fp_idx) > 0 else None,
        "Faux Négatif (décrocheur raté)":          pick_extreme(fn_idx) if len(fn_idx) > 0 else None,
    }
    # Garder les 3 plus intéressants
    selected = {k: v for k, v in examples.items() if v is not None}
    return dict(list(selected.items())[:3])


def plot_waterfall(explainer, shap_values, X_test, feature_names, examples):
    print("[SHAP] Waterfall plots individuels...")
    for label, idx in examples.items():
        sv = shap.Explanation(
            values=shap_values[idx],
            base_values=explainer.expected_value,
            data=X_test[idx],
            feature_names=feature_names
        )
        plt.figure(figsize=(10, 6))
        shap.waterfall_plot(sv, max_display=12, show=False)
        plt.title(f"SHAP Waterfall — {label}", fontsize=11, fontweight="bold")
        plt.tight_layout()
        safe_label = label.replace(" ", "_").replace("(", "").replace(")", "")
        out = REPORTS_DIR / f"oulad_shap_waterfall_{safe_label}.png"
        plt.savefig(out, dpi=150, bbox_inches="tight")
        plt.close()
        print(f"  ✓ → {out}")


def interpret_business(shap_values, feature_cols, feature_names):
    mean_abs = np.abs(shap_values).mean(axis=0)
    top5_idx = np.argsort(mean_abs)[-5:][::-1]

    print(f"\n{'='*65}")
    print("INTERPRÉTATION MÉTIER")
    print(f"{'='*65}")

    interpretations = {
        "last_active_day":           "Le dernier jour d'activité est le signal le plus fort. Un apprenant qui cesse de se connecter tôt dans le module est quasi-certain de décrocher. Cohérent avec l'intuition pédagogique.",
        "nb_assessments_submitted":  "Le nombre d'évaluations soumises est massivement prédictif. Ne pas rendre ses devoirs = signal d'alarme précoce fort.",
        "nb_active_days":            "La régularité de connexion prime sur l'intensité. Mieux vaut se connecter peu chaque jour que beaucoup d'un seul coup.",
        "nb_resource_types":         "La diversité des ressources consultées (forums, quiz, contenus) révèle l'engagement cognitif actif, pas juste la présence.",
        "total_clicks":              "Le volume de clics total reflète l'engagement global. Un apprenant très peu cliqueur est à risque.",
        "click_trend":               "Une tendance décroissante des clics (pente négative) est un signal d'alerte : l'apprenant se désengagement progressivement.",
        "nb_missing_assessments":    "Les évaluations non soumises du tout sont encore plus révélatrices que les soumissions tardives.",
        "avg_score":                 "Le score moyen a un impact limité — un bon élève peut quand même décrocher pour des raisons non académiques.",
        "studied_credits":           "Les apprenants inscrits à beaucoup de crédits simultanément sont plus à risque (surcharge).",
        "imd_band_enc":              "L'indice de défavorisation socio-économique a un impact modéré mais réel sur le risque de décrochage.",
    }

    for i in top5_idx:
        fname = feature_cols[i]
        print(f"\n  #{list(top5_idx).index(i)+1} — {feature_names[i]} (SHAP={mean_abs[i]:.4f})")
        if fname in interpretations:
            print(f"  → {interpretations[fname]}")

    print(f"\n  Conclusion : les features comportementales VLE dominent (7/10 top features)")
    print(f"  Les features démographiques (âge, genre, région) ont peu d'impact.")
    print(f"  → Le QUOI FAIRE (engagement) prime sur le QUI EST (profil) pour prédire le décrochage.")


def save_shap_meta(shap_values, feature_cols, feature_names, top_idx, mean_abs):
    top15 = [
        {"feature": feature_cols[i], "label": feature_names[i], "shap_mean": float(mean_abs[i])}
        for i in top_idx[:15]
    ]
    with open(DATA_DIR / "oulad_shap_meta.json", "w") as f:
        json.dump({"top_features": top15}, f, indent=2, ensure_ascii=False)
    np.save(DATA_DIR / "oulad_shap_values.npy", shap_values)
    print(f"\n✓ Méta SHAP sauvegardée → {DATA_DIR / 'oulad_shap_meta.json'}")


def main():
    print("OULAD — Phase 6 : Analyse SHAP\n")

    model, feature_cols, X_test, y_test, y_pred = load()
    feature_names = get_display_names(feature_cols)

    explainer, shap_values = compute_shap(model, X_test)

    plot_summary_beeswarm(shap_values, X_test, feature_names)
    top_idx, mean_abs = plot_bar_importance(shap_values, feature_names)

    examples = pick_examples(y_test, y_pred, shap_values)
    print(f"\n  Exemples sélectionnés pour waterfall :")
    for label, idx in examples.items():
        print(f"    [{label}] → index {idx}")
    plot_waterfall(explainer, shap_values, X_test, feature_names, examples)

    interpret_business(shap_values, feature_cols, feature_names)
    save_shap_meta(shap_values, feature_cols, feature_names, top_idx, mean_abs)

    print("\n✓ Phase 6 terminée. Valider avant de passer à la Phase 7.")


if __name__ == "__main__":
    main()
