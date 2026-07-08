import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RecommendationServiceContract } from './recommendation.service';
import { DifficultyLevel, MatchLevelRequest, MatchLevelResponse } from '../models/recommendation.model';

const LATENCY_MS = 300;
const NIVEAUX: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

function matchScore(a: DifficultyLevel, b: DifficultyLevel): number {
  const distance = Math.abs(NIVEAUX.indexOf(a) - NIVEAUX.indexOf(b));
  return 1 - distance / 2;
}

// Heuristique par mots-clés, simule grossièrement ml-service (dont le F1-macro réel n'est
// de toute façon que ~0.53 — voir ml-service/README.md) juste pour donner un rendu plausible
// en mode démo sans backend.
function predireHeuristique(skills: string, description: string): DifficultyLevel {
  const texte = `${skills} ${description}`.toLowerCase();
  if (/(avancé|advanced|expert|maîtris|architecture|orchestration|sécurité)/.test(texte)) {
    return 'Advanced';
  }
  if (/(introduction|fondamentaux|débutant|beginner|bases|zéro à)/.test(texte)) {
    return 'Beginner';
  }
  return 'Intermediate';
}

export class RecommendationMockService implements RecommendationServiceContract {
  matchLevel(request: MatchLevelRequest): Observable<MatchLevelResponse> {
    const hasText = !!(request.skills?.trim() || request.description?.trim());
    let response: MatchLevelResponse;

    if (hasText) {
      const predicted = predireHeuristique(request.skills ?? '', request.description ?? '');
      response = {
        predictedDifficulty: predicted,
        difficultyUsed: predicted,
        source: 'ML_PREDICTION',
        confidence: 0.55,
        matchScore: matchScore(predicted, request.learnerLevel),
      };
    } else if (request.declaredLevel) {
      response = {
        predictedDifficulty: null,
        difficultyUsed: request.declaredLevel,
        source: 'DECLARED_LEVEL_FALLBACK',
        confidence: null,
        matchScore: matchScore(request.declaredLevel, request.learnerLevel),
      };
    } else {
      response = {
        predictedDifficulty: null,
        difficultyUsed: null,
        source: 'UNKNOWN',
        confidence: null,
        matchScore: null,
      };
    }

    return of(response).pipe(delay(LATENCY_MS));
  }
}
