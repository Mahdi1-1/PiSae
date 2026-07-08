# ---------- Runtime image : microservice de prediction (FastAPI) ----------
# Ne contient que ce qui est necessaire pour servir des predictions :
# le code applicatif (app/, src/predict.py) et les artefacts entraines
# (models/). Le code d'entrainement (notebooks/, phase1..5) et les
# donnees brutes (data/) ne sont pas embarques dans l'image.
FROM python:3.12-slim

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY requirements-service.txt .
RUN pip install --no-cache-dir -r requirements-service.txt

COPY app ./app
COPY src/predict.py ./src/predict.py
COPY src/__init__.py ./src/__init__.py
COPY models/champion_model.joblib ./models/champion_model.joblib
COPY models/tfidf_vectorizer.joblib ./models/tfidf_vectorizer.joblib
COPY models/university_encoder.joblib ./models/university_encoder.joblib
COPY models/category_encoder.joblib ./models/category_encoder.joblib
COPY models/label_encoder.joblib ./models/label_encoder.joblib

USER app

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
