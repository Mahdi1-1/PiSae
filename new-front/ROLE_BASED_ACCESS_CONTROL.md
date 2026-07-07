# Role-Based Access Control (RBAC) - FoundersLab

This document describes the role-based access control implemented in the FoundersLab frontend application.

## Role Hierarchy

The application supports the following roles:

- **ADMIN**: Full system access
- **PARTNER** / **PARTENAIRE**: Partner organization management
- **USER**: Basic authenticated user

**Note**: Other roles (MENTOR, ENTREPRENEUR, EXPERT, INVESTOR) exist in the system but have the same access as ADMIN/PARTNER for most features. Role-specific restrictions are only applied to ADMIN, PARTNER, and USER.

## Access Control Implementation

### Guards

1. **authGuard**: Requires authentication + specific roles
   - Checks if user is logged in
   - Blocks USER role from `/app/*` routes
   - Validates required role(s) from route data
   - Redirects to `/auth/login` if not authenticated
   - Redirects to `/app/dashboard` if role doesn't match

2. **loginGuard**: Requires authentication only (any role)
   - Used for public landing pages that need login
   - Redirects to `/auth/login` if not authenticated

### Navigation Sidebar

The sidebar navigation dynamically shows/hides items based on user role:

- **Mon Organisation**: Only visible to PARTNER/PARTENAIRE
- **Conventions**: Visible to ADMIN, PARTNER, PARTENAIRE
- **Réunions**: Visible to ADMIN, PARTNER, PARTENAIRE
- **Registrations**: Only visible to ADMIN
- All other items: Visible to all authenticated non-USER roles

## Route Access Matrix

### Public Routes (No Authentication)

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Everyone |
| `/auth/login` | Login page | Everyone |
| `/auth/register` | Registration page | Everyone |
| `/auth/reset-password` | Password reset | Everyone |
| `/verify/:token` | Certificate verification | Everyone |

### Authenticated Routes (Any Role)

| Route | Description | Roles |
|-------|-------------|-------|
| `/events` (landing) | Public events list | Any authenticated |
| `/community` (landing) | Public community | Any authenticated |
| `/profile` (landing) | User profile | Any authenticated |

### Dashboard Routes (Non-USER Roles)

| Route | Description | Roles |
|-------|-------------|-------|
| `/app/dashboard` | Main dashboard | All except USER |
| `/app/projects` | Projects management | All except USER |
| `/app/community` | Community features | All except USER |
| `/app/legal` | Legal documents | All except USER |
| `/app/investments` | Investment opportunities | All except USER |
| `/app/mentoring` | Mentoring features | All except USER |
| `/app/roadmaps` | Roadmaps | All except USER |
| `/app/partnerships` | Partnership management | All except USER |
| `/app/events` | Events management | All except USER |
| `/app/profile` | Profile settings | All except USER |

### Role-Restricted Routes

| Route | Description | Roles |
|-------|-------------|-------|
| `/app/registrations` | Admin registrations | ADMIN only |

### Partenariat Module Routes

| Route | Description | Roles |
|-------|-------------|-------|
| `/app/partenariat/list` | Partner organizations list | ADMIN, PARTNER |
| `/app/partenariat/mon-organisation` | My organization | PARTNER only |
| `/app/partenariat/form` | Create organization | ADMIN only |
| `/app/partenariat/form/:id` | Edit organization | ADMIN only |
| `/app/partenariat/conventions` | Conventions list | ADMIN, PARTNER, USER |
| `/app/partenariat/conventions/form` | Create convention | ADMIN, PARTNER, USER |
| `/app/partenariat/conventions/form/:id` | Edit convention | ADMIN, PARTNER, USER |
| `/app/partenariat/meetings` | Meetings list | ADMIN, PARTNER, USER |
| `/app/partenariat/meetings/request/:id` | Request meeting | ADMIN, PARTNER, USER |

## Implementation Details

### Route Configuration Example

```typescript
{
  path: 'registrations',
  component: AdminRegistrationsComponent,
  canActivate: [authGuard],
  data: { role: 'ADMIN' }
}
```

### Navigation Item Configuration Example

```typescript
{
  icon: 'lucideBuilding',
  label: 'Mon Organisation',
  route: '/app/partenariat/mon-organisation',
  roles: ['PARTNER', 'PARTENAIRE']
}
```

### Guard Logic

The `authGuard` checks:
1. User is logged in
2. User is not USER role (blocked from /app/*)
3. User role matches `data.role` (single role) OR
4. User role is in `data.roles` (multiple roles)

If checks fail:
- Not logged in → redirect to `/auth/login`
- USER role → redirect to `/` (landing)
- Wrong role → redirect to `/app/dashboard`

### Special Cases

1. **USER role**: Blocked from `/app/*` routes by authGuard
   - Users with USER role are redirected to `/` (landing)
   - They can access public landing pages with loginGuard

2. **PARTNER vs PARTENAIRE**: Both role names are supported for compatibility
   - Backend may use either naming convention
   - Frontend accepts both in role checks

3. **Other roles**: MENTOR, ENTREPRENEUR, EXPERT, INVESTOR have same access as ADMIN/PARTNER
   - No specific restrictions applied to these roles
   - They can access all dashboard pages

## Backend Enforcement

⚠️ **Important**: Frontend guards are for UX only. Backend MUST enforce all access control:

- JWT authentication on all protected endpoints
- Role-based authorization checks
- Ownership validation (user can only edit their own data)
- Organization scoping for partner features

See backend documentation for API permission matrix.

## Testing Access Control

To test role-based access:

1. Login as different roles (ADMIN, PARTNER, USER)
2. Verify navigation items show/hide correctly
3. Try accessing restricted routes directly via URL
4. Verify proper redirects occur
5. Check that UI elements (nav links, buttons) respect roles

## Navigation Items by Role

### ADMIN
- Dashboard, Projects, Community, Legal, Investments, Mentoring, Roadmaps, Partnerships, Events
- **Conventions** (partenariat)
- **Réunions** (partenariat)
- **Registrations** (admin only)

### PARTNER/PARTENAIRE
- Dashboard, Projects, Community, Legal, Investments, Mentoring, Roadmaps, Partnerships, Events
- **Mon Organisation** (partner only)
- **Conventions** (partenariat)
- **Réunions** (partenariat)

### USER
- Landing pages only (/, /events, /community, /profile)
- Blocked from /app/* routes

### Other Roles (MENTOR, ENTREPRENEUR, EXPERT, INVESTOR)
- Same access as ADMIN/PARTNER
- All dashboard pages accessible
- No specific navigation restrictions
