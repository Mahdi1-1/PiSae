# 📚 Documentation - Partie Utilisateur (User Management)

## 📋 Table des matières
1. [Architecture Globale](#architecture-globale)
2. [Authentification (Auth Service)](#authentification-auth-service)
3. [Gestion des Utilisateurs (User Service)](#gestion-des-utilisateurs-user-service)
4. [Modèles de Données](#modèles-de-données)
5. [Composants](#composants)
6. [Services](#services)
7. [Intercepteurs et Guards](#intercepteurs-et-guards)
8. [Modules](#modules)
9. [Flux de Données](#flux-de-données)

---

## 🏗️ Architecture Globale

L'application gère deux domaines principaux :

```
┌─────────────────────────────────────────────────────────┐
│                   ANGULAR FE                             │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌──────────────────┐      │
│  │  AUTH MODULE    │         │   USER MODULE    │      │
│  ├─────────────────┤         ├──────────────────┤      │
│  │  • Login        │         │  • Profile       │      │
│  │  • Register     │         │  • User List     │      │
│  │  • OAuth2       │         │  • Form (CRUD)   │      │
│  │  • Reset Pass   │         │  • Set Password  │      │
│  └─────────────────┘         └──────────────────┘      │
│         ▲                            ▲                   │
│         │ POST                       │ GET/POST/PUT/DEL  │
│         └────────────────┬───────────┘                   │
│                          │                               │
│              ┌───────────▼────────────┐                 │
│              │   TOKEN MANAGEMENT     │                 │
│              │  • AuthService (JWT)   │                 │
│              │  • JwtInterceptor      │                 │
│              │  • AuthGuard           │                 │
│              └───────────┬────────────┘                 │
│                          │ Bearer Token                 │
└──────────────────────────┼────────────────────────────┘
                           │
                  http://localhost:8090
                  POST   /api/auth/login
                  POST   /api/auth/register
                  GET    /api/users
                  POST   /api/users/admin/create
                  PUT    /api/users
                  DELETE /api/users/:id
```

---

## 🔐 Authentification (Auth Service)

### 📁 Localisation
- **Service**: `src/app/core/services/auth.service.ts`
- **Intercepteur**: `src/app/core/interceptors/jwt.interceptor.ts`
- **Guard**: `src/app/core/services/auth.guard.ts`

### 🔌 AuthService - Méthodes principales

```typescript
// ✅ Inscription (Enregistrement)
async register(request: RegisterRequest): Promise<AuthResponse>
  → POST /api/auth/register
  → Sauvegarde le token JWT reçu
  → Stocke les données utilisateur en localStorage

// ✅ Connexion
async login(request: LoginRequest): Promise<AuthResponse>
  → POST /api/auth/login
  → Sauvegarde le token JWT et les meta infos utilisateur

// ✅ Déconnexion
logout(): void
  → Nettoie le localStorage (token, userId, role, email)
  → Redirige vers /auth/login

// ✅ Gestion du Token JWT
saveToken(token: string): void
  → Stocke le token en localStorage
  → Décode le token et extrait:
    - userId
    - role (enlève le préfixe 'ROLE_')
    - email (du champ 'sub')

getToken(): string | null
  → Récupère le token du localStorage

isLoggedIn(): boolean
  → Vérifie si l'utilisateur est authentifié ET que le token n'a pas expiré
  → Compare Date.now() < payload.exp * 1000

// ✅ Récupération des données utilisateur
getRole(): string          → Récupère le rôle (ADMIN, USER, etc.)
getUserId(): number        → Récupère l'ID utilisateur
isAdmin(): boolean         → true si rôle === ADMIN
isUser(): boolean          → true si rôle === USER

// ✅ Décodage du JWT (JWT Token Decode)
private decodeToken(token: string): any
  → Extrait la partie payload du token (token.split('.')[1])
  → Décode le Base64
  → Parse le JSON
  → Retourne un objet avec: userId, role, sub (email), exp (expiration)
```

### 🔄 Flux d'Authentification

```
1. Utilisateur remplit le formulaire de login
   ↓
2. LoginComponent.onSubmit() 
   ↓
3. AuthService.login() envoie POST /api/auth/login
   ↓
4. Backend retourne { token: "eyJhbG..." }
   ↓
5. AuthService.saveToken() sauvegarde:
   - localStorage['token']    → le JWT
   - localStorage['userId']   → extrait du JWT
   - localStorage['role']     → extrait du JWT
   - localStorage['email']    → extrait du JWT
   ↓
6. Router redirige vers /user/profile
```

### 🛡️ JWT Interceptor

**Localisation**: `src/app/core/interceptors/jwt.interceptor.ts`

```typescript
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ Récupère le token du service
  const token = authService.getToken();
  
  // ✅ Ajoute le header Authorization à chaque requête
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;
  
  // ✅ Intercepte les erreurs 401 (token expiré/invalide)
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();        // Nettoie localStorage
        router.navigate(['/auth/login']); // Redirige
      }
      return throwError(() => error);
    })
  );
};
```

**Comportement**:
- Chaque requête HTTP reçoit automatiquement le header `Authorization: Bearer {token}`
- Si le serveur retourne 401 → déconnexion automatique

### 🚪 AuthGuard

**Localisation**: `src/app/core/services/auth.guard.ts`

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // 1️⃣ Vérifie que l'utilisateur est authentifié
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;  // ❌ Accès refusé
  }
  
  // 2️⃣ Vérifie le rôle si la route le demande
  const requiredRole = route.data['role'];
  if (requiredRole && authService.getRole() !== requiredRole) {
    router.navigate(['/user/profile']);
    return false;  // ❌ Accès refusé
  }
  
  return true;     // ✅ Accès autorisé
};
```

**Utilisation dans les routes**:
```typescript
// Exemple dans user-routing.module.ts
{
  path: 'list',
  component: UserListComponent,
  canActivate: [authGuard],
  data: { role: 'ADMIN' }  // ← Seul l'admin peut accéder
}
```

---

## 👥 Gestion des Utilisateurs (User Service)

### 📁 Localisation
- **Service**: `src/app/core/services/user.service.ts`
- **Models**: `src/app/core/models/user.model.ts`

### 🔌 UserService - Méthodes CRUD

```typescript
// ✅ Récupérer tous les utilisateurs
async getAllUsers(): Promise<User[]>
  → GET /api/users
  → Utilisé par: UserListComponent

// ✅ Récupérer un utilisateur par ID
async getUserById(id: number): Promise<User>
  → GET /api/users/{id}
  → Utilisé par: ProfileComponent, FormUserComponent

// ✅ Créer un nouvel utilisateur (Admin)
async createUser(request: AdminCreateUserRequest): Promise<User>
  → POST /api/users/admin/create
  → Champs: name, prenom, email, password, role
  → Utilisé par: FormUserComponent (mode création)

// ✅ Mettre à jour un utilisateur
async updateUser(user: User, requestingUserId: number): Promise<User>
  → PUT /api/users
  → Ajoute le header: X-User-Id: {requestingUserId}
  → Utilisé par: ProfileComponent, FormUserComponent (mode édition)

// ✅ Supprimer un utilisateur
async deleteUser(id: number): Promise<void>
  → DELETE /api/users/{id}
  → Utilisé par: UserListComponent

// ✅ Définir le mot de passe (Admin)
async setPassword(id: number, password: string): Promise<void>
  → POST /api/users/{id}/set-password
  → Utilisé par: SetPasswordComponent

// ✅ Changer le mot de passe (Utilisateur connecté)
async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void>
  → PUT /api/users/{id}/change-password
  → Utilisé par: ProfileComponent
```

### 🔄 Flux CRUD (Super CRUD)

```
┌─────────────────────────────────────────────────────────┐
│            GESTION COMPLÈTE DES UTILISATEURS            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CREATE (Créer)                                         │
│  └─ UserList → "Ajouter" → FormUser (mode création)    │
│     └─ FormUserComponent.onSubmit()                    │
│        └─ UserService.createUser()                     │
│           └─ POST /api/users/admin/create              │
│                                                          │
│  READ (Lire)                                            │
│  └─ UserList                                           │
│     └─ UserService.getAllUsers()                       │
│        └─ GET /api/users                               │
│                                                          │
│  UPDATE (Mettre à jour)                                │
│  ├─ Profile (ses propres infos)                        │
│  │  └─ ProfileComponent.onSubmit()                     │
│  │     └─ UserService.updateUser()                     │
│  │        └─ PUT /api/users                            │
│  │                                                      │
│  └─ UserList → Modifier → FormUser (mode édition)      │
│     └─ FormUserComponent avec :id                      │
│        └─ UserService.updateUser()                     │
│           └─ PUT /api/users                            │
│                                                          │
│  DELETE (Supprimer)                                    │
│  └─ UserList → Supprimer                              │
│     └─ UserListComponent.deleteUser(id)               │
│        └─ UserService.deleteUser(id)                  │
│           └─ DELETE /api/users/{id}                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Modèles de Données

### User Model
```typescript
// src/app/core/models/user.model.ts

export interface User {
  id: number;
  name: string;           // Nom de famille
  prenom: string;        // Prénom
  email: string;
  dateInscription: string;
  statut: string;        // active, inactive, suspended, etc.
  role: 'USER' | 'ADMIN' | 'MENTOR' | 'INVESTOR' | 'PARTNER';
}

export enum Role {
  USER     = 'USER',
  ADMIN    = 'ADMIN',
  MENTOR   = 'MENTOR',
  INVESTOR = 'INVESTOR',
  PARTNER  = 'PARTNER'
}

// Requête pour créer un utilisateur par l'admin
export interface AdminCreateUserRequest {
  name: string;
  prenom: string;
  email: string;
  password: string;
  role: Role;
}

// Réponse du serveur après auth
export interface AuthResponse {
  token: string;  // JWT Bearer token
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
```

### JWT Token Structure
```
Format: header.payload.signature

Payload décodé (exemple):
{
  "sub": "user@example.com",        // Email (du champ 'sub')
  "userId": 123,                     // ID utilisateur
  "role": "ROLE_ADMIN",              // Rôle (avec préfixe ROLE_)
  "iat": 1234567890,                 // Issued at
  "exp": 1234571490                  // Expiration (timestamp)
}

Sauvegardé dans localStorage après nettoyage:
- token: "eyJhbGc..."
- userId: "123"
- role: "ADMIN"              (sans le préfixe ROLE_)
- email: "user@example.com"
```

---

## 🎨 Composants

### 1️⃣ Auth Module (`src/app/modules/auth/`)

#### LoginComponent
```
📍 Localisation: src/app/modules/auth/login/
📁 Fichiers: login.component.ts, login.component.html, login.component.css

🎯 Objectif: 
  - Authentifier l'utilisateur via email/password
  - Authentification OAuth2 via Google

🔧 Fonctionnalités:
  • Formulaire: email (requis, email valide) + password (requis, min 6 chars)
  • Submit: AuthService.login() → sauvegarde token → redirige /user/profile
  • Bouton Google: accès à http://localhost:8090/oauth2/authorization/google
  • Redirige automatiquement si déjà connecté (/user/profile)

🧮 Propriétés:
  - loginForm: FormGroup
  - errorMessage: string
  - isLoading: boolean
```

#### RegisterComponent
```
📍 Localisation: src/app/modules/auth/register/
📁 Fichiers: register.component.ts, register.component.html, register.component.css

🎯 Objectif:
  - Créer un nouveau compte utilisateur
  - Valider les données avant envoi

🔧 Fonctionnalités:
  • Formulaire: name, prenom, email, password (confirmé)
  • Submit: AuthService.register() → login auto → redirige /user/profile

🧮 Propriétés:
  - registerForm: FormGroup
  - errorMessage: string
  - isLoading: boolean
```

#### OAuth2CallbackComponent
```
📍 Localisation: src/app/modules/auth/oauth2-callback/

🎯 Objectif:
  - Intercepter le callback OAuth2 du serveur
  - Traiter le token reçu

🔧 Fonctionnalités:
  • Récupère le code/token de la URL
  • Envoie au backend pour validation
  • Sauvegarde le token JWT
  • Redirige /user/profile
```

#### ForgotPasswordComponent
```
📍 Localisation: src/app/modules/auth/forgot-password/

🎯 Objectif:
  - Permettre à l'utilisateur de réinitialiser son mot de passe
  - Envoyer un email de réinitialisation

🔧 Fonctionnalités:
  • Formulaire: email (requis, valide)
  • Submit: envoie requête backend → génère token réinitialisation
  • Message: lien de réinitialisation envoyé par email
```

#### ResetPasswordComponent
```
📍 Localisation: src/app/modules/auth/reset-password/

🎯 Objectif:
  - Réinitialiser le mot de passe avec le token envoyé par email

🔧 Fonctionnalités:
  • Récupère le token de la URL
  • Formulaire: newPassword + confirmation
  • Submit: envoie nouveau password au backend
  • Redirige: /auth/login après succès
```

### 2️⃣ User Module (`src/app/modules/user/`)

#### ProfileComponent
```
📍 Localisation: src/app/modules/user/profile/
📁 Fichiers: profile.component.ts, profile.component.html, profile.component.css

🎯 Objectif:
  - Afficher le profil de l'utilisateur connecté
  - Permettre de modifier ses infos
  - Permettre de changer son mot de passe

🔧 Fonctionnalités:
  • Onglet 1 - Profil:
    - Affiche: name, prenom, email, statut, dateInscription
    - Mode lecture par défaut
    - Bouton Edit → active l'édition
    - Submit → UserService.updateUser()
  
  • Onglet 2 - Mot de passe:
    - Formulaire: oldPassword + newPassword
    - Submit → UserService.changePassword(id, oldPassword, newPassword)
    - Validations: oldPassword requis, newPassword min 6 chars

🧮 Propriétés:
  - user: User | null
  - profileForm: FormGroup
  - passwordForm: FormGroup
  - isEditing: boolean
  - activeTab: 'profile' | 'password'
  - isLoading: boolean
  - successMessage / errorMessage: string
```

#### UserListComponent (Admin Only)
```
📍 Localisation: src/app/modules/user/user-list/
📁 Fichiers: user-list.component.ts, user-list.component.html, user-list.component.css

🎯 Objectif (protected by authGuard + role: ADMIN):
  - Afficher la liste de tous les utilisateurs
  - Filtrer par nom/email/rôle
  - Paginer la liste (8 utilisateurs par page)
  - Actions CRUD sur les utilisateurs

🔧 Fonctionnalités:
  • Chargement: UserService.getAllUsers()
  
  • Filtrage:
    - Recherche texte: cherche dans name, prenom, email
    - Filtre rôle: select dropdown
    - applyFilter() recalcule la liste filtrée
  
  • Pagination:
    - pageSize = 8
    - currentPage = 1..totalPages
    - paginatedUsers: calcule la tranche à afficher

  • Actions:
    - ➕ Ajouter: router.navigate(['/user/form'])
    - ✏️  Modifier: router.navigate(['/user/form', id])
    - 🗑️  Supprimer: UserService.deleteUser(id)
  
  • Affichage des rôles avec badges (couleurs différentes par rôle)

🧮 Propriétés:
  - users: User[]
  - filteredUsers: User[]
  - searchTerm: string
  - selectedRole: string
  - isLoading: boolean
  - currentPage / pageSize / totalPages: number
```

#### FormUserComponent (Admin Only - CRUD)
```
📍 Localisation: src/app/modules/user/form-user/
📁 Fichiers: form-user.component.ts, form-user.component.html, form-user.component.css

🎯 Objectif (protected by authGuard + role: ADMIN):
  - Mode CREATE: créer un nouvel utilisateur (/user/form)
  - Mode EDIT: modifier un utilisateur (/user/form/:id)

🔧 Fonctionnalités:

  Mode CREATE:
  • Route: /user/form (pas d'ID)
  • Formulaire vide
  • Champs: name, prenom, email, password (requis), role, statut
  • Submit → UserService.createUser(AdminCreateUserRequest)
  • Message succès → redirige /user/list après 1.5s

  Mode EDIT:
  • Route: /user/form/:id
  • Charge les données: UserService.getUserById(id)
  • Pré-remplit le formulaire
  • Champ password devient optionnel (admin crée new password si besoin)
  • Submit → UserService.updateUser(User)
  • Message succès → redirige /user/list après 1.5s

🧮 Propriétés:
  - form: FormGroup
  - isEditMode: boolean
  - editUserId: number | null
  - isLoading: boolean
  - isSubmitting: boolean
  - roles: Role[]
  - errorMessage / successMessage: string
```

#### SetPasswordComponent
```
📍 Localisation: src/app/modules/user/set-password/

🎯 Objectif:
  - Utilisé après que l'admin crée un utilisateur
  - L'utilisateur doit définir son mot de passe initial

🔧 Fonctionnalités:
  • Formulaire: newPassword + confirmation
  • Submit → UserService.setPassword(id, password)
  • Message succès → redirige /auth/login
```

---

## 🔧 Services

### Synthèse des Services

| Service | Localisation | Responsabilité |
|---------|-------------|-----------------|
| **AuthService** | `core/services/auth.service.ts` | Authentification, JWT management, login/logout |
| **UserService** | `core/services/user.service.ts` | CRUD opérations sur les utilisateurs |
| **JwtInterceptor** | `core/interceptors/jwt.interceptor.ts` | Ajouter le token JWT à chaque requête |
| **AuthGuard** | `core/services/auth.guard.ts` | Protéger les routes (auth + role check) |

---

## 🛡️ Intercepteurs et Guards

### 🔒 JWT Interceptor
- **Rôle**: Intercepte chaque requête HTTP
- **Action**: Ajoute `Authorization: Bearer {token}` aux headers
- **Erreur 401**: Déclenche logout auto + redirige login

### 🚪 Auth Guard
- **Rôle**: Protège les routes
- **Vérification 1**: Est-ce que l'utilisateur est authentifié ?
- **Vérification 2**: Est-ce que l'utilisateur a le bon rôle ?
- **Utilisation**: `canActivate: [authGuard], data: { role: 'ADMIN' }`

---

## 📦 Modules

### AuthModule
**Localisation**: `src/app/modules/auth/auth.module.ts`

```typescript
@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    Oauth2CallbackComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class AuthModule {}
```

### UserModule
**Localisation**: `src/app/modules/user/user.module.ts`

```typescript
@NgModule({
  declarations: [
    ProfileComponent,
    UserListComponent,
    SetPasswordComponent,
    FormUserComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ]
})
export class UserModule {}
```

---

## 🔄 Flux de Données

### Flux d'Authentification Complet

```
START
  ↓
┌─────────────────────┐
│ User à /auth/login  │
└────────┬────────────┘
         ↓
┌──────────────────────────────┐
│ LoginComponent               │
│ • loginForm (email, pwd)     │
│ • Submit → authService.login │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ AuthService.login()          │
│ POST /api/auth/login         │
│ → reçoit { token: "..." }    │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ AuthService.saveToken()      │
│ localStorage['token']    ✅  │
│ localStorage['userId']   ✅  │
│ localStorage['role']     ✅  │
│ localStorage['email']    ✅  │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Router.navigate(['/user/profile'])
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ ProfileComponent             │
│ • Load user data             │
│ • UserService.getUserById()  │
│   + JwtInterceptor ajoute    │
│     Auth: Bearer {token}     │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Utilisateur authentifié ✅   │
│ & données chargées ✅        │
└──────────────────────────────┘
```

### Flux de Modification de Profil

```
START
  ↓
┌─────────────────────────────────┐
│ ProfileComponent                │
│ • Affiche profil utilisateur    │
│ • Bouton Edit → isEditing=true  │
│ • Edit form fields              │
└────────┬────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ Form Submit                     │
│ • Validation (email, required)  │
│ • onSubmit()                    │
└────────┬────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ UserService.updateUser()         │
│ PUT /api/users                   │
│ Body: { id, name, prenom, ... }  │
│ Header: X-User-Id: {userId}      │
│ + JwtInterceptor: Auth header    │
└────────┬───────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Backend vérifie               │
│ • JWT valide ? ✅             │
│ • User autorisé ? ✅          │
│ • Mise à jour BDD ✅          │
└────────┬───────────────────────┘
         ↓
┌──────────────────────────────────┐
│ Frontend affiche message succès  │
│ "Profil mis à jour avec succès!" │
│ isEditing = false                │
└──────────────────────────────────┘
```

### Flux d'Ajout d'Utilisateur (Admin)

```
START
  ↓
┌──────────────────────────────────┐
│ UserListComponent (Admin only)   │
│ canActivate: [authGuard]         │
│ data: { role: 'ADMIN' }          │
│ • Affiche liste utilisateurs     │
│ • Bouton "Ajouter"               │
└────────┬─────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ navigate(['/user/form'])             │
│ (FormUserComponent sans ID)          │
└────────┬──────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│ FormUserComponent                      │
│ • ngOnInit: pas d'ID → CREATE mode     │
│ • isEditMode = false                   │
│ • buildForm avec password requis       │
│ • Form vide                            │
└────────┬───────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│ Admin remplit le formulaire            │
│ • name, prenom, email                  │
│ • password (nouveau)                   │
│ • role (select: ADMIN, USER, etc.)     │
│ • statut (active by default)           │
└────────┬───────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│ onSubmit()                             │
│ • Validation OK ? ✅                   │
│ • isEditMode === false → CREATE branch │
└────────┬───────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│ UserService.createUser()                   │
│ POST /api/users/admin/create               │
│ Body: AdminCreateUserRequest               │
│ {                                          │
│   name, prenom, email,                    │
│   password, role                          │
│ }                                          │
│ + JwtInterceptor: Auth header             │
└────────┬───────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ Backend                                  │
│ • Valide JWT (admin ?) ✅                │
│ • Hash password ✅                       │
│ • Crée utilisateur BDD ✅                │
│ • Retourne User { id, ... }              │
└────────┬─────────────────────────────────┘
         ↓
┌──────────────────────────────────────────┐
│ Frontend                                 │
│ • successMessage = "Créé avec succès!" │
│ • setTimeout 1.5s                        │
│ • navigate(['/user/list'])               │
└──────────────────────────────────────────┘
```

### Flux de Suppression (Admin)

```
START  (UserListComponent)
  ↓
┌──────────────────────────────┐
│ User clique "Supprimer"      │
│ deleteUser(id)               │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Confirmation dialog          │
│ "Supprimer cet utilisateur ?"│
└────────┬─────────────────────┘
         ↓
   Oui ?
  ╱     ╲
 Oui     Non → CANCEL
  ↓
┌──────────────────────────────┐
│ UserService.deleteUser(id)   │
│ DELETE /api/users/{id}       │
│ + JwtInterceptor: Auth       │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Backend                      │
│ • Valide JWT (admin ?) ✅    │
│ • Delete user BDD ✅         │
│ • Retourne 200 OK            │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Frontend                     │
│ • Supprime de users[]        │
│ • applyFilter()              │
│ • Flash: "Supprimé ✅"       │
│ • Auto-hide message 4s       │
└──────────────────────────────┘
```

---

## 📊 Schéma de Sécurité

```
┌─────────────────────────────────────────────────────────┐
│                 FLOW DE SÉCURITÉ                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣  User Login / Register                             │
│      └─ Envoie email + password au backend             │
│      └─ Backend hash password + crée JWT               │
│      └─ Retourne JWT au frontend                       │
│                                                         │
│  2️⃣  Frontend stocke JWT en localStorage              │
│      └─ ⚠️  Attention: localStorage accessible via JS  │
│                                                         │
│  3️⃣  Chaque requête HTTP                               │
│      └─ JwtInterceptor ajoute: Authorization: Bearer   │
│                                                         │
│  4️⃣  Backend vérifie JWT                               │
│      └─ Décode signature                               │
│      └─ Vérifie exp time                               │
│      └─ Extrait userId & role                          │
│      └─ Retourne 401 si invalide                       │
│                                                         │
│  5️⃣  Frontend reçoit 401                               │
│      └─ JwtInterceptor: logout() auto                  │
│      └─ localStorage cleared                           │
│      └─ Redirige /auth/login                           │
│                                                         │
│  6️⃣  Route Protection (AuthGuard)                      │
│      └─ Avant de charger composant                     │
│      └─ Vérifie isLoggedIn()                           │
│      └─ Vérifie role si requis                         │
│      └─ Bloque ou permet accès                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Cas d'Usage Principaux

### Case 1: Nouvel Utilisateur
```
Register → AuthService.register() → JWT saved
→ Profile page loaded → User exists in system
```

### Case 2: Utilisateur Existant
```
Login → AuthService.login() → JWT saved
→ Profile page loaded → User data displayed
```

### Case 3: Admin Gère Utilisateurs
```
/user/list (Admin page)
├─ Voir tous users
├─ Ajouter: /user/form → create
├─ Modifier: /user/form/:id → edit
└─ Supprimer: delete confirm

All protected by: canActivate: [authGuard], data: { role: 'ADMIN' }
```

### Case 4: Utilisateur Modifie Profil
```
/user/profile
├─ Read own data
├─ Edit mode: toggle
├─ Submit: UserService.updateUser()
└─ Message succès
```

### Case 5: Utilisateur Réinitialise Password
```
/auth/forgot-password
→ Enter email
→ Submit → backend envoie email
→ Clic lien email
→ /auth/reset-password?token=xxx
→ New password form
→ Submit → backend update
→ /auth/login
```

---

## 📋 Résumé des Routes

### Auth Routes `/auth`
```
/auth/login              → LoginComponent (login form)
/auth/register           → RegisterComponent (register form)
/auth/oauth2/callback    → Oauth2CallbackComponent
/auth/forgot-password    → ForgotPasswordComponent
/auth/reset-password     → ResetPasswordComponent
/auth/                   → redirects to /auth/login
```

### User Routes `/user` (Protected)
```
/user/profile                    → ProfileComponent (my profile - ANY LOGGED IN USER)
/user/set-password               → SetPasswordComponent
/user/list                       → UserListComponent (ADMIN ONLY)
/user/form                       → FormUserComponent CREATE mode (ADMIN ONLY)
/user/form/:id                   → FormUserComponent EDIT mode (ADMIN ONLY)
/user/                           → redirects to /user/profile
```

---

## 🔍 Points-Clés à Retenir

✅ **Authentication**
- JWT stocké en localStorage
- Interceptor ajoute token auto à chaque requête
- Expiration gérée automatiquement
- Logout = localStorage cleared

✅ **User Management**
- CRUD complet: Create, Read, Update, Delete
- Admin peut gérer tous les utilisateurs
- Users peuvent voir/modifier leur profil
- Rôles: USER, ADMIN, MENTOR, INVESTOR, PARTNER

✅ **Sécurité**
- AuthGuard protège routes
- Rôle check sur routes sensibles
- 401 intercepté = logout auto
- JWT signature vérifiée par backend

✅ **Architecture**
- Séparation Auth Module / User Module
- Services centralisés (AuthService, UserService)
- Intercepteurs pour JWT handling
- Guards pour route protection
- Reactive Forms pour validation

---

## 🚀 Améliorations Possibles

1. **Refresh Token**: Implémenter un refresh token pour la continuité de session
2. **XSS Protection**: Déplacer token de localStorage à httpOnly cookie
3. **Caching**: Implémenter un cache pour getAllUsers() (cahcer invalidation)
4. **Pagination Backend**: Implémenter la pagination côté backend
5. **Error Handling**: Plus détaillé avec custom error interceptor
6. **Loading States**: Spinners d'attente pour chaque opération
7. **Permissions**: Système de permissions plus granulaires
8. **Audit Trail**: Logger les modifications utilisateur

---

**Fin de Documentation** ✅
