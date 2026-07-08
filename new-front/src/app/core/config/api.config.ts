export const USER_API_BASE = 'http://localhost:8091/api';
export const EVENT_API_BASE = 'http://localhost:8091/api';
export const GATEWAY_API_BASE = 'http://localhost:8091/api';
export const COMMUNITY_API_BASE = 'http://localhost:8091/api/community';
export const PROJECT_API_BASE = 'http://localhost:8091/api/projects';
// suivi-service (progression/logs/avis/recommendation) : passe par l'API Gateway comme les
// autres (route ajoutée dans GatewayRoutes.java + application.yml, lb("suivi-service")).
export const SUIVI_API_BASE = 'http://localhost:8091/api';
