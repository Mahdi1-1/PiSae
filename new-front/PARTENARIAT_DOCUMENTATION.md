# 📚 Documentation - Module Partenariat (Partners & Conventions)

## 📋 Table des matières
1. [Architecture Globale](#architecture-globale)
2. [Modèles de Données](#modèles-de-données)
3. [Services](#services)
4. [Composants](#composants)
5. [Routes et Permissions](#routes-et-permissions)
6. [Flux de Données](#flux-de-données)
7. [Cas d'Usage](#cas-dusage)

---

## 🏗️ Architecture Globale

Le module partenariat gère **deux entités principales** :

```
┌──────────────────────────────────────────────────────────────┐
│               MODULE PARTENARIAT                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1️⃣  ORGANISATIONS PARTENAIRES                               │
│      └─ Qui ? : Des partenaires (académiques, entreprises...) │
│      └─ Quoi ? : Leurs infos de contact et statut            │
│      └─ Service: PartenaireService                           │
│      └─ Composants: PartenarieListComponent                  │
│                     FormOrganisationComponent                │
│                     MonOrganisationComponent                 │
│                                                               │
│  2️⃣  CONVENTIONS                                             │
│      └─ Qui ? : Accord entre l'app (USER) et un partenaire   │
│      └─ Quoi ? : Dates + objectifs à atteindre              │
│      └─ Service: ConventionService                           │
│      └─ Composants: ConventionListComponent                  │
│                     FormConventionComponent                  │
│                                                               │
└──────────────────────────────────────────────────────────────┘

Relation:
┌─────────────────────────┐
│  Organisation Partenaire │
│  (ex: Université XYZ)   │
│  userId = 42 (PARTNER)  │
└────────────┬────────────┘
             │ lié à
             │ (1 org = 1 partner user)
             ▼
     ┌──────────────────┐
     │  Conventions     │
     │ (accords)        │
     │ (peut avoir +1)  │
     └──────────────────┘
         │ contient
         ▼
      Objectifs
     (à atteindre)
```

---

## 📦 Modèles de Données

### TypePartenaire (Types de Partenaires)

```typescript
export enum TypePartenaire {
  ACADEMIQUE = 'ACADEMIQUE',  // 🎓 Université, École
  INCUBATEUR = 'INCUBATEUR',  // 🚀 Startup, Incubateur
  PUBLIC     = 'PUBLIC',      // 🏛️  Gouvernement, Institution
  ENTREPRISE = 'ENTREPRISE',  // 🏢 Compagnie privée
  ASSOCIATIF = 'ASSOCIATIF'   // 🤝 Association, ONG
}
```

### StatutPartenaire (États de l'Organisation)

```typescript
export enum StatutPartenaire {
  EN_ATTENTE = 'EN_ATTENTE',  // ⏳ En attente d'activation
  ACTIF      = 'ACTIF',       // ✅ Actif et peut signer conventions
  SUSPENDU   = 'SUSPENDU',    // ⛔ Temporairement suspendu
  RESILIER   = 'RESILIER'     // 🗑️  Terminé / Arrêté
}
```

### OrganisationPartenaire (L'Organisation)

```typescript
export interface OrganisationPartenaire {
  id: number;                  // Identifiant unique
  nom: string;                 // Nom de l'organisation
  type: TypePartenaire;        // Type (ACADEMIQUE, ENTREPRISE, etc.)
  description: string;         // Description de l'org
  siteWeb: string;            // URL du site web
  contactNom: string;         // Nom du contact principal
  contactEmail: string;       // Email du contact
  region: string;             // Région (ex: "Tunis", "Sfax")
  userId: number | null;      // ID du user PARTNER lié (si existant)
  statut: StatutPartenaire;   // Statut actuel
}

// Pour créer/modifier une org
export interface OrganisationPartenaireRequest {
  nom: string;
  type: TypePartenaire;
  description?: string;        // optionnel
  siteWeb?: string;           // optionnel
  contactNom: string;
  contactEmail: string;
  region?: string;            // optionnel
  userId?: number | null;     // optionnel
}
```

### StatutConvention (États de l'Accord)

```typescript
export enum StatutConvention {
  BROUILLON = 'BROUILLON',    // 📝 En cours de rédaction
  SIGNEE    = 'SIGNEE',       // ✍️  Les deux parties ont confirmé
  ACTIVE    = 'ACTIVE',       // ✅ Convention active
  EXPIREE   = 'EXPIREE'       // ⏰ Expirée (après dateFin)
}
```

### StatutObjectif (États des Objectifs)

```typescript
export enum StatutObjectif {
  EN_COURS  = 'EN_COURS',     // ⏳ En cours de réalisation
  ATTEINT   = 'ATTEINT',      // ✅ Objectif atteint
  EN_RETARD = 'EN_RETARD',    // ⚠️  En retard
  ANNULE    = 'ANNULE'        // ❌ Annulé
}
```

### ResponsableObjectif (Qui est Responsable)

```typescript
export enum ResponsableObjectif {
  USER       = 'USER',        // Notre app est responsable
  PARTENAIRE = 'PARTENAIRE',  // Le partenaire est responsable
  LES_DEUX   = 'LES_DEUX'     // Les deux ensemble
}
```

### ConventionResponse (L'Accord Complet)

```typescript
export interface ConventionResponse {
  id: number;
  numeroConvention: string;           // Ex: "CONV-2025-001"
  userId: number;                     // ID du user qui crée
  organisationPartenaireId: number;   // ID de l'organisation
  organisationPartenaireNom: string;  // Nom de l'org
  dateDebut: string;                  // Quand ça commence
  dateFin: string;                    // Quand ça finit
  statut: StatutConvention;           // État actuel
  objectifs: ObjectifResponse[];      // Liste des objectifs
  
  // Confirmation
  confirmeParUser: boolean;           // L'app a confirmé ? ✅
  confirmeParPartenaire: boolean;     // Le partenaire a confirmé ? ✅
  modifieParRole: string | null;      // Qui a modifié last ("ROLE_USER", "ROLE_PARTNER")
  
  // Renouvellement
  renouvellementDemandeParRole: string | null;  // Qui demande le renouvellement ?
  
  // Documents
  documentUrl: string;                // URL du document PDF/etc
  signedAt: string;                   // Quand signé
}

// Pour créer/modifier une convention
export interface ConventionRequest {
  organisationPartenaireId: number;
  userId: number;
  dateDebut: string;
  dateFin: string;
}

// Objectifs d'une convention
export interface ObjectifResponse {
  id: number;
  conventionId: number;               // Quelle convention ?
  titre: string;                      // Titre de l'objectif
  description: string;                // Description
  responsable: ResponsableObjectif;   // Qui est responsable ?
  dateEcheance: string;               // Date limite
  statut: StatutObjectif;             // État (EN_COURS, ATTEINT, etc.)
  commentaire: string;                // Commentaires/notes
  dateCreation: string;               // Quand créé
}

// Pour créer/modifier un objectif
export interface ObjectifRequest {
  conventionId: number;
  titre: string;
  description?: string;
  responsable: ResponsableObjectif;
  dateEcheance?: string;
  commentaire?: string;
}
```

---

## 🔧 Services

### PartenaireService

**Localisation**: `src/app/services/partenaire.service.ts`

```typescript
// Chaque requête envoie les headers:
// X-User-Role: ROLE_ADMIN (ou USER, PARTNER)
// X-User-Id: 123
// (le backend utilise ça pour filtrer les données)

// ✅ Récupérer toutes les organisations
async getAll(): Promise<OrganisationPartenaire[]>
  → GET /api/organisations
  → Retourne: liste de toutes les orgs
  → Utilisé par: PartenarieListComponent, FormConventionComponent

// ✅ Récupérer une organisation par ID
async getById(id: number): Promise<OrganisationPartenaire>
  → GET /api/organisations/{id}
  → Retourne: une org spécifique
  → Utilisé par: MonOrganisationComponent, FormOrganisationComponent

// ✅ Récupérer une org par statut
async getByStatut(statut: StatutPartenaire): Promise<OrganisationPartenaire[]>
  → GET /api/organisations/statut/{statut}
  → Retourne: orgs filtrées par statut
  → Utilisé par: filtrage dans les listes

// ✅ Récupérer MON organisation (Partner-only)
async getMyDashboard(): Promise<OrganisationPartenaire>
  → Logique: 
    1. Récupère toutes les orgs (getAll())
    2. Cherche celle avec userId === monId
    3. Retourne ou lance erreur si pas trouvée
  → Utilisé par: MonOrganisationComponent

// ✅ Mettre à jour les infos de contact
async updateContactInfo(id: number, request: ContactInfoRequest): Promise<OrganisationPartenaire>
  → PUT /api/organisations/{id}/contact
  → Body: nom, type, description, siteWeb, contactNom, contactEmail, region
  → Utilisé par: MonOrganisationComponent (partner met à jour ses infos)

// ✅ Créer une nouvelle organisation (Admin)
async create(request: OrganisationPartenaireRequest): Promise<OrganisationPartenaire>
  → POST /api/organisations
  → Body: nom, type, description, siteWeb, contactNom, contactEmail, region, userId
  → Retourne: org créée avec son ID
  → Utilisé par: FormOrganisationComponent (mode création)

// ✅ Modifier une organisation (Admin)
async update(id: number, request: OrganisationPartenaireRequest): Promise<OrganisationPartenaire>
  → PUT /api/organisations/{id}
  → Body: nom, type, description, siteWeb, contactNom, contactEmail, region, userId
  → Utilisé par: FormOrganisationComponent (mode édition)

// ✅ Changer le statut (Admin)
async updateStatut(id: number, statut: StatutPartenaire): Promise<OrganisationPartenaire>
  → PATCH /api/organisations/{id}/statut?statut={statut}
  → Utilisé par: PartenarieListComponent (changement de statut)

// ✅ Lier un user PARTNER à une org (Admin)
async assignUser(orgId: number, userId: number): Promise<OrganisationPartenaire>
  → PUT /api/organisations/{orgId}/assign-user/{userId}
  → Utilisé par: FormOrganisationComponent (assign user au dropdown)

// ✅ Supprimer une organisation (Admin)
async delete(id: number): Promise<void>
  → DELETE /api/organisations/{id}
  → Utilisé par: PartenarieListComponent
```

### ConventionService

**Localisation**: `src/app/services/convention.service.ts`

```typescript
// De même, chaque requête envoie les headers (voir PartenaireService)

// ✅ Récupérer toutes les conventions (Admin)
async getAll(): Promise<ConventionResponse[]>
  → GET /api/conventions
  → Retourne: toutes les conventions

// ✅ Récupérer une convention par ID
async getById(id: number): Promise<ConventionResponse>
  → GET /api/conventions/{id}
  → Retourne: convention + ses objectifs

// ✅ Récupérer conventions d'un USER
async getByUser(userId: number): Promise<ConventionResponse[]>
  → GET /api/conventions/user/{userId}
  → Retourne: conventions créées par ce user
  → Utilisé par: ConventionListComponent (mode USER)

// ✅ Récupérer conventions d'une ORGANISATION (Partner)
async getByOrganisation(orgId: number): Promise<ConventionResponse[]>
  → GET /api/conventions/organisation/{orgId}
  → Retourne: conventions liées à cette org
  → Utilisé par: ConventionListComponent (mode PARTNER)

// ✅ Créer une convention
async create(req: ConventionRequest): Promise<ConventionResponse>
  → POST /api/conventions
  → Body: { organisationPartenaireId, userId, dateDebut, dateFin }
  → Retourne: convention créée (vide d'objectifs au départ)
  → Utilisé par: FormConventionComponent ("Créer")

// ✅ Modifier une convention (draft seulement)
async update(id: number, req: ConventionRequest): Promise<ConventionResponse>
  → PUT /api/conventions/{id}
  → Utilisé par: FormConventionComponent ("Éditer" en BROUILLON)

// ✅ Changer le statut d'une convention
async updateStatut(id: number, statut: StatutConvention): Promise<ConventionResponse>
  → PATCH /api/conventions/{id}/statut?statut={statut}
  → Utilisé par: ConventionListComponent (changement manuel de statut)

// ✅ Supprimer une convention
async delete(id: number): Promise<void>
  → DELETE /api/conventions/{id}

// ✅ CONFIRMER une convention (signature numérique)
async confirmer(id: number): Promise<ConventionResponse>
  → POST /api/conventions/{id}/confirmer
  → Logique backend:
    1. Marque confirmeParUser = true OU confirmeParPartenaire = true (selon role)
    2. Si les deux ont confirmé → change statut en SIGNEE
  → Utilisé par: FormConventionComponent (bouton "Confirmer")

// ✅ Demander le renouvellement
async demanderRenouvellement(id: number): Promise<ConventionResponse>
  → PATCH /api/conventions/{id}/renouvellement/demander
  → Marque renouvellementDemandeParRole = "ROLE_USER" (ou ROLE_PARTNER)
  → Utilisé par: ConventionListComponent (bouton "Demander renouvellement")

// ✅ Accepter le renouvellement
async accepterRenouvellement(id: number, newTerms: ConventionRequest): Promise<ConventionResponse>
  → POST /api/conventions/{id}/renouvellement/accepter
  → Body: nouvelles dates + organisationPartenaireId
  → Crée une nouvelle convention avec les nouvelles dates
  → Utilisé par: FormConventionComponent

// ✅ Récupérer objectifs d'une convention
async getObjectifs(conventionId: number): Promise<ObjectifResponse[]>
  → GET /api/objectifs/convention/{conventionId}
  → Retourne: tous les objectifs de cette convention
  → Utilisé par: FormConventionComponent (charge existing)

// ✅ Créer un objectif
async createObjectif(req: ObjectifRequest): Promise<ObjectifResponse>
  → POST /api/objectifs
  → Body: conventionId, titre, description, responsable, dateEcheance, commentaire
  → Utilisé par: FormConventionComponent (ajoute objectif)

// ✅ Modifier un objectif
async updateObjectif(id: number, req: ObjectifRequest): Promise<ObjectifResponse>
  → PUT /api/objectifs/{id}

// ✅ Changer le statut d'un objectif
async updateObjectifStatut(id: number, statut: StatutObjectif, commentaire?: string): Promise<ObjectifResponse>
  → PATCH /api/objectifs/{id}/statut?statut={statut}&commentaire={commentaire}
  → Utilisé par: suivi des objectifs

// ✅ Supprimer un objectif
async deleteObjectif(id: number): Promise<void>
  → DELETE /api/objectifs/{id}
```

---

## 🎨 Composants

### 1️⃣ PartenarieListComponent

```
📍 Localisation: src/app/modules/partenaire/partenarie-list/

🎯 Objectif:
  Afficher la liste de TOUTES les organisations partenaires
  Disponible pour: ADMIN, USER, PARTNER

🔧 Fonctionnalités:
  • Chargement: PartenaireService.getAll()
  • Affichage: liste paginée (9 par page)
  • Filtrage:
    - 🔍 Recherche: nom, email, région (texte)
    - 🏷️  Type: ACADEMIQUE, INCUBATEUR, PUBLIC, ENTREPRISE, ASSOCIATIF
    - 📊 Statut: EN_ATTENTE, ACTIF, SUSPENDU, RESILIER
  
  • Actions:
    ADMIN:
    - ➕ Créer: → /partenariat/form
    - ✏️  Éditer: → /partenariat/form/:id
    - 🗑️  Supprimer: PartenaireService.delete(id)
    
    USER/PARTNER:
    - 👁️  Voir détails: → /partenariat/mon-organisation/:id (lecture seule)

  • Affichage sophistiqué:
    - Icône par type (🎓 ACADEMIQUE, 🚀 INCUBATEUR, etc.)
    - Badge de couleur par statut
    - Email de contact visible

🧮 Propriétés clés:
  - organisations: OrganisationPartenaire[]
  - filtered: OrganisationPartenaire[] (après filtres appliqués)
  - searchTerm, selectedType, selectedStatut: string
  - currentPage, pageSize: number
  - isAdmin: boolean (détermine les boutons affichés)
```

### 2️⃣ FormOrganisationComponent

```
📍 Localisation: src/app/modules/partenaire/form-organisation/

🎯 Objectif (ADMIN ONLY):
  Créer ou modifier une organisation partenaire
  Route: /partenariat/form (CREATE)
  Route: /partenariat/form/:id (EDIT)

🔧 Fonctionnalités:

  MODE CRÉATION (/partenariat/form):
  • Formulaire vide
  • Champs:
    ✓ nom (requis, min 2 chars)
    ✓ type (requis, dropdown)
    ✓ contactNom (requis)
    ✓ contactEmail (requis, email format)
    ○ description (optionnel)
    ○ siteWeb (optionnel)
    ○ région (optionnel)
    ○ userId (optionnel, dropdown de partners disponibles)
  
  • Dropdown userId:
    - Charge tous les users avec role = PARTNER
    - Filtre ceux non encore assignés à une org
    - Permet assigner un user à cette org
  
  • Submit:
    PartenaireService.create(payload)
    → Success: "Créée avec succès !"
    → Redirige: /partenariat/list

  MODE ÉDITION (/partenariat/form/:id):
  • Charge les données: PartenaireService.getById(id)
  • Pré-remplit le formulaire
  • Champs éditables: tous sauf l'ID
  • Dropdown userId: garde l'user assigné dans la liste
  • Submit:
    PartenaireService.update(id, payload)
    → Success: "Mise à jour avec succès !"
    → Redirige: /partenariat/list

🧮 Propriétés clés:
  - form: FormGroup
  - isEditMode: boolean
  - editId: number | null
  - types: TypePartenaire[]
  - statuts: StatutPartenaire[]
  - availablePartners: User[] (dropdown)
  - currentUserId: number | null (l'user assigné en mode édition)
  - errorMessage, successMessage: string
```

### 3️⃣ MonOrganisationComponent

```
📍 Localisation: src/app/modules/partenaire/mon-organisation/

🎯 Objectif:
  PARTNER: voir et éditer SON organisation
  USER/ADMIN: voir une org en lecture seule

🔧 Fonctionnalités:

  PARTNER viewing OWN org (/partenariat/mon-organisation):
  • Charge: PartenaireService.getMyDashboard()
    (cherche l'org avec userId === myId)
  
  • Affichage:
    - Infos: nom, type, description, région, contact
    - Statut de l'org
  
  • Édition possible:
    - Mode édition pour contact info
    - Bouton "Edit contactInfo"
    - Champs éditables: nom, contactNom, contactEmail, siteWeb, région, description, type
    - Submit: PartenaireService.updateContactInfo()
  
  • Action: "Faire une demande de convention"
    → Bouton émet vers /partenariat/conventions/form?orgId={id}
    → Lance le processus de création de convention
  
  ANYONE viewing another org (/partenariat/mon-organisation/:id):
  • Charge: PartenaireService.getById(id)
  • Mode LECTURE SEULE (viewOnly = true)
  • Pas de bouton Edit
  • Affiche l'info de contact


🧮 Propriétés clés:
  - org: OrganisationPartenaire | null
  - form: FormGroup
  - viewOnly: boolean (édition si false)
  - isPartner: boolean (détermine si édition autorisée)
  - isEditing: boolean (toggle entre lecture/édition)
  - types: TypePartenaire[]
  - errorMessage, successMessage: string
```

### 4️⃣ ConventionListComponent

```
📍 Localisation: src/app/modules/partenaire/convention-list/

🎯 Objectif:
  Afficher la liste des conventions filtrée par rôle

🔧 Fonctionnalités:

  DATA LOADING (selon le rôle):
  
  ADMIN:
  • Charge: ConventionService.getAll()
  • Voit: TOUTES les conventions
  
  USER:
  • Charge: ConventionService.getByUser(myUserId)
  • Voit: conventions qu'IL a créées
  
  PARTNER:
  • Étape 1: Récupère toutes les orgs
  • Étape 2: Trouve SON org (userId === myUserId)
  • Étape 3: Charge: ConventionService.getByOrganisation(myOrgId)
  • Voit: conventions liées à SON org

  AFFICHAGE & FILTRAGE:
  • Paginé: 6 conventions par page
  • Filtrage:
    - 🔍 Recherche: numeroConvention, organisation name
    - 📊 Statut: BROUILLON, SIGNEE, ACTIVE, EXPIREE

  ACTIONS:
  • Cliquer pour voir détails
  • Boutons selon statut de convention

  COULEURS BADGE:
  - BROUILLON: gris
  - SIGNEE:    orange
  - ACTIVE:    vert
  - EXPIREE:   rouge

🧮 Propriétés clés:
  - conventions: ConventionResponse[]
  - filtered: ConventionResponse[] (après filtres)
  - statuts: StatutConvention[]
  - isUser, isPartner, isAdmin: boolean
  - myUserId, myOrgId: number
  - errorMessage, successMessage: string
```

### 5️⃣ FormConventionComponent

```
📍 Localisation: src/app/modules/partenaire/form-convention/

🎯 Objectif:
  Créer/Éditer une convention + ses objectifs
  Route: /partenariat/conventions/form (CREATE)
  Route: /partenariat/conventions/form/:id (EDIT)
  Paramètre query: ?orgId={id} (pré-remplit org au CREATE)

🔧 Fonctionnalités:

  MODE CRÉATION (/partenariat/conventions/form):
  • Form fields:
    ✓ organisationPartenaireId (requis)
    ✓ dateDebut (requis)
    ✓ dateFin (requis)
    ✓ objectifs[] (FormArray)
  
  • Dropdown organisation:
    Charge: PartenaireService.getAll()
    USER voit: toutes les orgs
    PARTNER voit: sa propre org seulement
  
  • Objectifs:
    FormArray d'objectifs:
    - titre (requis)
    - description (optionnel)
    - dateEcheance (optionnel)
    
    Tout objectif créé au CREATE:
    - responsable = "PARTENAIRE" si user actuel
    - responsable = "USER" si partenaire actuel
    
    Boutons:
    ➕ Ajouter objectif
    🗑️  Supprimer objectif
  
  • Submit:
    1. Crée convention: ConventionService.create()
    2. Pour chaque objectif: ConventionService.createObjectif()
    3. Success: "Convention créée avec succès !"
    4. Redirige: /partenariat/conventions

  MODE ÉDITION (/partenariat/conventions/form/:id):
  • Charge convention: ConventionService.getById(id)
  • Statut doit être BROUILLON pour pouvoir éditer
  • Charge SEULEMENT les objectifs que J'ai écrit:
    - Si je suis USER: affiche objectifs avec responsable=PARTENAIRE
    - Si je suis PARTNER: affiche objectifs avec responsable=USER
  
  • AFFICHAGE SÉPARÉ (UI complexe):
    Section 1: "Objectifs proposés PAR L'AUTRE PARTIE" (lecture seule)
    → Si USER: voit ce que PARTNER doit faire (responsable=USER)
    → Si PARTNER: voit ce que USER doit faire (responsable=PARTENAIRE)
    
    Section 2: "Mes objectifs proposés" (éditable)
    → Si USER: mes objectifs (responsable=PARTENAIRE)
    → Si PARTNER: mes objectifs (responsable=USER)
  
  • Logique de CONFIRMATION:
    Règles:
    1. Ne peut confirmer si ACTIVE ou EXPIREE
    2. Ne peut confirmer deux fois
    3. Si JE suis le dernier à modifier (modifieParRole === myRole):
       → Ne peut confirmer que SI l'autre a déjà confirmé
    
    Bouton "Confirmer et Signer":
    - Marque confirmeParUser/Partenaire = true
    - Si les 2 ont confirmé → statut → SIGNEE
    - Submit: ConventionService.confirmer(id)

  Logique de RENOUVELLEMENT:
    Bouton "Demander renouvellement":
    - Set renouvellementDemandeParRole = myRole
    - Submit: ConventionService.demanderRenouvellement(id)
    
    Pages "Accepter renouvellement":
    - Affiche l'ancienne convention
    - Formulaire de nouvelles dates
    - Submit: ConventionService.accepterRenouvellement(id, newTerms)

🧮 Propriétés clés:
  - form: FormGroup
  - conventionId: number | null
  - existing: ConventionResponse | null (pour édition)
  - myUserId, myRole: number, string
  - isUser, isPartner, isAdmin: boolean
  - organisations: OrganisationPartenaire[]
  - objectifsArray: FormArray
  - otherPartyObjectifs: ObjectifResponse[] (getter, lecture seule)
  - myWrittenObjectifs: ObjectifResponse[] (getter, mes objectifs)
  - errorMessage, successMessage: string

Méthodes importantes:
  - loadExisting(id): charge la convention
  - loadOrganisations(): charge liste des orgs
  - addObjectif(): ajoute un champ objectif vide
  - removeObjectif(index): supprime un objectif
  - onSubmit(): crée/édite convention + objectifs
  - canConfirm(): logique pour savoir si "Confirmer" est cliquable
  - isEditable(): true si statut === BROUILLON
```

---

## 🔐 Routes et Permissions

### Routes du Module Partenariat

```typescript
// src/app/modules/partenaire/partenaire-routing.module.ts

Toutes les routes sont protégées par: canActivate: [authGuard]

┌─────────────────────────────────────────────────────────────┐
│  ORGANISATIONS PARTENAIRES                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /partenariat/list                                          │
│  → PartenarieListComponent                                  │
│  → Qui: ADMIN, USER, PARTNER (authentifiés)                │
│  → Rôle dans admin? NO                                      │
│  → Affichage: ADMIN voit boutons CRUD                       │
│             : USER/PARTNER voient liste seule              │
│                                                              │
│  /partenariat/form         (CREATE)                         │
│  → FormOrganisationComponent                                │
│  → Qui: ADMIN uniquement                                    │
│  → Rôle requis: ADMIN (data.role)                           │
│  → Crée nouvelle organisation                               │
│                                                              │
│  /partenariat/form/:id     (EDIT)                           │
│  → FormOrganisationComponent                                │
│  → Qui: ADMIN uniquement                                    │
│  → Rôle requis: ADMIN (data.role)                           │
│  → Édite organisation existante                             │
│                                                              │
│  /partenariat/mon-organisation  (MY ORG)                    │
│  → MonOrganisationComponent                                 │
│  → Qui: PARTNER uniquement                                  │
│  → Rôle requis: PARTNER (data.role)                         │
│  → PARTNER see & edit their org                             │
│                                                              │
│  /partenariat/mon-organisation/:id  (VIEW OTHER)            │
│  → MonOrganisationComponent                                 │
│  → Qui: ADMIN, USER, PARTNER                                │
│  → Rôle requis: NO (authentifiés seulement)                 │
│  → Read-only view of another org                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CONVENTIONS                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /partenariat/conventions   (LIST)                          │
│  → ConventionListComponent                                  │
│  → Qui: ADMIN, USER, PARTNER (authentifiés)                │
│  → Affichage filtré par rôle                                │
│                                                              │
│  /partenariat/conventions/form         (CREATE)             │
│  → FormConventionComponent                                  │
│  → Qui: ADMIN, USER, PARTNER                                │
│  → Rôle requis: NO (tous authentifiés peuvent créer)        │
│  → Query param: ?orgId={id} (optionnel)                     │
│                                                              │
│  /partenariat/conventions/form/:id     (EDIT)               │
│  → FormConventionComponent                                  │
│  → Qui: ADMIN, USER, PARTNER                                │
│  → Rôle requis: NO                                          │
│  → Édite si statut === BROUILLON seulement                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Matrice d'Accès

| Action | ADMIN | USER | PARTNER |
|--------|-------|------|---------|
| Voir liste orgs | ✅ | ✅ | ✅ |
| Créer org | ✅ SEUL | ❌ | ❌ |
| Éditer org | ✅ SEUL | ❌ | ❌ |
| Supprimer org | ✅ SEUL | ❌ | ❌ |
| Voir/Éditer sa propre org | ➖ (N/A) | ❌ | ✅ |
| Voir autre org | ✅ | ✅ | ✅ |
| Créer convention | ✅ | ✅ | ✅ |
| Voir ses conventions | ✅ tous | ✅ les siennes | ✅ les siennes |
| Éditer convention (BROUILLON) | ✅ | ✅ | ✅ |
| Confirmer convention | ✅ | ✅ | ✅ |
| Supprimer convention | ✅ | ✅ | ✅ |

---

## 🔄 Flux de Données

### Flux 1: Création d'une Organisation (Admin)

```
START
  ↓
┌─────────────────────────────────────────────┐
│ Admin va à /partenariat/form                │
│ (FormOrganisationComponent - CREATE mode)   │
└────────┬────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ Formulaire vide                             │
│ Dropdown userId charge partenaires dispo    │
│ UserService.getAllUsers() + filter PARTNER  │
└────────┬────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ Admin remplit:                              │
│ • nom (requis)                              │
│ • type (requis dropdown)                    │
│ • contactNom (requis)                       │
│ • contactEmail (requis, format email)       │
│ • region, description, siteWeb (opt)        │
│ • userId (opt, dropdown)                    │
└────────┬────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ Submit → onSubmit()                         │
│ • Validation: OK ? ✅                       │
│ • isEditMode = false → CREATE branch        │
└────────┬────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ PartenaireService.create(payload)           │
│ POST /api/organisations                     │
│ Headers: X-User-Role, X-User-Id             │
│ Body: { nom, type, ..., userId }            │
└────────┬────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ Backend valide & crée en BDD                │
│ Retourne: { id: 123, ...complete org }      │
└────────┬────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────┐
│ Frontend affiche succès                     │
│ "Organisation créée avec succès !"          │
│ Navigate → /partenariat/list                │
└─────────────────────────────────────────────┘
```

### Flux 2: Partner Voit Son Organisation

```
START (Partner connecté, userId=42)
  ↓
┌──────────────────────────────────────────────┐
│ Partner va à /partenariat/mon-organisation   │
│ (MonOrganisationComponent, mode: "MY ORG")   │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ ngOnInit détecte: pas d'ID en param          │
│ viewOnly = false                             │
│ canEdit = true (car est owner)               │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ loadMyOrg()                                  │
│ 1. PartenaireService.getAll()                │
│    GET /api/organisations                    │
│    Reçoit: [org1, {id:42, userId:42, ...}]  │
│ 2. Cherche: org où userId === 42             │
│ 3. Trouve org avec id=42                     │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ Affiche: org infos en lecture seule          │
│ Boutons:                                     │
│ • "Edit Contact Info"                       │
│ • "Faire une demande de convention"          │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ USER clicks "Edit Contact Info"              │
│ enableEdit() → form.enable()                 │
│ isEditing = true                             │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ Partner édite les champs:                    │
│ • nom, contactNom, contactEmail              │
│ • siteWeb, région, description               │
│ • type (dropdown)                            │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ Submit → onSubmit()                          │
│ Payload: ContactInfoRequest {nom, type...}  │
│ PartenaireService.updateContactInfo(id, pl) │
│ PUT /api/organisations/{id}/contact          │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ Backend vérifie permissions                  │
│ (Partner peut éditer son propre contact)    │
│ Update en BDD ✅                             │
│ Retourne org mise à jour                     │
└────────┬─────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│ Frontend affiche succès                      │
│ "Mise à jour avec succès !"                  │
│ isEditing = false → back to read-only        │
└──────────────────────────────────────────────┘
```

### Flux 3: Créer une Convention (User crée accord avec Partner)

```
START (User créé convention)
  ↓
┌────────────────────────────────────────────────┐
│ User va à /partenariat/conventions/form        │
│ (FormConventionComponent)                      │
│ ngOnInit: pas d'ID → CREATE mode               │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ Formulaire initialisation:                     │
│ • loadOrganisations()                          │
│   PartenaireService.getAll()                   │
│   → dropdown affiche toutes orgs               │
│                                                │
│ • objectifsArray: vide au départ               │
│   Click "➕ Ajouter objectif"                  │
│   → ajoute un FormGroup vide                   │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ User remplit:                                  │
│ • Sélectionne une organisation (ex: Univ XYZ) │
│ • dateDebut (requis)                           │
│ • dateFin (requis)                             │
│ • Objectifs (FormArray):                       │
│   - ➕ Ajoute 3 objectifs                      │
│   - Pour chaque: titre, description, dateEch. │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ Submit → onSubmit()                            │
│ • Validation: form.invalid ? → return          │
│ • isEditMode = false → CREATE branch           │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ STEP 1: Créer la convention                    │
│ ConventionService.create({                     │
│   organisationPartenaireId: 42,                │
│   userId: 10 (current user),                   │
│   dateDebut: "2025-04-01",                     │
│   dateFin: "2026-04-01"                        │
│ })                                             │
│ POST /api/conventions                          │
│ Retourne: { id: 100, statut: BROUILLON, ... }  │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ STEP 2: Créer chaque objectif                  │
│ Pour chaque objectif du formulaire:            │
│ ConventionService.createObjectif({             │
│   conventionId: 100,                           │
│   titre: "...",                                │
│   description: "...",                          │
│   responsable: PARTENAIRE, # ← important!     │
│   dateEcheance: "..."                          │
│ })                                             │
│ POST /api/objectifs × 3                        │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ All submissions successful ✅                  │
│ • Convention créée (BROUILLON)                 │
│ • 3 Objectifs créés                            │
│ • Statut ready pour Partner à confirmer        │
└────────┬───────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────┐
│ Frontend affiche succès                        │
│ "Convention créée avec succès !"               │
│ Navigate → /partenariat/conventions            │
└────────────────────────────────────────────────┘
```

### Flux 4: Partner Affirme / Signe la Convention

```
START (Partner et User en negotiation)
  ↓
┌──────────────────────────────────────────────────┐
│ Convention statut: BROUILLON                      │
│                                                  │
│ confirmeParUser: true (User a confirmé)          │
│ confirmeParPartenaire: false (Partner pas encore)│
│                                                  │
│ Partner va à /partenariat/conventions/:id (edit) │
│ (FormConventionComponent, mode: EDIT)            │
└────────┬─────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ loadExisting(id)                                 │
│ Récupère convention ALL data                     │
│ Séparation des objectifs:                        │
│                                                  │
│ myWrittenObjectifs (lecture seule):             │
│ → Objectifs que USER a écrit (responsable=USER) │
│ → Partner voit ce que User attend de lui        │
│                                                  │
│ otherPartyObjectifs (éditable):                 │
│ → Objectifs que Partner a écrit (responsable=PARTENAIRE)
│ → Partner peut éditer ses propres objectifs     │
└────────┬─────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Partner effectue changements si besoin           │
│ • Édite ses objectifs                            │
│ • Met à jour descriptions/dates                  │
│ • Click "Enregistrer" pour sauvegarder           │
│   → ConventionService.updateObjectif()           │
└────────┬─────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Partner revoit les contractual terms:            │
│ • dates de convention au complet                 │
│ • todos proposés s'il y en a (from User)         │
│ • dates d'échéance objectifs                     │
│                                                  │
│ Partner click "Confirmer et Signer"              │
│ (button visible car canConfirm() = true)         │
└────────┬─────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Submit → confirmer()                             │
│ ConventionService.confirmer(id)                  │
│ POST /api/conventions/{id}/confirmer             │
│ Headers: X-User-Role: ROLE_PARTNER               │
└────────┬─────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Backend logic:                                   │
│ 1. Marque confirmeParPartenaire = true           │
│ 2. Vérifie confirmeParUser = true ? (OUI)        │
│ 3. Change statut → SIGNEE                        │
│ 4. Retourne convention updated                   │
└────────┬─────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────┐
│ Frontend affiche succès                          │
│ "Convention confirmée et signée !"               │
│ Statut badge change: BROUILLON → SIGNEE         │
│ Bouton "Confirmer" disparaît                     │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Cas d'Usage

### Case 1: Admin Crée une Organisation Partenaire

```
Admin screen:
  /partenariat/form
    ↓ remplit formulaire
    ↓ sélectionne un user PARTNER disponible
    ↓ submit
    ↓ PartenaireService.create()
    ↓ Org créée + user linkée
    ↓ Redirige /partenariat/list
    ✅ Succès
```

### Case 2: Partner Voit et Édite Son Organisation

```
Partner connecté:
  /partenariat/mon-organisation
    ↓ loadMyOrg() → cherche par userId
    ↓ Affiche org infos (read-only par défaut)
    ↓ Click "Edit"
    ↓ Form devient éditable
    ↓ Partner met ses infos à jour
    ↓ Submit
    ↓ PartenaireService.updateContactInfo()
    ↓ Infos mises à jour
    ✅ Success

  Aussi visible: button "Faire une demande de convention"
    ↓ Navigate à /partenariat/conventions/form?orgId=xyz
    ↓ Commence processus de convention
```

### Case 3: User Crée une Convention avec Partner

```
User connecté:
  /partenariat/conventions/form
    ↓ Sélectionne une organisation
    ↓ Définit dateDebut & dateFin
    ↓ Ajoute 3 objectifs que le PARTNER doit faire
    ↓ Submit
    ↓ ConventionService.create() + 3× createObjectif()
    ↓ Convention créée (BROUILLON)
    ↓ Partner peut voir dans sa liste
    ↓ User confirme sa participation
    ↓ Attend confirmation du Partner
    ✅ Convention en BROUILLON, en attente Partner
```

### Case 4: Partner Confirme et Signe la Convention

```
Partner connecté:
  /partenariat/conventions/:id (edit mode)
    ↓ Lit les objectifs du User
    ↓ Voit ce qu'on attend de lui
    ↓ Crée ses propres objectifs (ce qu'il attend du User)
    ↓ Édite si besoin
    ↓ Click "Confirmer et Signer"
    ↓ ConventionService.confirmer()
    ↓ Backend: User confirmé déjà → change statut SIGNEE
    ↓ Convention ACTIVE / prêt pour suivi
    ✅ Convention SIGNEE
```

### Case 5: Admin Affiche la Liste Complète

```
Admin access:
  /partenariat/list
    ↓ Voir ALL organisations
    ↓ Voir butttons:
      • "Ajouter"    → /partenariat/form
      • "Éditer"     → /partenariat/form/:id
      • "Supprimer"
    ↓ Actions CRUD complètes

  /partenariat/conventions
    ↓ Voir ALL conventions
    ↓ Dropdown statut pour filter
    ✅ Vue d'ensemble complète
```

---

## 📊 Résumé des Flux Objectifs

### Convention Lifecycle

```
┌──────────────┐
│    CREATE    │  Organisation + User + dates + objectifs → Convention généré BROUILLON
└───────┬──────┘
        │
        ▼
  ┌──────────────┐
  │  NEGOTIATION │  Les deux parties éditent les objectifs / termes (BROUILLON seulement)
  └───────┬──────┘
          │
          ▼
    ┌──────────────┐
    │   CONFIRM    │  User confirme sa part → ready
    │              │  Partner confirme sa part → SIGNEE
    └───────┬──────┘
            │
            ▼
      ┌──────────────┐
      │    ACTIVE    │  Commencent à travailler sur les objectifs
      └───────┬──────┘
              │
              ▼
        ┌──────────────┐
        │  EXPIRES     │  Date fin atteinte →  EXPIREE ou RENOUVELER
        │ or RENEW     │
        └──────────────┘
```

---

**Fin de Documentation** ✅

**Merci d'avoir lu! 🎉**
