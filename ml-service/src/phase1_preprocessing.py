"""
Phase 1 - Preprocessing du dataset Coursera pour la prediction de Difficulty Level.

Sortie:
  ml-service/data/coursera_clean.csv      -> dataset nettoye (avant vectorisation)
  ml-service/data/train.csv / test.csv    -> splits stratifies (colonnes brutes, texte inclus)
  ml-service/models/tfidf_vectorizer.joblib
  ml-service/models/university_encoder.joblib
  ml-service/models/category_encoder.joblib
  ml-service/models/label_encoder.joblib
  ml-service/data/X_train.npz / X_test.npz (features TF-IDF + encodees, sparse)
  ml-service/data/y_train.npy / y_test.npy
"""
import re
import joblib
import numpy as np
import pandas as pd
import scipy.sparse as sp
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
MODELS_DIR = ROOT / "models"
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

RAW_CSV = DATA_DIR / "Coursera.csv"

# ---------------------------------------------------------------------------
# 1. Chargement + resume
# ---------------------------------------------------------------------------
df = pd.read_csv(RAW_CSV)

print("=" * 70)
print("1. RESUME DU DATASET BRUT")
print("=" * 70)
print(f"Shape: {df.shape}")
print("\nTypes:")
print(df.dtypes)
print("\nValeurs manquantes (NaN natif pandas):")
print(df.isna().sum())
print("\nDistribution Difficulty Level:")
print(df["Difficulty Level"].value_counts(dropna=False))

# ---------------------------------------------------------------------------
# 2. Nettoyage de la colonne Skills -> Skills_clean + Category
# ---------------------------------------------------------------------------
# Format observe: compétences séparées par DOUBLE espace, ex:
#   "Drama  Comedy  peering  ...  unix shells arts-and-humanities music-and-art"
# Les 1-3 derniers tokens du dernier "chunk" (double-espace) sont les tags de
# categorie Coursera, reconnaissables car ils contiennent un tiret
# (ex: "business-strategy", "data-management", "arts-and-humanities").
# On les retire par la droite tant qu'ils contiennent un tiret.


def split_skills_category(raw: str):
    if not isinstance(raw, str) or not raw.strip():
        return [], []
    chunks = [c.strip() for c in re.split(r"  +", raw) if c.strip()]
    if not chunks:
        return [], []
    last_tokens = chunks[-1].split(" ")
    cats = []
    i = len(last_tokens) - 1
    while i >= 0 and "-" in last_tokens[i]:
        cats.append(last_tokens[i])
        i -= 1
    cats.reverse()
    remaining = " ".join(last_tokens[: i + 1]).strip()
    skills = chunks[:-1]
    if remaining:
        skills.append(remaining)
    return skills, cats


skills_categories = df["Skills"].apply(split_skills_category)
df["Skills_list"] = skills_categories.apply(lambda t: t[0])
df["Skills_clean"] = df["Skills_list"].apply(lambda lst: ", ".join(lst))
df["Category"] = skills_categories.apply(lambda t: " ".join(t[1]) if t[1] else np.nan)

print("\n" + "=" * 70)
print("2. NETTOYAGE SKILLS / CATEGORY")
print("=" * 70)
n_no_cat = df["Category"].isna().sum()
print(f"Lignes sans tag de categorie detecte: {n_no_cat} ({n_no_cat/len(df):.1%})")
print("Exemples:")
print(df[["Skills", "Skills_clean", "Category"]].head(5).to_string())

# ---------------------------------------------------------------------------
# 3. Course Rating -> float, "Not Calibrated" -> NaN (ligne conservee)
# ---------------------------------------------------------------------------
df["Course Rating"] = pd.to_numeric(df["Course Rating"], errors="coerce")

print("\n" + "=" * 70)
print("3. COURSE RATING")
print("=" * 70)
print(f"Valeurs manquantes apres conversion: {df['Course Rating'].isna().sum()}")
print(df["Course Rating"].describe())

# ---------------------------------------------------------------------------
# 4. Deduplication sur Course Name (garde la premiere occurrence)
# ---------------------------------------------------------------------------
before = len(df)
df = df.drop_duplicates(subset="Course Name", keep="first").reset_index(drop=True)
print("\n" + "=" * 70)
print("4. DEDUPLICATION")
print("=" * 70)
print(f"Lignes avant: {before}, apres: {len(df)}, doublons retires: {before - len(df)}")

# ---------------------------------------------------------------------------
# 5. Traitement des classes "Not Calibrated" et "Conversant"
# ---------------------------------------------------------------------------
# Volumes (sur dataset dedupe):
counts = df["Difficulty Level"].value_counts()
print("\n" + "=" * 70)
print("5. TRAITEMENT DES CLASSES Difficulty Level")
print("=" * 70)
print(counts)
print(
    "\nDecision:\n"
    "  - 'Not Calibrated' (~1.4% du dataset): ce n'est PAS un niveau de difficulte,\n"
    "    c'est un marqueur d'absence d'evaluation editoriale (meme semantique que\n"
    "    Course Rating='Not Calibrated'). On EXCLUT ces lignes de la cible car il\n"
    "    n'existe pas de 'vrai' label a apprendre.\n"
    "  - 'Conversant' (~5% du dataset): c'est un vrai niveau de difficulte utilise\n"
    "    par Coursera principalement pour les cours de langues, semantiquement le\n"
    "    plus proche de 'Intermediate' (connaissance de travail / usage courant,\n"
    "    pas debutant ni expert). On le FUSIONNE avec 'Intermediate' plutot que de\n"
    "    l'exclure, pour ne pas perdre ~5% des donnees et eviter une 5e classe\n"
    "    ultra-minoritaire qui degraderait l'entrainement."
)

df = df[df["Difficulty Level"] != "Not Calibrated"].copy()
df["Difficulty Level"] = df["Difficulty Level"].replace({"Conversant": "Intermediate"})

print("\nDistribution finale de la cible:")
print(df["Difficulty Level"].value_counts())

# ---------------------------------------------------------------------------
# 6. Feature engineering
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("6. FEATURE ENGINEERING")
print("=" * 70)

# Texte combine Skills nettoyees + Description pour le TF-IDF
df["text_for_tfidf"] = (
    df["Skills_clean"].fillna("") + " " + df["Course Description"].fillna("")
)

tfidf = TfidfVectorizer(
    max_features=400,
    stop_words="english",
    ngram_range=(1, 2),
    min_df=3,
)
X_tfidf = tfidf.fit_transform(df["text_for_tfidf"])
print(f"TF-IDF: {X_tfidf.shape[1]} features (vocabulaire max_features=400, ngram 1-2)")

# University: trop de categories (184) pour un one-hot direct -> on garde les
# top-N universites les plus frequentes, le reste regroupe sous "Other".
TOP_N_UNIV = 30
top_univ = df["University"].value_counts().nlargest(TOP_N_UNIV).index
df["University_grouped"] = df["University"].where(df["University"].isin(top_univ), "Other")

university_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
X_university = university_encoder.fit_transform(df[["University_grouped"]])
print(f"University (top {TOP_N_UNIV} + Other): {X_university.shape[1]} features")

category_encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
X_category = category_encoder.fit_transform(df[["Category"]].fillna("Unknown"))
print(f"Category: {X_category.shape[1]} features")

X = sp.hstack([X_tfidf, X_university, X_category], format="csr")
print(f"Matrice de features finale: {X.shape}")

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df["Difficulty Level"])
print(f"Classes encodees: {list(label_encoder.classes_)}")

# ---------------------------------------------------------------------------
# 7. Split train/test 80/20 stratifie
# ---------------------------------------------------------------------------
X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
    X, y, df.index, test_size=0.2, random_state=42, stratify=y
)

print("\n" + "=" * 70)
print("7. SPLIT TRAIN/TEST")
print("=" * 70)
print(f"Train: {X_train.shape}, Test: {X_test.shape}")
print("Distribution train:", pd.Series(y_train).value_counts().sort_index().to_dict())
print("Distribution test:", pd.Series(y_test).value_counts().sort_index().to_dict())

# ---------------------------------------------------------------------------
# 8. Sauvegardes
# ---------------------------------------------------------------------------
df.to_csv(DATA_DIR / "coursera_clean.csv", index=False)
df.loc[idx_train].to_csv(DATA_DIR / "train_raw.csv", index=False)
df.loc[idx_test].to_csv(DATA_DIR / "test_raw.csv", index=False)

sp.save_npz(DATA_DIR / "X_train.npz", X_train)
sp.save_npz(DATA_DIR / "X_test.npz", X_test)
np.save(DATA_DIR / "y_train.npy", y_train)
np.save(DATA_DIR / "y_test.npy", y_test)

joblib.dump(tfidf, MODELS_DIR / "tfidf_vectorizer.joblib")
joblib.dump(university_encoder, MODELS_DIR / "university_encoder.joblib")
joblib.dump(category_encoder, MODELS_DIR / "category_encoder.joblib")
joblib.dump(label_encoder, MODELS_DIR / "label_encoder.joblib")
joblib.dump(list(top_univ), MODELS_DIR / "top_universities.joblib")

print("\n" + "=" * 70)
print("RESUME FINAL")
print("=" * 70)
print(f"Dataset nettoye: {df.shape[0]} lignes")
print(f"Nombre total de features (TF-IDF + University + Category): {X.shape[1]}")
print(f"  - TF-IDF: {X_tfidf.shape[1]}")
print(f"  - University (one-hot): {X_university.shape[1]}")
print(f"  - Category (one-hot): {X_category.shape[1]}")
print(f"Train set: {X_train.shape[0]} lignes | Test set: {X_test.shape[0]} lignes")
print("Distribution des classes (dataset complet):")
print(df["Difficulty Level"].value_counts())
print("\nFichiers sauvegardes dans ml-service/data/ et ml-service/models/")
