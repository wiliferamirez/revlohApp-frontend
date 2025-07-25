import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Authentication guard
 * Protects routes that require user to be authenticated
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        // User is authenticated, check if they have required permissions
        return checkRoutePermissions(route, authService);
      } else {
        // User is not authenticated, redirect to login
        handleUnauthenticatedAccess(state.url, router, notificationService);
        return false;
      }
    })
  );
};

/**
 * Handles access attempt by unauthenticated user
 */
function handleUnauthenticatedAccess(
  attemptedUrl: string, 
  router: Router, 
  notificationService: NotificationService
): void {
  // Store the attempted URL for redirect after login
  sessionStorage.setItem('redirectUrl', attemptedUrl);
  
  // Show notification
  notificationService.showWarning(
    'Authentication Required', 
    'Please log in to access this page'
  );
  
  // Redirect to login page
  router.navigate(['/auth/login']);
}

/**
 * Checks if user has required permissions for the route
 */
function checkRoutePermissions(route: ActivatedRouteSnapshot, authService: AuthService): boolean {
  // Check if route requires specific roles
  const requiredRoles = route.data?.['roles'] as string[];
  if (requiredRoles && requiredRoles.length > 0) {
    const user = authService.user();
    if (!user || !requiredRoles.includes(user.personType)) {
      return false;
    }
  }

  // Check if route requires specific permissions
  const requiredPermissions = route.data?.['permissions'] as string[];
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      authService.hasPermission(permission)
    );
    if (!hasAllPermissions) {
      return false;
    }
  }

  // Check if user account is active
  const user = authService.user();
  if (user && user.personStatus !== 'Active') {
    return false;
  }

  return true;
}