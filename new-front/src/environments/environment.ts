export const environment = {
  production: false,
  apiGateway: 'http://localhost:8091/api',
  apiGatewayUrl: 'http://localhost:8091',
  apiUrl: 'http://localhost:8091/api/community',
  usersApiUrl: 'http://localhost:8091/api/users',
  wsUrl: 'http://localhost:8084/ws',
  // Bascule mock/réel pour les services du module suivi (progression/logs/avis) — voir
  // src/app/core/providers/suivi.providers.ts. true = données mockées en mémoire (démo sans
  // backend), false = appels réels vers suivi-service via l'API Gateway.
  useMocks: true
};
