import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Admin guard (functional style for Angular 19)
 * Protects routes that require admin-level access
 */
export const adminGuard: CanActivateFn = (
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
        // User is not authenticated
        handleUnauthenticatedAccess(state.url, router, notificationService);
        return false;
      }

      // Check if user has admin role
      const user = authService.user();
      if (!user) {
        handleUnauthenticatedAccess(state.url, router, notificationService);
        return false;
      }

      const hasAdminRole = ['SuperAdmin', 'Admin'].includes(user.personType);
      if (!hasAdminRole) {
        handleInsufficientPermissions(router, notificationService);
        return false;
      }

      // Check if account is active
      if (user.personStatus !== 'Active') {
        handleInactiveAccount(router, notificationService);
        return false;
      }

      return true;
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
  sessionStorage.setItem('redirectUrl', attemptedUrl);
  
  notificationService.showWarning(
    'Authentication Required', 
    'Please log in with admin credentials to access this page'
  );
  
  router.navigate(['/auth/login']);
}

/**
 * Handles access attempt by user with insufficient permissions
 */
function handleInsufficientPermissions(router: Router, notificationService: NotificationService): void {
  notificationService.showError(
    'Access Denied', 
    'You don\'t have admin privileges to access this page'
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
  
  router.navigate(['/dashboard']);
}