"""
Phase 5 - Selection finale du modele champion et sauvegarde des artefacts
de production dans ml-service/models/.

Decision (justifiee en Phase 3 + Phase 4):
  Le meilleur F1-macro brut (Phase 3) est MultinomialNB (0.5415), mais son
  analyse SHAP (Phase 4) montre que la decision repose presque exclusivement
  sur University/Category et quasiment pas sur le texte (Skills/Description).
  LogisticRegression est quasi equivalent en score (F1-macro 0.5305, dans
  l'ecart-type de la CV ~0.02) et sa decision repose a 70-80% sur le texte
  du cours (mots-cles coherents : theory, models, understand, management,
  statistics...). Pour un usage metier ou l'on veut pouvoir justifier "le
  cours est classe Advanced parce qu'il mentionne X, Y, Z", l'interpretabilite
  prime sur un gain de score non significatif -> CHAMPION = LogisticRegression.
"""
import shutil
import joblib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"

CHAMPION_NAME = "LogisticRegression"
src = MODELS_DIR / f"model_{CHAMPION_NAME}.joblib"
dst = MODELS_DIR / "champion_model.joblib"
shutil.copyfile(src, dst)

with open(MODELS_DIR / "champion_model.txt", "w") as f:
    f.write(
        f"{CHAMPION_NAME}\n"
        "Justification: F1-macro quasi equivalent au meilleur modele (Phase 3),\n"
        "mais decision SHAP dominee par le texte (Skills/Description) plutot\n"
        "que par University/Category (Phase 4) -> plus interpretable et plus\n"
        "aligne avec l'usage metier vise (matcher niveau apprenant/cours via\n"
        "competences reelles).\n"
    )

print(f"Modele champion final: {CHAMPION_NAME}")
print(f"Copie vers -> {dst}")
print("Artefacts de production disponibles dans ml-service/models/:")
for f in sorted(MODELS_DIR.glob("*")):
    print(f"  - {f.name}")
