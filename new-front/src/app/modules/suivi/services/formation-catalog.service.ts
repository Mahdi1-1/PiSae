import { Injectable } from '@angular/core';
import { FormationSummary } from '../models/formation-catalog.model';

// PLACEHOLDER : voir formation-catalog.model.ts. Ce service n'a pas de contrepartie "réelle"
// (pas de useMocks) car aucun backend ne fournit ces données actuellement — c'est un
// catalogue local fixe, juste pour donner un nom lisible aux formationId de suivi-service.
const FORMATIONS: FormationSummary[] = [
  { id: 10, nom: 'Introduction à Spring Boot', description: 'Les fondamentaux du framework Spring Boot', skills: 'spring boot, java, rest api, dependency injection' },
  { id: 11, nom: 'Angular avancé', description: 'Signals, standalone components et RxJS avancé', skills: 'angular, typescript, rxjs, signals, standalone components' },
  { id: 12, nom: 'Architecture microservices', description: 'Eureka, API Gateway, communication inter-services', skills: 'microservices, eureka, api gateway, service discovery, distributed systems' },
  { id: 13, nom: 'MySQL pour développeurs', description: 'Modélisation, requêtes, indexation', skills: 'mysql, sql, database design, indexing' },
  { id: 14, nom: 'DevOps avec Docker & Kubernetes', description: 'Conteneurisation et orchestration', skills: 'docker, kubernetes, devops, containerization, orchestration' },
  { id: 15, nom: 'Sécurité des applications web', description: 'OWASP Top 10, JWT, OAuth2', skills: 'web security, owasp, jwt, oauth2, authentication' },
  { id: 16, nom: 'TypeScript de zéro à expert', description: 'Typage avancé, generics, décorateurs', skills: 'typescript, generics, decorators, type system' },
  { id: 17, nom: "Tests automatisés (JUnit & Jasmine)", description: 'Stratégies de test unitaire et d\'intégration', skills: 'unit testing, junit, jasmine, integration testing, test automation' },
];

@Injectable({ providedIn: 'root' })
export class FormationCatalogService {

  getAll(): FormationSummary[] {
    return FORMATIONS;
  }

  getById(id: number): FormationSummary | undefined {
    return FORMATIONS.find(f => f.id === id);
  }

  // Utilisé par l'UI pour toujours afficher quelque chose de lisible, même pour un
  // formationId absent du catalogue (ex: données de test créées ailleurs).
  getNomOrFallback(id: number): string {
    return this.getById(id)?.nom ?? `Formation #${id}`;
  }
}
