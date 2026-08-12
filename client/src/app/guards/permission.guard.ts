import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Authorization guard - restricts route access based on `route.data['permissions']`
 * (array of required permission keys, ALL required unless `data['anyPermission']` is true)
 * and/or `route.data['roles']` (array of allowed role names).
 */
export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermissions = (route.data?.['permissions'] as string[]) || [];
  const requiredRoles = (route.data?.['roles'] as string[]) || [];
  const matchAny = !!route.data?.['anyPermission'];

  const permissionsOk =
    requiredPermissions.length === 0 ||
    (matchAny ? authService.hasAnyPermission(requiredPermissions) : requiredPermissions.every((p) => authService.hasPermission(p)));

  const rolesOk = requiredRoles.length === 0 || authService.hasRole(...requiredRoles);

  if (permissionsOk && rolesOk) return true;

  return router.createUrlTree(['/forbidden']);
};
