# Exposer les métriques Prometheus (déjà appliqué dans eureka-server, api-gateway, userPI)

Ce document décrit ce qui a déjà été fait dans les 3 `pom.xml` et les 3 fichiers de
configuration (`application.properties`/`application.yml`) — gardé ici comme référence si tu dois
reproduire la même chose sur un nouveau module.

## 1. Dépendance Maven ajoutée à chaque pom.xml

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

(le starter `spring-boot-starter-actuator` doit déjà être présent — il l'est normalement puisque
les healthchecks des Dockerfiles utilisent déjà /actuator/health)

## 2. Configuration ajoutée dans application.properties (ou .yml) de chaque service

```properties
management.endpoints.web.exposure.include=health,info,prometheus
management.endpoint.health.show-details=always
management.prometheus.metrics.export.enabled=true
```

Une fois ceci fait, chaque service expose ses métriques sur `/actuator/prometheus`,
exactement l'URL que Prometheus va scraper (voir devops/k8s/06-prometheus.yaml).

## 3. Vérification rapide (après déploiement)

```bash
kubectl port-forward svc/userpi 8081:8081 -n picloud
curl http://localhost:8081/actuator/prometheus | head -30
```

Tu dois voir des lignes comme `jvm_memory_used_bytes{...}` ou `http_server_requests_seconds_count{...}`.
Si la page est vide ou 404, vérifie l'étape 2 (l'exposition de l'endpoint prometheus est souvent
oubliée car `health` et `info` seuls sont exposés par défaut).

## 4. Deux pièges spécifiques à userPI (déjà corrigés)

- **Spring Security bloquait `/actuator/**`** : userPI a `spring-boot-starter-security` avec
  `.anyRequest().authenticated()`. Sans exception explicite, `/actuator/health` et
  `/actuator/prometheus` renvoyaient 401 — ce qui aurait cassé le `HEALTHCHECK` du Dockerfile et
  les probes K8s. Une règle `.requestMatchers("/actuator/**").permitAll()` a été ajoutée dans
  `SecurityConfiguration`.
- **L'indicateur de santé "mail" faisait passer `/actuator/health` à `DOWN`** : userPI a
  `spring-boot-starter-mail`, et Spring Boot ajoute automatiquement un health indicator qui teste
  la connexion SMTP réelle. Avec des identifiants absents/invalides (cas courant en dev/CI),
  `/actuator/health` renvoyait `503` alors que l'application fonctionnait normalement.
  `management.health.mail.enabled=false` désactive cet indicateur non-critique.
