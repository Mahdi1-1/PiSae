import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Walk down to the deepest matched route so a parent layout guard can see
  // the child's role data (Angular doesn't merge route.data automatically).
  let leaf: ActivatedRouteSnapshot = route;
  while (leaf.firstChild) {
    leaf = leaf.firstChild;
  }

  const requiredRole =
    (route.data['role'] as UserRole | undefined) ??
    (leaf.data['role'] as UserRole | undefined);
  const requiredRoles =
    (route.data['roles'] as UserRole[] | undefined) ??
    (leaf.data['roles'] as UserRole[] | undefined);

  // Regular users belong on the public site, except for routes that explicitly
  // allow the USER role (e.g. shared partenariat pages).
  if (authService.hasRole('USER')) {
    const userAllowed =
      (requiredRoles && requiredRoles.includes('USER')) ||
      requiredRole === 'USER';
    if (!userAllowed) {
      router.navigate(['/']);
      return false;
    }
  }

  if (requiredRoles && !authService.hasRole(...requiredRoles)) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};
