# Integration REST avec suivi-service

`ml-service` est un microservice **Python/FastAPI** independant, non enregistre
dans Eureka (il n'est pas un service Spring). `suivi-service` doit l'appeler
comme un service HTTP externe, via une URL configurable
(`ml.service.url`, par ex. `http://ml-service:8000` en k8s/Docker Compose,
`http://localhost:8000` en local).

Aucun code Java n'est ajoute a ce stade : cette page decrit uniquement le
contrat REST a implementer cote `suivi-service` (ex: via `RestTemplate` ou
`WebClient`) lors d'une prochaine iteration.

## POST /predict-difficulty

Predit le niveau de difficulte d'un cours a partir de ses competences et de
sa description, pour matcher le niveau du cours au niveau de l'apprenant
dans le moteur de recommandation.

**Requete**

```
POST http://ml-service:8000/predict-difficulty
Content-Type: application/json
```

```json
{
  "skills": "python programming, data structures, algorithms",
  "description": "This course introduces the fundamentals of programming in Python for absolute beginners."
}
```

**Reponse (200 OK)**

```json
{
  "difficulty": "Beginner",
  "confidence": 0.62,
  "probabilities": {
    "Advanced": 0.12,
    "Beginner": 0.62,
    "Intermediate": 0.26
  }
}
```

- `difficulty` : `"Beginner"` | `"Intermediate"` | `"Advanced"`
- `confidence` : probabilite associee a la classe predite (max des 3 probas)
- `probabilities` : distribution complete, utile si `suivi-service` veut
  appliquer son propre seuil de decision plutot que de faire confiance
  aveuglement a `difficulty`

**Erreur (422 Unprocessable Entity)** si `skills` et `description` sont
tous les deux vides.

## GET /health

```
GET http://ml-service:8000/health
```

```json
{ "status": "ok" }
```

A utiliser pour le health check du conteneur / de l'orchestrateur (deja
configure dans le `Dockerfile` via `HEALTHCHECK`).

## Limite connue a prendre en compte cote appelant

Le modele a un F1-macro d'environ 0.53 sur le jeu de test (voir
[README.md](README.md)) : ce n'est **pas un classifieur fiable a lui seul**.
Il est recommande d'utiliser `confidence`/`probabilities` comme un signal
d'appoint dans le score de recommandation (ex: ponderation), plutot que de
filtrer strictement les cours sur `difficulty` seule.
