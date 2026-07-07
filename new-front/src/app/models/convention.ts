

export enum StatutConvention {
  DRAFT      = 'DRAFT',
  SIGNED     = 'SIGNED',
  ACTIVE     = 'ACTIVE',
  COMPLETED  = 'COMPLETED',
  EXPIRED    = 'EXPIRED'
}

export enum StatutObjectif {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED    = 'FINISHED',
  LATE        = 'LATE',
  CANCELLED   = 'CANCELLED'
}

export enum ResponsableObjectif {
  USER       = 'USER',
  PARTENAIRE = 'PARTENAIRE',
  LES_DEUX   = 'LES_DEUX'
}

export interface ObjectifResponse {
  id: number;
  conventionId: number;
  titre: string;
  description?: string;
  responsable: ResponsableObjectif;
  // dateEcheance REMOVED
  statut: StatutObjectif;
  commentaire?: string;
  dateCreation?: string;
}

export interface ObjectifRequest {
  conventionId: number;
  titre: string;
  description?: string;
  responsable: ResponsableObjectif;
  // dateEcheance REMOVED
  commentaire?: string;
}

export interface ConventionResponse {
  id: number;
  numeroConvention?: string;
  userId: number;
  organisationPartenaireId: number;
  organisationPartenaireNom: string;

  // Dates are null until the first party confirms (they are set at signature time)
  dateDebut?: string;
  dateFin?: string;

  objectifs: ObjectifResponse[];
  statut: StatutConvention;
  documentUrl?: string;
  signedAt?: string;

  confirmeParUser: boolean;
  confirmeParPartenaire: boolean;
  modifieParRole?: string;
  renouvellementDemandeParRole?: string;

  signatureUser?: string;
  signaturePartenaire?: string;
}

export interface ConventionRequest {
  organisationPartenaireId: number;
  userId: number;
  // Dates are optional — set at confirmation time, not at creation
  dateDebut?: string;
  dateFin?: string;
}