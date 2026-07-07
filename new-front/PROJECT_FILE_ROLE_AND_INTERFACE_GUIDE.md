# PIcloud - File Roles, User Roles, and Interface Access Guide

## 1) Purpose of this document

This file explains:
- what each important project file/folder does,
- what each user role can do,
- which interfaces each role can access,
- and the differences between interfaces by role.

It is based on the current Angular structure and current route/guard/menu behavior in the code.

---

## 2) Project file map (what each file does)

## Root files

- `angular.json`: Angular CLI workspace config (build, serve, assets, styles).
- `package.json`: project metadata, scripts (`start`, `test`) and dependencies.
- `README.md`: default Angular project readme.
- `PARTENARIAT_DOCUMENTATION.md`: partnership domain documentation.
- `USER_DOCUMENTATION.md`: user/auth domain documentation.
- `server.ts`: backend/server bootstrap file used by your environment.
- `tsconfig.json`: base TypeScript compiler configuration.
- `tsconfig.app.json`: TypeScript config for app build.
- `tsconfig.spec.json`: TypeScript config for tests.

## Public and app entry files

- `public/`: static public assets.
- `src/index.html`: base HTML host page.
- `src/main.ts`: Angular bootstrap entrypoint.
- `src/styles.css`: global styles.

## App shell

- `src/app/app.module.ts`: root Angular module, registers app-level components and HTTP interceptor.
- `src/app/app-routing.module.ts`: global routes and lazy-loaded feature modules.
- `src/app/app.component.ts`: root app component logic.
- `src/app/app.component.html`: root layout template.
- `src/app/app.component.css`: root layout styles.
- `src/app/app.component.spec.ts`: tests for root component.

## Core layer

### Navbar

- `src/app/core/components/navbar/*`: top navigation UI shown across the app.
  - `navbar.component.ts`: navbar behavior (logout and auth checks).
  - `navbar.component.html`: role-based menu visibility.
  - `navbar.component.css`: navbar styles.

### Security and shared auth

- `src/app/core/interceptors/jwt.interceptor.ts`: automatically adds JWT token to HTTP requests and handles unauthorized responses.
- `src/app/core/interceptors/jwt.interceptor.spec.ts`: interceptor tests.
- `src/app/core/services/auth.guard.ts`: route protection based on login and optional roles.
- `src/app/core/services/auth.guard.spec.ts`: guard tests.
- `src/app/core/services/auth.service.ts`: login/register/logout, token decode, role/user extraction.
- `src/app/core/services/auth.service.spec.ts`: auth service tests.
- `src/app/core/services/user.service.ts`: user CRUD and password-related requests.
- `src/app/core/services/user.service.spec.ts`: user service tests.
- `src/app/core/models/user.model.ts`: user/auth request and role types.

## Domain models (`src/app/models`)

- `badge.ts`: badge entity contract.
- `certificate.ts`: certificate entity contract.
- `convention.ts`: convention entity contract.
- `event.ts`: event entity contract.
- `partenaire.ts`: partner organization entity contract.
- `program.ts`: event program slot entity contract.
- `registration.ts`: event registration entity contract.
- `speaker.ts`: speaker entity contract.

## Auth module (`src/app/modules/auth`)

- `auth.module.ts`: auth feature module declaration.
- `auth-routing.module.ts`: auth routes (`login`, `register`, `forgot-password`, `reset-password`, `oauth2/callback`).
- `login/*`: login interface and logic.
- `register/*`: registration interface and logic.
- `forgot-password/*`: forgot password flow UI.
- `reset-password/*`: reset password flow UI.
- `oauth2-callback/*`: OAuth callback processing screen.

## Home module

- `src/app/modules/home/home.component.ts`: home page logic.
- `src/app/modules/home/home.component.html`: home page UI.
- `src/app/modules/home/home.component.css`: home page styles.
- `src/app/modules/home/home.component.spec.ts`: home page tests.

## Event module (`src/app/modules/event`)

- `event.module.ts`: event feature module.
- `event-routing.module.ts`: event list/detail/create/edit/pending/speakers routes with role checks.
- `components/*`: reusable event UI blocks (cards, forms, program slots, registrations).
- `pages/event-list/*`: events listing/filter page.
- `pages/event-detail/*`: event details, registration, workflow actions.
- `pages/event-form/*`: create/edit event page.
- `pages/speaker-list/*`: speaker management page.
- `pages/pending-events/*`: admin validation queue for events.

## Partner module (`src/app/modules/partenaire`)

- `partenaire.module.ts`: partner feature module.
- `partenaire-routing.module.ts`: partner routes (list, forms, mon organisation, conventions).
- `partenarie-list/*`: partner organizations list and filters.
- `partenarie-details/*`: partner details display.
- `form-organisation/*`: create/edit partner organization (admin-focused).
- `mon-organisation/*`: partner own organization profile and update interface.
- `convention-list/*`: conventions listing filtered by role.
- `form-convention/*`: convention create/edit form.
- `request-meeting/*`: modal/form to request a meeting with partner.
- `zoom-meeting/*`: Zoom Meeting SDK embedded join interface.

## User module (`src/app/modules/user`)

- `user.module.ts`: user feature module.
- `user-routing.module.ts`: user routes (profile, list, form, badges, certificates, set-password).
- `profile/*`: connected user profile page.
- `user-list/*`: admin user management list.
- `form-user/*`: admin create/edit user form.
- `set-password/*`: password set/update interface.
- `pages/my-badges/*`: logged-in user badges page.
- `pages/my-certificates/*`: logged-in user certificates page.

## Shared services (`src/app/services`)

- `badge.service.ts` + `.spec.ts`: badges API integration.
- `certificate.service.ts` + `.spec.ts`: certificates API integration.
- `convention.service.ts` + `.spec.ts`: conventions API integration.
- `event.service.ts` + `.spec.ts`: events API integration.
- `meeting.service.ts`: meeting request API integration.
- `partenaire.service.ts` + `.spec.ts`: partner organization API integration.
- `program.service.ts` + `.spec.ts`: event program API integration.
- `registration.service.ts` + `.spec.ts`: event registration API integration.
- `speaker.service.ts` + `.spec.ts`: speakers API integration.
- `zoom.service.ts` + `.spec.ts`: Zoom signature/join support API integration.

## Certificate verification page

- `src/app/pages/verify-certificate/*`: public page to verify a certificate token (`/verify/:token`).

---

## 3) User roles and what each role can do

Roles observed in code:
- `ADMIN`
- `USER`
- `PARTNER`
- `MENTOR`
- `INVESTOR` (declared in model, little to no dedicated UI behavior in current routes)

### A) Not logged in (Guest)

Can do:
- open home page (`/`),
- open auth pages (`/auth/*`),
- open public certificate verification (`/verify/:token`).

Cannot do:
- access `/user/*`, `/events/*`, `/partenariat/*` protected sections.

### B) USER

Can do:
- view profile (`/user/profile`), badges, certificates,
- browse events list/details and register/unregister,
- view partner list,
- request meeting from partner list,
- view own conventions (`/partenariat/conventions`) with role-based filtering.

Cannot do:
- open admin user list/form,
- open admin pending validations,
- open admin organization form routes.

### C) PARTNER

Can do:
- open own organization page (`/partenariat/mon-organisation`),
- manage own organization contact info,
- access conventions screens (filtered to own org).

Cannot do:
- open admin user management routes,
- open admin-only partner form routes.

### D) MENTOR

Can do:
- access authenticated app areas,
- in event module, role checks intend to allow create/manage event workflows.

Cannot do:
- admin-only user management and validation pages.

### E) ADMIN

Can do:
- everything available to authenticated users,
- user management (`/user/list`, `/user/form`, `/user/form/:id`),
- event validation queue (`/events/pending`),
- create/edit organization routes (`/partenariat/form`, `/partenariat/form/:id`),
- full conventions visibility.

---

## 4) Interface visibility matrix (who sees what)

Legend:
- Yes = explicitly visible/accessible by current logic.
- Limited = visible but content filtered by role or permissions.
- No = not visible or blocked.

| Interface | Guest | USER | PARTNER | MENTOR | ADMIN |
|---|---|---|---|---|---|
| Home (`/`) | Yes | Yes | Yes | Yes | Yes |
| Login/Register (`/auth/*`) | Yes | Yes (usually redirected once logged) | Yes (usually redirected) | Yes (usually redirected) | Yes (usually redirected) |
| Profile (`/user/profile`) | No | Yes | Yes | Yes | Yes |
| User List (`/user/list`) | No | No | No | No | Yes |
| User Form (`/user/form`) | No | No | No | No | Yes |
| Events List (`/events`) | No | Yes | Yes | Yes | Yes |
| Event Details (`/events/:id`) | No | Yes | Yes | Yes | Yes |
| New Event (`/events/new`) | No | No | Intended Yes (see notes) | Yes | Yes |
| Speakers (`/events/speakers`) | No | No | Intended Yes (see notes) | Yes | Yes |
| Pending Validation (`/events/pending`) | No | No | No | No | Yes |
| Partners List (`/partenariat/list`) | No | Yes | Yes | Yes | Yes |
| My Organization (`/partenariat/mon-organisation`) | No | No | Yes | No | No |
| Organization Admin Form (`/partenariat/form`) | No | No | No | No | Yes |
| Conventions List (`/partenariat/conventions`) | No | Limited (own user conventions) | Limited (own organization conventions) | Limited/depends backend behavior | Yes (all) |
| Certificate Verify (`/verify/:token`) | Yes | Yes | Yes | Yes | Yes |

---

## 5) Differences between interfaces by role

### Main menu differences

- Guest sees: Home, Connexion, Commencer.
- USER sees: Accueil, Evenements, Partenaires, Mes conventions, Profil, Deconnexion.
- PARTNER sees: Accueil, Evenements, Partenaires, Mon organisation, Conventions, Profil, Deconnexion.
- ADMIN sees: Accueil, Evenements, Partenaires, Conventions, Profil, Utilisateurs, Validation, Deconnexion.

### Data visibility differences

- In conventions screen:
  - USER gets only own conventions.
  - PARTNER gets conventions of own organization.
  - ADMIN gets all conventions.

- In events list:
  - non-creator roles effectively see published events in standard list behavior.
  - creator/manager roles can access broader workflow actions.

### Action differences

- Only ADMIN can manage users and pending event validation queue.
- USER and ADMIN can request meetings from partner list.
- PARTNER can update own organization contact information.

---

## 6) Important implementation notes (current code behavior)

- Role naming is not fully consistent in all files:
  - many checks use `PARTNER`,
  - some event checks use `PARTENAIRE`.
- This mismatch can affect whether partner users can access `events/new` and `events/speakers`.

Recommendation:
- standardize one role value across frontend and backend (for example `PARTNER`) and update all route/data checks accordingly.

---

## 7) Quick navigation references (key files)

- Global routing: `src/app/app-routing.module.ts`
- Route guard: `src/app/core/services/auth.guard.ts`
- Auth/role source: `src/app/core/services/auth.service.ts`
- Navbar visibility: `src/app/core/components/navbar/navbar.component.html`
- User routes: `src/app/modules/user/user-routing.module.ts`
- Event routes: `src/app/modules/event/event-routing.module.ts`
- Partner routes: `src/app/modules/partenaire/partenaire-routing.module.ts`

---

If you want, I can also generate a second document with a strict endpoint-level permission matrix (API by API: who can call what).
