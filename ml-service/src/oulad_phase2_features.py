"""
OULAD - Phase 2 : Feature engineering
"""
import pandas as pd
import numpy as np
from scipy import stats
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "oulad"
OUT_DIR  = Path(__file__).parent.parent / "data"
OUT_DIR.mkdir(exist_ok=True)


# ── Chargement ────────────────────────────────────────────────────────────────

def load():
    print("Chargement des tables...")
    dfs = {}
    for name in ["studentInfo", "studentRegistration", "studentAssessment",
                 "studentVle", "vle", "assessments"]:
        dfs[name] = pd.read_csv(DATA_DIR / f"{name}.csv")
        print(f"  ✓ {name:25s} {dfs[name].shape}")
    return dfs


# ── Features VLE (logs de clics) ──────────────────────────────────────────────

def build_vle_features(svle: pd.DataFrame) -> pd.DataFrame:
    print("\n[VLE] Calcul des features comportementales...")
    KEY = ["id_student", "code_module", "code_presentation"]

    # 1. total_clicks, nb_active_days, avg_clicks_per_day
    agg = svle.groupby(KEY).agg(
        total_clicks   = ("sum_click", "sum"),
        nb_active_days = ("date",      "nunique"),
    ).reset_index()
    agg["avg_clicks_per_day"] = agg["total_clicks"] / agg["nb_active_days"].clip(lower=1)

    # 2. last_active_day
    last = svle.groupby(KEY)["date"].max().rename("last_active_day").reset_index()
    agg = agg.merge(last, on=KEY, how="left")

    # 3. days_before_start_activity (nb de jours négatifs avant le début)
    early = (svle[svle["date"] < 0]
             .groupby(KEY)["date"]
             .min()
             .abs()
             .rename("days_before_start_activity")
             .reset_index())
    agg = agg.merge(early, on=KEY, how="left")
    agg["days_before_start_activity"] = agg["days_before_start_activity"].fillna(0)

    # 4. click_trend : pente (scipy linregress) des clics hebdomadaires
    def weekly_slope(group):
        g = group.copy()
        g["week"] = g["date"] // 7
        weekly = g.groupby("week")["sum_click"].sum().reset_index()
        if len(weekly) < 3:
            return 0.0
        slope, *_ = stats.linregress(weekly["week"], weekly["sum_click"])
        return round(float(slope), 6)

    print("  [VLE] Calcul click_trend (linregress par apprenant)... peut prendre 1-2 min")
    trends = (svle.groupby(KEY)
              .apply(weekly_slope, include_groups=False)
              .rename("click_trend")
              .reset_index())
    agg = agg.merge(trends, on=KEY, how="left")
    agg["click_trend"] = agg["click_trend"].fillna(0)

    # 5. nb_resource_types
    resource_types = (svle.merge(
            pd.read_csv(DATA_DIR / "vle.csv")[["id_site","activity_type"]],
            on="id_site", how="left")
        .groupby(KEY)["activity_type"]
        .nunique()
        .rename("nb_resource_types")
        .reset_index())
    agg = agg.merge(resource_types, on=KEY, how="left")
    agg["nb_resource_types"] = agg["nb_resource_types"].fillna(0)

    print(f"  ✓ VLE features : {agg.shape}")
    return agg


# ── Features Assessment (évaluations) ─────────────────────────────────────────

def build_assessment_features(sa: pd.DataFrame, assessments: pd.DataFrame) -> pd.DataFrame:
    print("\n[ASSESSMENT] Calcul des features d'évaluation...")

    # Jointure avec les deadlines
    sa = sa.merge(assessments[["id_assessment","date","weight","assessment_type"]],
                  on="id_assessment", how="left")

    # Exclure les évaluations "Exam" (passées en fin de module, fuite potentielle)
    sa_no_exam = sa[sa["assessment_type"] != "Exam"].copy()

    KEY = ["id_student", "code_module", "code_presentation"]

    # On reconstitue la clé module/presentation via assessments
    sa_no_exam = sa_no_exam.merge(
        assessments[["id_assessment","code_module","code_presentation"]],
        on="id_assessment", how="left", suffixes=("", "_ass")
    )
    # Utilise les colonnes de la jointure si les originales sont absentes
    for col in ["code_module","code_presentation"]:
        alt = f"{col}_ass"
        if alt in sa_no_exam.columns:
            sa_no_exam[col] = sa_no_exam[col].fillna(sa_no_exam[alt])
            sa_no_exam.drop(columns=[alt], inplace=True)

    # nb_assessments_submitted
    nb_submitted = (sa_no_exam.groupby(KEY)
                    .size()
                    .rename("nb_assessments_submitted")
                    .reset_index())

    # avg_score
    avg_score = (sa_no_exam.groupby(KEY)["score"]
                 .mean()
                 .rename("avg_score")
                 .reset_index())

    # pct_late_submissions (date_submitted > date deadline)
    sa_no_exam["is_late"] = sa_no_exam["date_submitted"] > sa_no_exam["date"]
    pct_late = (sa_no_exam.groupby(KEY)["is_late"]
                .mean()
                .rename("pct_late_submissions")
                .reset_index())

    # first_assessment_score
    sa_sorted = sa_no_exam.sort_values("date_submitted")
    first_score = (sa_sorted.groupby(KEY)["score"]
                   .first()
                   .rename("first_assessment_score")
                   .reset_index())

    # nb_missing_assessments : nb d'évaluations existantes non soumises
    total_per_module = (assessments[assessments["assessment_type"] != "Exam"]
                        .groupby(["code_module","code_presentation"])
                        .size()
                        .rename("total_assessments")
                        .reset_index())

    # Merge pour calculer le nb manquant
    nb_submitted_copy = nb_submitted.copy()
    nb_submitted_copy = nb_submitted_copy.merge(total_per_module, on=["code_module","code_presentation"], how="left")
    nb_submitted_copy["nb_missing_assessments"] = (
        nb_submitted_copy["total_assessments"] - nb_submitted_copy["nb_assessments_submitted"]
    ).clip(lower=0)

    # Jointure finale
    feat = nb_submitted.merge(avg_score, on=KEY, how="outer")
    feat = feat.merge(pct_late, on=KEY, how="outer")
    feat = feat.merge(first_score, on=KEY, how="outer")
    feat = feat.merge(nb_submitted_copy[KEY + ["nb_missing_assessments"]], on=KEY, how="outer")

    print(f"  ✓ Assessment features : {feat.shape}")
    return feat


# ── Features studentInfo (démographiques) ─────────────────────────────────────

def build_info_features(info: pd.DataFrame) -> pd.DataFrame:
    print("\n[INFO] Encodage des features démographiques...")
    df = info.copy()

    # Cible binaire
    df["target"] = (df["final_result"] == "Withdrawn").astype(int)

    # Encodage ordinal age_band
    age_map = {"0-35": 0, "35-55": 1, "55<=": 2}
    df["age_band_enc"] = df["age_band"].map(age_map).fillna(1)

    # Encodage ordinal highest_education
    edu_map = {
        "No Formal quals": 0,
        "Lower Than A Level": 1,
        "A Level or Equivalent": 2,
        "HE Qualification": 3,
        "Post Graduate Qualification": 4,
    }
    df["highest_education_enc"] = df["highest_education"].map(edu_map).fillna(1)

    # Encodage ordinal imd_band (indice de défavorisation)
    imd_order = ["0-10%","10-20","20-30%","30-40%","40-50%","50-60%","60-70%","70-80%","80-90%","90-100%"]
    imd_map = {v: i for i, v in enumerate(imd_order)}
    df["imd_band_enc"] = df["imd_band"].map(imd_map)
    df["imd_band_enc"] = df["imd_band_enc"].fillna(df["imd_band_enc"].median())

    # Binary
    df["gender_enc"]     = (df["gender"] == "M").astype(int)
    df["disability_enc"] = (df["disability"] == "Y").astype(int)

    # OneHot region (13 valeurs — cardinalité modérée)
    region_dummies = pd.get_dummies(df["region"], prefix="region", drop_first=True)
    df = pd.concat([df, region_dummies], axis=1)

    keep_cols = (
        ["id_student","code_module","code_presentation","target",
         "studied_credits","num_of_prev_attempts",
         "age_band_enc","highest_education_enc","imd_band_enc",
         "gender_enc","disability_enc"]
        + list(region_dummies.columns)
    )
    print(f"  ✓ Info features : {df[keep_cols].shape}")
    return df[keep_cols]


# ── Features Registration ──────────────────────────────────────────────────────

def build_registration_features(reg: pd.DataFrame) -> pd.DataFrame:
    print("\n[REGISTRATION] Extraction de date_registration...")
    KEY = ["id_student","code_module","code_presentation"]
    feat = reg[KEY + ["date_registration"]].copy()
    feat["date_registration"] = feat["date_registration"].fillna(0)
    # NE PAS inclure date_unregistration (fuite de données)
    return feat


# ── Assemblage final ───────────────────────────────────────────────────────────

def assemble_and_analyze(info_feat, vle_feat, ass_feat, reg_feat):
    print("\n[MERGE] Assemblage du dataset final...")
    KEY = ["id_student","code_module","code_presentation"]

    df = info_feat.merge(vle_feat, on=KEY, how="left")
    df = df.merge(ass_feat,  on=KEY, how="left")
    df = df.merge(reg_feat,  on=KEY, how="left")

    # Imputation : 0 pour les apprenants sans activité VLE/assessment
    vle_cols = ["total_clicks","nb_active_days","avg_clicks_per_day",
                "days_before_start_activity","last_active_day","click_trend","nb_resource_types"]
    ass_cols = ["nb_assessments_submitted","avg_score","pct_late_submissions",
                "first_assessment_score","nb_missing_assessments"]

    for col in vle_cols:
        df[col] = df[col].fillna(0)

    # avg_score, first_assessment_score : médiane (0 serait trompeur)
    for col in ["avg_score","first_assessment_score"]:
        df[col] = df[col].fillna(df[col].median())

    for col in ["nb_assessments_submitted","pct_late_submissions","nb_missing_assessments"]:
        df[col] = df[col].fillna(0)

    print(f"\n{'='*60}")
    print("DATASET FINAL")
    print(f"{'='*60}")
    print(f"Shape      : {df.shape[0]:,} lignes × {df.shape[1]} colonnes")
    print(f"Withdrawn  : {df['target'].sum():,} ({df['target'].mean()*100:.1f}%)")
    print(f"Null totaux: {df.isnull().sum().sum()}")

    # Top 10 corrélations avec la cible
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numeric_cols = [c for c in numeric_cols if c != "target"]
    corr = df[numeric_cols + ["target"]].corr()["target"].drop("target")
    corr_abs = corr.abs().sort_values(ascending=False)

    print("\nTop 10 features corrélées avec la cible (|corr|) :")
    print(f"{'Feature':35s} {'Corr':>8s}  {'Direction'}")
    print("-" * 55)
    for feat, val in corr_abs.head(10).items():
        direction = "↑ risque" if corr[feat] > 0 else "↓ risque"
        print(f"  {feat:33s} {corr[feat]:+.4f}  {direction}")

    return df


def main():
    print("OULAD — Phase 2 : Feature Engineering\n")
    dfs = load()

    vle_feat  = build_vle_features(dfs["studentVle"])
    ass_feat  = build_assessment_features(dfs["studentAssessment"], dfs["assessments"])
    info_feat = build_info_features(dfs["studentInfo"])
    reg_feat  = build_registration_features(dfs["studentRegistration"])

    df_final = assemble_and_analyze(info_feat, vle_feat, ass_feat, reg_feat)

    out = OUT_DIR / "oulad_features.csv"
    df_final.to_csv(out, index=False)
    print(f"\n✓ Dataset sauvegardé → {out}")
    print(f"  Colonnes : {list(df_final.columns)}")
    print("\n✓ Phase 2 terminée. Valider avant de passer à la Phase 3.")


if __name__ == "__main__":
    main()
