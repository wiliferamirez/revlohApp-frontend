import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Permission guard (functional style for Angular 19)
 * Protects routes based on specific permissions
 * Usage in routes: { path: 'users', canActivate: [permissionGuard], data: { permissions: ['user:read', 'user:write'] } }
 */
export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        handleUnauthenticatedAccess(state.url, router, notificationService);
        return false;
      }

      const user = authService.user();
      if (!user) {
        handleUnauthenticatedAccess(state.url, router, notificationService);
        return false;
      }

      // Check if account is active
      if (user.personStatus !== 'Active') {
        handleInactiveAccount(router, notificationService);
        return false;
      }

      // Get required permissions from route data
      const requiredPermissions = route.data?.['permissions'] as string[];
      if (!requiredPermissions || requiredPermissions.length === 0) {
        // No specific permissions required, just need to be authenticated
        return true;
      }

      // Check permissions
      const hasPermissions = checkUserPermissions(requiredPermissions, authService, route);
      if (!hasPermissions) {
        handleInsufficientPermissions(requiredPermissions, router, notificationService);
        return false;
      }

      return true;
    })
  );
};

/**
 * Checks if user has required permissions
 */
function checkUserPermissions(
  requiredPermissions: string[], 
  authService: AuthService, 
  route: ActivatedRouteSnapshot
): boolean {
  const user = authService.user();
  if (!user) return false;

  // Super admin has all permissions
  if (user.personType === 'SuperAdmin') {
    return true;
  }

  // Get permission check mode from route data (default: 'all')
  const permissionMode = route.data?.['permissionMode'] as 'all' | 'any' || 'all';

  const userPermissions = authService.getUserPermissions();

  if (permissionMode === 'any') {
    // User needs at least one of the required permissions
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('*')
    );
  } else {
    // User needs all required permissions
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission) || userPermissions.includes('*')
    );
  }
}

/**
 * Handles access attempt by unauthenticated user
 */
function handleUnauthenticatedAccess(
  attemptedUrl: string, 
  router: Router, 
  notificationService: NotificationService
): void {
  sessionStorage.setItem('redirectUrl', attemptedUrl);
  
  notificationService.showWarning(
    'Authentication Required', 
    'Please log in to access this page'
  );
  
  router.navigate(['/auth/login']);
}

/**
 * Handles access attempt by user with insufficient permissions
 */
function handleInsufficientPermissions(
  requiredPermissions: string[], 
  router: Router, 
  notificationService: NotificationService
): void {
  notificationService.showError(
    'Access Denied', 
    `You don't have the required permissions: ${requiredPermissions.join(', ')}`
  );
  
  router.navigate(['/dashboard']);
}

/**
 * Handles access attempt by inactive user account
 */
function handleInactiveAccount(router: Router, notificationService: NotificationService): void {
  notificationService.showError(
    'Account Inactive', 
    'Your account is not active. Please contact an administrator.'
  );
  
  // Don't redirect, just deny access
  router.navigate(['/dashboard']);
}