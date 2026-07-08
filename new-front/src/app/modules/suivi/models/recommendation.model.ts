// Correspond à org.example.suiviservice.Enum.DifficultyLevel (backend)
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// Correspond à MatchLevelRequest (backend)
export interface MatchLevelRequest {
  skills?: string;
  description?: string;
  declaredLevel?: DifficultyLevel;
  learnerLevel: DifficultyLevel;
}

// Correspond à MatchLevelResponse (backend)
export type MatchLevelSource = 'ML_PREDICTION' | 'DECLARED_LEVEL_FALLBACK' | 'UNKNOWN';

export interface MatchLevelResponse {
  predictedDifficulty: DifficultyLevel | null;
  difficultyUsed: DifficultyLevel | null;
  source: MatchLevelSource;
  confidence: number | null;
  matchScore: number | null;
}
