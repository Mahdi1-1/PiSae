export interface UserDiscoveryResponse {
    id: string;
    name: string;
    prenom: string;
    email: string;
    role: string;
    sector: string;
    bio: string;
    skills: string[];
    location: string;
    isConnected: boolean;
    hasPendingRequest: boolean;
}
