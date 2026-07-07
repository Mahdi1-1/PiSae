# PIcloud API Permission Matrix

## 1) Scope and source of truth

This document is derived from frontend code currently in the project.
It describes:
- every API endpoint called by the Angular app,
- expected role access,
- and whether the restriction is enforced in frontend routes/UI or must be enforced by backend.

Important:
- Frontend checks improve UX but are not security.
- Real security must be enforced by backend authorization.

Role set observed in code:
- GUEST (not logged in)
- USER
- PARTNER
- MENTOR
- ADMIN
- INVESTOR (defined in model, limited explicit handling)

Legend used in tables:
- Yes: intended/allowed
- No: intended/not allowed
- Limited: allowed with ownership/scope limits
- Backend: must be enforced by backend (frontend alone is not enough)
- Unknown: no strong evidence in frontend

---

## 2) Authentication and account recovery

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| POST | /api/auth/register | Yes | No | No | No | No | No | Public signup flow. |
| POST | /api/auth/login | Yes | No | No | No | No | No | Public login flow. |
| POST | /api/auth/forgot-password | Yes | Yes | Yes | Yes | Yes | Yes | Can be used by anyone with email. |
| POST | /api/auth/reset-password | Yes | Yes | Yes | Yes | Yes | Yes | Token-based reset. |
| GET | /oauth2/authorization/google | Yes | Yes | Yes | Yes | Yes | Yes | OAuth redirect entrypoint. |

---

## 3) User management endpoints

Base: /api/users

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/users | No | Backend | Backend | Backend | Yes | Backend | UI route for list is ADMIN only. Backend must enforce. |
| GET | /api/users/{id} | No | Limited | Limited | Limited | Yes | Limited | Typically self or admin. Backend must enforce ownership/admin. |
| PUT | /api/users | No | Limited | Limited | Limited | Yes | Limited | Sends X-User-Id header; backend should validate requester. |
| DELETE | /api/users/{id} | No | No | No | No | Yes | No | UI is ADMIN-only. |
| POST | /api/users/admin/create | No | No | No | No | Yes | No | Explicit admin endpoint. |
| POST | /api/users/{id}/set-password | No | Backend | Backend | Backend | Yes | Backend | Route not strongly guarded in frontend; backend must restrict. |
| PUT | /api/users/{id}/change-password | No | Limited | Limited | Limited | Limited | Limited | Usually self-service by authenticated user. |

---

## 4) Event endpoints

Base: /api/events

### 4.1 Core event lifecycle

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/events | No | Yes | Yes | Yes | Yes | Yes | Frontend fetches published-only for non-creators in list logic. |
| GET | /api/events/{id} | No | Yes | Yes | Yes | Yes | Yes | Route is authenticated. |
| POST | /api/events | No | No | Intended Yes | Yes | Yes | No | Route allows ADMIN, MENTOR, PARTENAIRE string; role-name mismatch risk for PARTNER. |
| PUT | /api/events/{id} | No | No | Limited | Limited | Yes | No | Ownership/admin rules should be backend-enforced. |
| DELETE | /api/events/{id} | No | No | Limited | Limited | Yes | No | Should be owner/admin. |
| PATCH | /api/events/{id}/submit | No | No | Limited | Limited | Optional | No | Used by owner mentor/partner from draft. |
| PATCH | /api/events/{id}/publish | No | No | Limited | Limited | Yes | No | Admin always; owner when approved (per UI). |
| GET | /api/events/pending | No | No | No | No | Yes | No | Route/page is ADMIN-only. |
| PATCH | /api/events/{id}/approve | No | No | No | No | Yes | No | Admin workflow endpoint. |
| PATCH | /api/events/{id}/reject | No | No | No | No | Yes | No | Admin workflow endpoint. |
| POST | /api/events/upload-image | No | No | Limited | Limited | Yes | No | Used in event creation/editing. |
| POST | /api/events/generate-description | No | No | Limited | Limited | Yes | No | AI helper during event form workflow. |

### 4.2 Program slots

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/events/{eventId}/program | No | Yes | Yes | Yes | Yes | Yes | Event detail view. |
| POST | /api/events/{eventId}/program | No | No | Limited | Limited | Yes | No | Should be owner/admin/editor roles. |
| PUT | /api/events/{eventId}/program/{slotId} | No | No | Limited | Limited | Yes | No | Should be owner/admin/editor roles. |
| DELETE | /api/events/{eventId}/program/{slotId} | No | No | Limited | Limited | Yes | No | Should be owner/admin/editor roles. |

### 4.3 Registrations

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| POST | /api/events/{eventId}/register | No | Yes | Yes | Yes | Yes | Yes | Any authenticated user can register. |
| DELETE | /api/events/{eventId}/register | No | Yes | Yes | Yes | Yes | Yes | Cancel own registration. |
| GET | /api/events/{eventId}/registrations | No | No | Limited | Limited | Yes | No | Event managers/admin should view attendee list. |
| GET | /api/events/my-registrations | No | Yes | Yes | Yes | Yes | Yes | Authenticated personal list. |
| PATCH | /api/events/registrations/{id}/checkin | No | No | Limited | Limited | Yes | No | Should be event manager/admin. |

---

## 5) Speaker endpoints

Base: /api

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/speakers | No | Yes | Yes | Yes | Yes | Yes | Read access from event workflows. |
| GET | /api/speakers/{id} | No | Yes | Yes | Yes | Yes | Yes | Read access. |
| GET | /api/events/{eventId}/speakers | No | Yes | Yes | Yes | Yes | Yes | Event detail read access. |
| POST | /api/speakers | No | No | Limited | Limited | Yes | No | Management action. |
| PUT | /api/speakers/{id} | No | No | Limited | Limited | Yes | No | Management action. |
| DELETE | /api/speakers/{id} | No | No | Limited | Limited | Yes | No | Management action. |
| POST | /api/events/{eventId}/speakers/{speakerId} | No | No | Limited | Limited | Yes | No | Link speaker to event. |
| DELETE | /api/events/{eventId}/speakers/{speakerId} | No | No | Limited | Limited | Yes | No | Unlink speaker from event. |
| POST | /api/speakers/{speakerId}/upload-photo | No | No | Limited | Limited | Yes | No | Management action. |

---

## 6) Partner organization endpoints

Base: /api/organisations

Frontend sends explicit headers for this domain:
- X-User-Role: ROLE_<role>
- X-User-Id: <id>

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/organisations | No | Yes | Yes | Yes | Yes | Yes | Used by partner list and lookup logic. |
| GET | /api/organisations/{id} | No | Yes | Yes | Yes | Yes | Yes | Read detail. |
| GET | /api/organisations/statut/{statut} | No | Backend | Backend | Backend | Yes | Backend | Mostly admin/reporting use. |
| PUT | /api/organisations/{id}/contact | No | No | Limited | No | Yes | No | Partner own org or admin expected. |
| POST | /api/organisations | No | No | No | No | Yes | No | Admin create org. |
| PUT | /api/organisations/{id} | No | No | No | No | Yes | No | Admin full update. |
| PATCH | /api/organisations/{id}/statut?statut=... | No | No | No | No | Yes | No | Admin status update. |
| PUT | /api/organisations/{orgId}/assign-user/{userId} | No | No | No | No | Yes | No | Admin assignment. |
| DELETE | /api/organisations/{id} | No | No | No | No | Yes | No | Admin delete. |

---

## 7) Convention and objectifs endpoints

Bases:
- /api/conventions
- /api/objectifs

Frontend also sends X-User-Role and X-User-Id headers for this domain.

### 7.1 Conventions

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/conventions | No | No | No | Backend | Yes | Backend | UI behavior assumes ADMIN sees all. |
| GET | /api/conventions/{id} | No | Limited | Limited | Backend | Yes | Backend | Ownership/org scoping expected. |
| GET | /api/conventions/user/{userId} | No | Limited | No | No | Yes | No | USER own list, admin broader. |
| GET | /api/conventions/organisation/{orgId} | No | No | Limited | No | Yes | No | PARTNER own org list, admin broad access. |
| POST | /api/conventions | No | Yes | Yes | Backend | Yes | Backend | Creation route exists for authenticated users. |
| PUT | /api/conventions/{id} | No | Limited | Limited | Backend | Yes | Backend | Draft/signee edits expected by owner/admin. |
| PATCH | /api/conventions/{id}/statut | No | Limited | Limited | Backend | Yes | Backend | Status transitions backend-governed. |
| DELETE | /api/conventions/{id} | No | Limited | Limited | Backend | Yes | Backend | Backend should enforce strict policy. |
| POST | /api/conventions/{id}/confirmer | No | Limited | Limited | Backend | Yes | Backend | Signature/confirmation step. |
| POST | /api/conventions/{id}/annuler | No | Limited | Limited | Backend | Yes | Backend | Cancellation step. |
| PATCH | /api/conventions/{id}/renouvellement/demander | No | Limited | Limited | Backend | Yes | Backend | Renewal request. |
| POST | /api/conventions/{id}/renouvellement/accepter | No | Limited | Limited | Backend | Yes | Backend | Renewal accept with new terms. |
| GET | /api/conventions/{id}/pdf | No | Limited | Limited | Backend | Yes | Backend | Download PDF. |

### 7.2 Objectifs

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/objectifs/convention/{conventionId} | No | Limited | Limited | Backend | Yes | Backend | Scoped to convention visibility. |
| POST | /api/objectifs | No | Limited | Limited | Backend | Yes | Backend | Create objective for convention. |
| PUT | /api/objectifs/{id} | No | Limited | Limited | Backend | Yes | Backend | Edit objective. |
| PATCH | /api/objectifs/{id}/statut | No | Limited | Limited | Backend | Yes | Backend | Update status/comment. |
| DELETE | /api/objectifs/{id} | No | Limited | Limited | Backend | Yes | Backend | Remove objective. |

---

## 8) Badges, certificates, verification

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| GET | /api/badges/me | No | Yes | Yes | Yes | Yes | Yes | Authenticated own badges. |
| GET | /api/badges/user/{userId} | No | Backend | Backend | Backend | Yes | Backend | Should be admin or authorized viewer. |
| GET | /api/badges/{badgeId}/image | Yes | Yes | Yes | Yes | Yes | Yes | Public image URL use is possible. |
| GET | /api/certificates/me | No | Yes | Yes | Yes | Yes | Yes | Authenticated own certificates. |
| GET | /api/certificates/{id}/download | No | Limited | Limited | Limited | Yes | Limited | Should be owner/admin. |
| GET | /api/verify/{token} | Yes | Yes | Yes | Yes | Yes | Yes | Public verification endpoint. |

---

## 9) Meeting and Zoom endpoints

### 9.1 Meeting invitations

Base: /api/meeting-invitations

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| POST | /api/meeting-invitations/partenaire/{partenaireId} | No | Yes | No | No | Yes | No | UI allows USER and ADMIN to request meetings. |

### 9.2 Zoom signature

Base: /api/zoom

| Method | Endpoint | GUEST | USER | PARTNER | MENTOR | ADMIN | INVESTOR | Notes |
|---|---|---|---|---|---|---|---|---|
| POST | /api/zoom/signature | No | Limited | Limited | Limited | Yes | Limited | Should require authenticated participant of meeting. |

---

## 10) Frontend route guard alignment summary

Frontend route-level restrictions currently observed:
- /user/list, /user/form, /user/form/:id are ADMIN-only.
- /events/pending is ADMIN-only.
- /events/new and /events/speakers intend ADMIN, MENTOR, PARTNER access.
- /partenariat/form and /partenariat/form/:id are ADMIN-only.
- /partenariat/mon-organisation is PARTNER-only.

Known risk:
- Role string mismatch appears in event routes: PARTENAIRE versus PARTNER.
- If backend stores PARTNER and guard expects PARTENAIRE for some routes, partner users may be blocked unexpectedly.

---

## 11) Recommended backend enforcement checklist

For production-grade security, backend should explicitly validate:
- JWT authentication for all non-public endpoints.
- Role authorization for admin-only endpoints.
- Ownership checks for self-service endpoints.
- Organization scoping for partner and convention endpoints.
- Event ownership/editor checks for event/program/speaker management.
- Meeting participation checks for Zoom signature generation.

---

## 12) Source files used for this matrix

- src/app/core/services/auth.service.ts
- src/app/core/services/user.service.ts
- src/app/services/event.service.ts
- src/app/services/program.service.ts
- src/app/services/registration.service.ts
- src/app/services/speaker.service.ts
- src/app/services/partenaire.service.ts
- src/app/services/convention.service.ts
- src/app/services/badge.service.ts
- src/app/services/certificate.service.ts
- src/app/services/meeting.service.ts
- src/app/services/zoom.service.ts
- src/app/modules/auth/forgot-password/forgot-password.component.ts
- src/app/modules/auth/reset-password/reset-password.component.ts
- src/app/modules/user/user-routing.module.ts
- src/app/modules/event/event-routing.module.ts
- src/app/modules/partenaire/partenaire-routing.module.ts
- src/app/core/services/auth.guard.ts
