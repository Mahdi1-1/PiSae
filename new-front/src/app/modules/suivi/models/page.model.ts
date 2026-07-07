// Forme JSON exacte renvoyée par Spring Data pour un Page<T> (voir les controllers de
// suivi-service : GET /api/progression, /api/logs, /api/avis avec Pageable).
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante (0-indexée)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}
