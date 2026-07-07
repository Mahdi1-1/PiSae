# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm test           # Run tests with Vitest
```

To run a single test file: `npx vitest run src/app/path/to/file.spec.ts`

## Architecture

**FoundersLab** is an Angular 21 startup-ecosystem platform (SPA) with three layout zones:

| Zone | Path prefix | Guard |
|------|-------------|-------|
| Public landing | `/` | none |
| Auth | `/auth` | none |
| App (dashboard) | `/app` | `authGuard` |

The `authGuard` (`src/app/core/services/auth.guard.ts`) reads a JWT from `localStorage` via `AuthService`. The `jwtInterceptor` (`src/app/core/interceptors/jwt.interceptor.ts`) attaches the `Bearer` token to every HTTP request and redirects to `/auth/login` on 401.

**Backend API base URL** is configured in `src/app/core/config/api.config.ts`:
```ts
export const USER_API_BASE = 'http://localhost:8091/api';
export const EVENT_API_BASE = 'http://localhost:8091/api';
```

**Directory layout:**
- `src/app/core/` — auth services, JWT interceptor, API config, and user model (single source of truth for `UserRole`)
- `src/app/services/` — feature-level HTTP services (events, tickets, certificates, speakers, etc.)
- `src/app/models/` — domain models for event-management features (Event, Ticket, Speaker, Badge, etc.)
- `src/app/pages/` — one folder per route; components are largely self-contained with inline templates
- `src/app/layout/` — `LayoutComponent` (authenticated shell: collapsible sidebar, topbar, notifications, profile/settings modals)
- `src/app/shared/` — shared UI pieces (currently `MapComponent` using Leaflet)

**UI stack:** Tailwind CSS v4 (PostCSS), `@spartan-ng/brain` headless primitives, `@ng-icons/lucide` icons, `class-variance-authority` + `clsx` + `tailwind-merge` for variant styling. Theme (light/dark/system) is managed by `ThemeService` via CSS custom properties on `:root`.

**Roles:** `USER | ADMIN | MENTOR | INVESTOR | PARTNER | PARTENAIRE` — the backend may prefix roles with `ROLE_`; `AuthService.normalizeRole()` strips that prefix.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
