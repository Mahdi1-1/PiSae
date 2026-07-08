import { firstValueFrom } from 'rxjs';
import { RecommendationMockService } from './recommendation-mock.service';

describe('RecommendationMockService', () => {
  let service: RecommendationMockService;

  beforeEach(() => {
    service = new RecommendationMockService();
  });

  it('matchLevel() avec skills/description renvoie une prédiction ML_PREDICTION', async () => {
    const reponse = await firstValueFrom(service.matchLevel({
      skills: 'introduction, fondamentaux',
      description: 'Cours pour débutants',
      learnerLevel: 'Beginner',
    }));

    expect(reponse.source).toBe('ML_PREDICTION');
    expect(reponse.predictedDifficulty).toBe('Beginner');
    expect(reponse.difficultyUsed).toBe('Beginner');
    expect(reponse.matchScore).toBe(1.0);
  });

  it('matchLevel() sans skills/description mais avec declaredLevel bascule en DECLARED_LEVEL_FALLBACK', async () => {
    const reponse = await firstValueFrom(service.matchLevel({
      declaredLevel: 'Advanced',
      learnerLevel: 'Beginner',
    }));

    expect(reponse.source).toBe('DECLARED_LEVEL_FALLBACK');
    expect(reponse.predictedDifficulty).toBeNull();
    expect(reponse.difficultyUsed).toBe('Advanced');
    expect(reponse.confidence).toBeNull();
    expect(reponse.matchScore).toBe(0.0); // niveaux opposés
  });

  it('matchLevel() sans aucune donnée renvoie UNKNOWN', async () => {
    const reponse = await firstValueFrom(service.matchLevel({
      learnerLevel: 'Intermediate',
    }));

    expect(reponse.source).toBe('UNKNOWN');
    expect(reponse.difficultyUsed).toBeNull();
    expect(reponse.matchScore).toBeNull();
  });
});
