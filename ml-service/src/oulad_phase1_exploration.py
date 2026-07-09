"""
OULAD - Phase 1 : Exploration et compréhension du dataset
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "oulad"
REPORTS_DIR = Path(__file__).parent.parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)


def load_all_tables():
    tables = {
        "studentInfo": "studentInfo.csv",
        "studentRegistration": "studentRegistration.csv",
        "studentAssessment": "studentAssessment.csv",
        "studentVle": "studentVle.csv",
        "vle": "vle.csv",
        "courses": "courses.csv",
        "assessments": "assessments.csv",
    }
    dfs = {}
    for name, filename in tables.items():
        path = DATA_DIR / filename
        if not path.exists():
            raise FileNotFoundError(
                f"Fichier manquant : {path}\n"
                "Téléchargez le dataset OULAD depuis Kaggle et placez les CSV dans ml-service/data/oulad/"
            )
        dfs[name] = pd.read_csv(path)
        print(f"✓ {name:25s} chargé  — {dfs[name].shape[0]:>7,} lignes × {dfs[name].shape[1]} colonnes")
    return dfs


def summarize_table(name: str, df: pd.DataFrame):
    print(f"\n{'='*60}")
    print(f"TABLE : {name}")
    print(f"{'='*60}")
    print(f"Shape : {df.shape[0]:,} lignes × {df.shape[1]} colonnes")
    print("\nColonnes, types et valeurs manquantes :")
    summary = pd.DataFrame({
        "type": df.dtypes,
        "non_null": df.count(),
        "null_count": df.isnull().sum(),
        "null_%": (df.isnull().sum() / len(df) * 100).round(2),
        "unique": df.nunique(),
        "exemple": df.apply(lambda c: str(c.dropna().iloc[0]) if len(c.dropna()) > 0 else "NaN"),
    })
    print(summary.to_string())


def analyze_target(df_info: pd.DataFrame):
    print(f"\n{'='*60}")
    print("ANALYSE DE LA VARIABLE CIBLE : final_result")
    print(f"{'='*60}")
    counts = df_info["final_result"].value_counts()
    pcts = df_info["final_result"].value_counts(normalize=True) * 100
    print("\nDistribution de final_result :")
    for label in counts.index:
        bar = "█" * int(pcts[label] / 2)
        print(f"  {label:15s}: {counts[label]:6,} ({pcts[label]:.1f}%)  {bar}")

    df_info = df_info.copy()
    df_info["target"] = (df_info["final_result"] == "Withdrawn").astype(int)
    n_withdrawn = df_info["target"].sum()
    n_total = len(df_info)
    n_not_withdrawn = n_total - n_withdrawn

    print(f"\nCible binaire (Withdrawn = 1, reste = 0) :")
    print(f"  Withdrawn     : {n_withdrawn:6,} ({n_withdrawn/n_total*100:.1f}%)")
    print(f"  Non-withdrawn : {n_not_withdrawn:6,} ({n_not_withdrawn/n_total*100:.1f}%)")
    ratio = n_not_withdrawn / n_withdrawn
    print(f"  Ratio déséquilibre : 1 withdrawn pour {ratio:.1f} non-withdrawn")
    print(f"  → Déséquilibre {'MODÉRÉ' if ratio < 4 else 'FORT'} — nécessite class_weight ou SMOTE")
    return df_info


def plot_target_distribution(df_info: pd.DataFrame):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    # Distribution originale (4 classes)
    counts = df_info["final_result"].value_counts()
    colors = ["#4CAF50", "#2196F3", "#FF9800", "#F44336"]
    axes[0].bar(counts.index, counts.values, color=colors)
    axes[0].set_title("Distribution de final_result (4 classes)", fontsize=12, fontweight="bold")
    axes[0].set_ylabel("Nombre d'apprenants")
    for i, (k, v) in enumerate(counts.items()):
        axes[0].text(i, v + 50, f"{v:,}\n({v/len(df_info)*100:.1f}%)", ha="center", fontsize=9)

    # Cible binaire
    target_counts = df_info["target"].value_counts().sort_index()
    labels = ["Non-withdrawn (0)", "Withdrawn (1)"]
    axes[1].bar(labels, target_counts.values, color=["#4CAF50", "#F44336"])
    axes[1].set_title("Cible binaire : Withdrawn vs Non-withdrawn", fontsize=12, fontweight="bold")
    axes[1].set_ylabel("Nombre d'apprenants")
    for i, v in enumerate(target_counts.values):
        axes[1].text(i, v + 50, f"{v:,}\n({v/len(df_info)*100:.1f}%)", ha="center", fontsize=9)

    plt.tight_layout()
    out = REPORTS_DIR / "oulad_target_distribution.png"
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n✓ Graphique sauvegardé → {out}")


def describe_relations():
    print(f"\n{'='*60}")
    print("RELATIONS ENTRE LES TABLES")
    print(f"{'='*60}")
    relations = [
        ("studentInfo", "courses", "code_module + code_presentation", "Table centrale → métadonnées du module"),
        ("studentInfo", "studentRegistration", "id_student + code_module + code_presentation", "Dates d'inscription/désinscription"),
        ("studentInfo", "studentAssessment", "id_student (via assessments)", "Résultats des évaluations"),
        ("studentInfo", "studentVle", "id_student + code_module + code_presentation", "Logs de clics sur les ressources"),
        ("assessments", "studentAssessment", "id_assessment", "Détails des évaluations (date limite, poids)"),
        ("vle", "studentVle", "id_site + code_module + code_presentation", "Métadonnées des ressources (type, semaine)"),
    ]
    print(f"{'Table A':20s} {'Table B':20s} {'Clé de jointure':40s} {'Description'}")
    print("-" * 120)
    for a, b, key, desc in relations:
        print(f"{a:20s} {b:20s} {key:40s} {desc}")


def main():
    print("OULAD — Phase 1 : Exploration du dataset\n")
    print("Chargement des tables...")
    dfs = load_all_tables()

    for name, df in dfs.items():
        summarize_table(name, df)

    describe_relations()

    df_info_with_target = analyze_target(dfs["studentInfo"])
    plot_target_distribution(df_info_with_target)

    print(f"\n{'='*60}")
    print("RÉSUMÉ PHASE 1")
    print(f"{'='*60}")
    total_students = len(dfs["studentInfo"])
    total_clicks = dfs["studentVle"]["sum_click"].sum()
    total_assessments = len(dfs["studentAssessment"])
    print(f"  Apprenants uniques      : {dfs['studentInfo']['id_student'].nunique():,}")
    print(f"  Inscriptions totales    : {total_students:,} (1 apprenant peut avoir plusieurs modules)")
    print(f"  Clics VLE totaux        : {total_clicks:,.0f}")
    print(f"  Soumissions évaluations : {total_assessments:,}")
    print(f"  Modules distincts       : {dfs['courses']['code_module'].nunique()}")
    print(f"  Présentations           : {dfs['courses'].shape[0]}")
    print("\n✓ Phase 1 terminée. Valider avant de passer à la Phase 2.")


if __name__ == "__main__":
    main()
