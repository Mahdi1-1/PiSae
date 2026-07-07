export const USER_API_BASE = 'http://localhost:8091/api';
export const EVENT_API_BASE = 'http://localhost:8091/api';
export const GATEWAY_API_BASE = 'http://localhost:8091/api';
export const COMMUNITY_API_BASE = 'http://localhost:8091/api/community';
export const PROJECT_API_BASE = 'http://localhost:8091/api/projects';
// suivi-service (progression/logs/avis) : passe par l'API Gateway comme les autres.
// ATTENTION — nécessite qu'une route Gateway vers suivi-service soit ajoutée côté backend
// (api-gateway/src/main/java/.../GatewayRoutes.java) avant de pouvoir passer useMocks à false.
export const SUIVI_API_BASE = 'http://localhost:8091/api';
