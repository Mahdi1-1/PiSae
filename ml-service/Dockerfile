# ---------- Runtime image : microservice de prediction (FastAPI) ----------
# Contient les deux modeles :
#   - Difficulty Level (Coursera, LogisticRegression)
#   - Dropout prediction (OULAD, XGBoost)
# Le code d'entrainement (src/phase*) et les donnees brutes (data/) ne sont
# pas embarques dans l'image.
FROM python:3.12-slim

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY requirements-service.txt .
RUN pip install --no-cache-dir -r requirements-service.txt

# Code applicatif
COPY app ./app
COPY src/predict.py ./src/predict.py
COPY src/predict_dropout.py ./src/predict_dropout.py
COPY src/__init__.py ./src/__init__.py

# Artefacts modele 1 : Difficulty Level (Coursera)
COPY models/champion_model.joblib        ./models/champion_model.joblib
COPY models/tfidf_vectorizer.joblib      ./models/tfidf_vectorizer.joblib
COPY models/university_encoder.joblib    ./models/university_encoder.joblib
COPY models/category_encoder.joblib      ./models/category_encoder.joblib
COPY models/label_encoder.joblib         ./models/label_encoder.joblib
COPY models/background_summary.joblib    ./models/background_summary.joblib

# Artefacts modele 2 : Dropout (OULAD)
COPY models/oulad_model_XGBoost.joblib   ./models/oulad_model_XGBoost.joblib
COPY models/oulad_scaler.joblib          ./models/oulad_scaler.joblib
COPY models/oulad_feature_cols.joblib    ./models/oulad_feature_cols.joblib
COPY models/oulad_shap_explainer.joblib  ./models/oulad_shap_explainer.joblib

USER app

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
