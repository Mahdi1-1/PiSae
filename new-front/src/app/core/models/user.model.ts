export type UserRole = 'USER' | 'ADMIN' | 'MENTOR' | 'INVESTOR' | 'PARTNER' | 'PARTENAIRE' | 'ENTREPRENEUR' | 'EXPERT';

export interface User {
  id: number;
  name: string;
  prenom: string;
  email: string;
  dateInscription: string;
  statut: string;
  role: UserRole;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  INVESTOR = 'INVESTOR',
  PARTNER = 'PARTNER',
  PARTENAIRE = 'PARTENAIRE',
  ENTREPRENEUR = 'ENTREPRENEUR',
  EXPERT = 'EXPERT',
}

export interface AdminCreateUserRequest {
  name: string;
  prenom: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  id?: number;
  email?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  prenom: string;
  email: string;
  password: string;
}
