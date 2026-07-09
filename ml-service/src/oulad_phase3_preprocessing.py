"""
OULAD - Phase 3 : Prétraitement, split, gestion du déséquilibre
"""
import pandas as pd
import numpy as np
import joblib
import json
import matplotlib.pyplot as plt
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE

DATA_DIR   = Path(__file__).parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"
REPORTS_DIR = Path(__file__).parent.parent / "reports"
MODELS_DIR.mkdir(exist_ok=True)
REPORTS_DIR.mkdir(exist_ok=True)

# Colonnes à exclure du training (identifiants)
ID_COLS = ["id_student", "code_module", "code_presentation", "target"]

NUMERIC_FEATURES = [
    "studied_credits", "num_of_prev_attempts",
    "age_band_enc", "highest_education_enc", "imd_band_enc",
    "gender_enc", "disability_enc",
    "total_clicks", "nb_active_days", "avg_clicks_per_day",
    "last_active_day", "days_before_start_activity", "click_trend",
    "nb_resource_types", "nb_assessments_submitted", "avg_score",
    "pct_late_submissions", "first_assessment_score",
    "nb_missing_assessments", "date_registration",
]


def load_features():
    path = DATA_DIR / "oulad_features.csv"
    df = pd.read_csv(path)
    print(f"✓ Dataset chargé : {df.shape[0]:,} lignes × {df.shape[1]} colonnes")
    print(f"  Withdrawn : {df['target'].sum():,} ({df['target'].mean()*100:.1f}%)")
    return df


def get_feature_columns(df: pd.DataFrame) -> list:
    return [c for c in df.columns if c not in ID_COLS]


def split(df: pd.DataFrame):
    feature_cols = get_feature_columns(df)
    X = df[feature_cols].values
    y = df["target"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n[SPLIT] Train : {X_train.shape[0]:,} | Test : {X_test.shape[0]:,}")
    print(f"  Train Withdrawn : {y_train.sum():,} ({y_train.mean()*100:.1f}%)")
    print(f"  Test  Withdrawn : {y_test.sum():,} ({y_test.mean()*100:.1f}%)")
    return X_train, X_test, y_train, y_test, feature_cols


def scale(X_train, X_test):
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled  = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, scaler


def apply_smote(X_train_scaled, y_train):
    print("\n[SMOTE] Application sur le train set...")
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_train_scaled, y_train)
    print(f"  Avant SMOTE : {len(y_train):,} ({y_train.mean()*100:.1f}% withdrawn)")
    print(f"  Après SMOTE : {len(y_res):,} ({y_res.mean()*100:.1f}% withdrawn)")
    return X_res, y_res


def plot_class_balance(y_train, y_train_smote, y_test):
    fig, axes = plt.subplots(1, 3, figsize=(14, 4))

    sets = [
        ("Train (original)", y_train),
        ("Train (après SMOTE)", y_train_smote),
        ("Test", y_test),
    ]
    for ax, (title, y) in zip(axes, sets):
        counts = pd.Series(y).value_counts().sort_index()
        labels = ["Non-withdrawn", "Withdrawn"]
        bars = ax.bar(labels, counts.values, color=["#4CAF50", "#F44336"])
        ax.set_title(title, fontweight="bold")
        ax.set_ylabel("Effectif")
        for bar, v in zip(bars, counts.values):
            ax.text(bar.get_x() + bar.get_width()/2, v + 20,
                    f"{v:,}\n({v/len(y)*100:.1f}%)", ha="center", fontsize=9)

    plt.tight_layout()
    out = REPORTS_DIR / "oulad_class_balance.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n✓ Graphique sauvegardé → {out}")


def save_artifacts(scaler, X_train_raw, X_test_scaled, X_train_smote,
                   y_train, y_test, y_train_smote, feature_cols):
    joblib.dump(scaler, MODELS_DIR / "oulad_scaler.joblib")
    joblib.dump(feature_cols, MODELS_DIR / "oulad_feature_cols.joblib")

    np.save(DATA_DIR / "oulad_X_train_raw.npy",   X_train_raw)
    np.save(DATA_DIR / "oulad_X_train_smote.npy", X_train_smote)
    np.save(DATA_DIR / "oulad_X_test.npy",        X_test_scaled)
    np.save(DATA_DIR / "oulad_y_train.npy",        y_train)
    np.save(DATA_DIR / "oulad_y_train_smote.npy",  y_train_smote)
    np.save(DATA_DIR / "oulad_y_test.npy",         y_test)

    meta = {
        "n_train": int(len(y_train)),
        "n_train_smote": int(len(y_train_smote)),
        "n_test": int(len(y_test)),
        "pct_withdrawn_train": float(y_train.mean()),
        "pct_withdrawn_test": float(y_test.mean()),
        "n_features": len(feature_cols),
        "feature_cols": feature_cols,
    }
    with open(DATA_DIR / "oulad_preprocessing_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\n✓ Artefacts sauvegardés dans {MODELS_DIR} et {DATA_DIR}")


def print_summary(feature_cols):
    print(f"\n{'='*60}")
    print("RÉSUMÉ PHASE 3")
    print(f"{'='*60}")
    print(f"  Features totales     : {len(feature_cols)}")
    print(f"  Scaling              : StandardScaler (fit sur train uniquement)")
    print(f"  Gestion déséquilibre : SMOTE (train) + class_weight='balanced' (Phase 4)")
    print(f"  Split                : 80/20 stratifié")
    print(f"\n  Artefacts produits :")
    print(f"    models/oulad_scaler.joblib")
    print(f"    models/oulad_feature_cols.joblib")
    print(f"    data/oulad_X_train_raw.npy    (train scaled, sans SMOTE)")
    print(f"    data/oulad_X_train_smote.npy  (train scaled + SMOTE)")
    print(f"    data/oulad_X_test.npy         (test scaled)")
    print(f"    data/oulad_y_train.npy / oulad_y_train_smote.npy / oulad_y_test.npy")
    print(f"\n  Note : en Phase 4, on comparera :")
    print(f"    - X_train_smote + modèle standard")
    print(f"    - X_train_raw   + class_weight='balanced'")


def main():
    print("OULAD — Phase 3 : Prétraitement\n")

    df = load_features()
    X_train, X_test, y_train, y_test, feature_cols = split(df)

    print("\n[SCALER] Fit StandardScaler sur le train, transform sur train+test...")
    X_train_scaled, X_test_scaled, scaler = scale(X_train, X_test)

    X_train_smote, y_train_smote = apply_smote(X_train_scaled, y_train)

    plot_class_balance(y_train, y_train_smote, y_test)

    save_artifacts(scaler, X_train_scaled, X_test_scaled,
                   X_train_smote, y_train, y_test, y_train_smote, feature_cols)

    print_summary(feature_cols)
    print("\n✓ Phase 3 terminée. Valider avant de passer à la Phase 4.")


if __name__ == "__main__":
    main()
