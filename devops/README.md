# DevOps — pisae (eureka-server + api-gateway + userPI + new-front)

Ce dossier a été adapté au projet réel (`pisae`, voir `PROJECT_DOCUMENTATION.md` à la racine) :
noms de service, ports, dépendances et manifests correspondent au code effectivement présent
dans le repo, pas à un gabarit générique. Les Dockerfiles restent dans `devops/` (pas dupliqués
dans chaque module) : les pipelines les référencent via `docker build -f devops/... <contexte>`.

## Structure des fichiers livrés

```
devops/
├── backend/
│   ├── eureka-server/Dockerfile
│   ├── api-gateway/Dockerfile
│   ├── userPI/
│   │   ├── Dockerfile
│   │   └── pom-jacoco-snippet.xml   → référence, déjà appliqué dans les 3 pom.xml
│   └── EXPOSER-METRICS-PROMETHEUS.md → référence, déjà appliqué dans les 3 modules
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── sonar-project.properties
├── k8s/
│   ├── 00-namespace.yaml            (namespace "pisae")
│   ├── 01-mysql-config.yaml         (MySQL + Secret userpi-secrets pour OAuth2/SMTP)
│   ├── 02-eureka-server.yaml
│   ├── 03-userpi.yaml
│   ├── 04-api-gateway.yaml
│   ├── 05-frontend.yaml             (+ Ingress optionnel)
│   ├── 06-prometheus.yaml
│   └── 07-grafana.yaml
├── sonarqube/
│   └── docker-compose.yml
├── monitoring/
│   ├── prometheus.yml               → version locale/docker-compose (référence)
│   └── grafana/provisioning/        → datasources + dashboard "pisae - Vue d'ensemble backend"
└── jenkins/
    ├── Jenkinsfile-eureka-server-ci / -cd
    ├── Jenkinsfile-api-gateway-ci / -cd
    ├── Jenkinsfile-userpi-ci / -cd
    ├── Jenkinsfile-frontend-ci / -cd
```

Chaque microservice backend a son propre pipeline CI et CD (3 microservices × 2 = 6 pipelines),
plus CI/CD pour le frontend — 8 pipelines au total, comme demandé.

`k8s/06-prometheus.yaml` et `k8s/07-grafana.yaml` déploient Prometheus + Grafana directement sur
le cluster (config intégrée en ConfigMap) — les fichiers de `monitoring/` ne sont qu'une
référence/version locale (docker-compose) si tu veux tester hors cluster.

## Où placer chaque fichier dans ton repo

- **Rien à copier** pour les Dockerfiles backend/frontend ni pour `sonar-project.properties` :
  les pipelines les référencent directement dans `devops/` via `-f`/`-Dproject.settings`, avec le
  bon contexte de build (voir le détail dans chaque Jenkinsfile). Ça évite d'avoir deux copies
  du même Dockerfile qui divergent avec le temps.
- Le dossier `k8s/` reste sous `devops/k8s/` — tous les Jenkinsfiles et cette doc y font
  référence avec ce chemin complet (pas de déplacement à la racine du repo nécessaire).
- Les `Jenkinsfile-*` : chacun devient le `Jenkinsfile` d'un pipeline Jenkins distinct (voir
  configuration ci-dessous). Configure un job Jenkins par fichier, pointant dessus via l'option
  "Script Path".

## Étapes de mise en place

### 1. SonarQube (local)
```bash
cd devops/sonarqube
docker-compose up -d
```
Ouvre http://localhost:9000 (login par défaut `admin`/`admin`), crée un token dans *My Account > Security* — c'est le `sonar-token` à enregistrer dans Jenkins.

**Important** : SonarQube a besoin de `vm.max_map_count >= 262144` sur ta machine :
```bash
sudo sysctl -w vm.max_map_count=262144
```

### 2. Jenkins — credentials à configurer (Manage Jenkins > Credentials)
- `dockerhub-credentials` : username/password Docker Hub
- `sonar-token` : secret text, le token généré à l'étape 1
- `kubeconfig-credentials` : secret file, ton `~/.kube/config` (ou celui de Minikube)

### 3. Jenkins — outils (Manage Jenkins > Tools)
- Maven 3.9 → nommé `maven-3.9`
- JDK 21 → nommé `jdk-21`
- NodeJS 20 → nommé `node-20`

### 4. Créer les 8 pipelines Jenkins
Pour chacun : *New Item > Pipeline*, puis dans *Pipeline > Definition* choisir "Pipeline script from SCM", pointer sur ton repo Git, et renseigner le bon *Script Path* :

| Pipeline | Script Path |
|---|---|
| `eureka-server-ci` | `devops/jenkins/Jenkinsfile-eureka-server-ci` |
| `eureka-server-cd` | `devops/jenkins/Jenkinsfile-eureka-server-cd` |
| `api-gateway-ci` | `devops/jenkins/Jenkinsfile-api-gateway-ci` |
| `api-gateway-cd` | `devops/jenkins/Jenkinsfile-api-gateway-cd` |
| `userpi-ci` | `devops/jenkins/Jenkinsfile-userpi-ci` |
| `userpi-cd` | `devops/jenkins/Jenkinsfile-userpi-cd` |
| `frontend-ci` | `devops/jenkins/Jenkinsfile-frontend-ci` |
| `frontend-cd` | `devops/jenkins/Jenkinsfile-frontend-cd` |

Tu peux enchaîner CI → CD automatiquement en ajoutant un stage `build job: '<service>-cd', parameters: [...]` en fin de chaque CI, ou les garder manuels pour bien montrer les 2 étapes séparément à l'oral (souvent plus lisible en soutenance).

### 5. Remplacer les placeholders
Dans tous les fichiers : remplace `<ton-dockerhub-user>` par ton identifiant Docker Hub réel (manifests K8s + Jenkinsfiles).

Dans `devops/k8s/03-userpi.yaml`, le Secret `userpi-secrets` contient des valeurs `changeme` pour
Google OAuth2 et le SMTP — userPI ne démarre pas sans ces variables (`GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
`SMTP_FROM`), remplace-les par de vrais identifiants avant un déploiement réel.

### 6. Métriques Prometheus (déjà en place)
`spring-boot-starter-actuator` + `micrometer-registry-prometheus` sont déjà ajoutés aux 3 pom.xml
backend, avec `management.endpoints.web.exposure.include=health,info,prometheus` dans chaque
config. `/actuator/health` et `/actuator/prometheus` sont aussi explicitement autorisés dans
`SecurityConfiguration` de userPI (sinon Spring Security bloquait ces routes en 401, ce qui aurait
cassé le `HEALTHCHECK` Docker et les probes K8s). `management.health.mail.enabled=false` est
positionné pour que des identifiants SMTP invalides/absents ne fassent pas passer tout
`/actuator/health` à `DOWN` (voir `devops/backend/EXPOSER-METRICS-PROMETHEUS.md` pour le détail
d'origine).

### 7. Démarrage du cluster (Minikube)
```bash
minikube start
minikube addons enable ingress   # si tu utilises l'Ingress fourni
kubectl apply -f devops/k8s/
```

### 8. Accéder à Grafana
```bash
kubectl port-forward svc/grafana 3000:3000 -n pisae
```
Ouvre http://localhost:3000 — login `admin` / mot de passe défini dans `k8s/07-grafana.yaml` (Secret `grafana-secret`, `admin123` par défaut, à changer).
Le datasource Prometheus et le dashboard "pisae - Vue d'ensemble backend" sont provisionnés automatiquement au démarrage.

### 9. Accéder à Prometheus directement (optionnel, pour debug)
```bash
kubectl port-forward svc/prometheus 9090:9090 -n pisae
```
Ouvre http://localhost:9090/targets pour vérifier que les 3 services backend apparaissent en `UP`.

## Limitations connues (à mentionner à l'oral si besoin)

- **Tests unitaires frontend actuellement cassés** : `ng test` échoue à la compilation
  (`NG8001`/`NG8002` sur `<ng-icon>` dans `landing.component.html`) — un bug préexistant du code
  Angular, indépendant de ce pipeline DevOps. Le stage "Tests unitaires" de
  `Jenkinsfile-frontend-ci` échouera tant que ce composant n'est pas corrigé côté app.
- **Frontend build production** : `environment.ts` a `apiGatewayUrl: 'http://localhost:8091'` en
  dur (pas de `environment.prod.ts` ni de `fileReplacements` dans `angular.json`). En dehors d'un
  poste de dev où l'API Gateway écoute aussi sur `localhost:8091`, les appels API du frontend
  déployé ne fonctionneront pas sans passer par le reverse-proxy `/api/` de `nginx.conf` (qui, lui,
  route bien vers le Service K8s `api-gateway:8091`).
- **Secrets K8s** : `01-mysql-config.yaml` et `03-userpi.yaml` contiennent des Secrets en clair
  pour simplifier le TP — à l'oral, tu peux mentionner que c'est un raccourci pédagogique et
  qu'en production on utiliserait `kubectl create secret` ou un coffre-fort dédié.
- **Grafana en production** : le mot de passe admin (`admin123`) et le stockage `emptyDir`
  (dashboards perdus si le pod redémarre) sont des raccourcis pour le TP. En conditions réelles :
  Secret généré aléatoirement + PVC.
- **Pas de config-server** : ce projet n'a jamais eu de module Spring Cloud Config — seuls
  eureka-server, api-gateway et userPI existent en backend, donc ce dossier ne couvre que ces
  trois microservices.
