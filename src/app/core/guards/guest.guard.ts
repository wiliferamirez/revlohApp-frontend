import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Guest guard (functional style for Angular 19)
 * Protects routes that should only be accessible to non-authenticated users
 * (e.g., login, register pages)
 */
export const guestGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot, 
  state: RouterStateSnapshot
): Observable<boolean> | Promise<boolean> | boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        // User is not authenticated, allow access to guest routes
        return true;
      } else {
        // User is authenticated, redirect to dashboard or stored redirect URL
        handleAuthenticatedAccess(router);
        return false;
      }
    })
  );
};

/**
 * Handles access attempt by authenticated user to guest-only routes
 */
function handleAuthenticatedAccess(router: Router): void {
  // Check if there's a stored redirect URL
  const redirectUrl = sessionStorage.getItem('redirectUrl');
  
  if (redirectUrl) {
    // Clear the stored URL and redirect to it
    sessionStorage.removeItem('redirectUrl');
    router.navigateByUrl(redirectUrl);
  } else {
    // Default redirect to dashboard
    router.navigate(['/dashboard']);
  }
}