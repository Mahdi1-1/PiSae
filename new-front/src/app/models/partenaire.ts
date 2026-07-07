// partenaire.model.ts

export enum PartnerType {
  ACADEMIC   = 'ACADEMIC',
  INCUBATOR  = 'INCUBATOR',
  PUBLIC     = 'PUBLIC',
  COMPANY    = 'COMPANY',
  NONPROFIT  = 'NONPROFIT'
}

export enum PartnerStatus {
  ACTIVE     = 'ACTIVE',
  SUSPENDED  = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export interface OrganisationPartenaire {
  id: number;
  nom: string;
  type: PartnerType;
  description: string;
  siteWeb: string;
  contactNom: string;
  contactEmail: string;
  region: string;
  userId: number | null;
  statut: PartnerStatus;
}

export interface OrganisationPartenaireRequest {
  nom: string;
  type: PartnerType;
  description?: string;
  siteWeb?: string;
  contactNom: string;
  contactEmail: string;
  region?: string;
  userId?: number | null;
}

export interface ContactInfoRequest {
  nom: string;
  type: PartnerType;
  description?: string;
  siteWeb?: string;
  contactNom: string;
  contactEmail: string;
  region?: string;
}

// Keep old names as aliases so nothing else in the app breaks
export { PartnerType as TypePartenaire };
export { PartnerStatus as StatutPartenaire };