import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Authentication interceptor (functional style for Angular 19)
 * Automatically injects JWT tokens into requests and handles token refresh
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Skip token injection for certain endpoints
  if (shouldSkipTokenInjection(req.url)) {
    return next(req);
  }

  // Get current access token
  const accessToken = authService.getAccessToken();

  // Clone request and add authorization header if token exists
  const authReq = accessToken ? addTokenToRequest(req, accessToken) : req;

  // Handle the request and potential token refresh
  return next(authReq).pipe(
    catchError((error) => {
      // If we get a 401 Unauthorized, try to refresh the token
      if (error.status === 401 && accessToken && !isRefreshTokenRequest(req.url)) {
        return handleTokenRefresh(authService, req, next);
      }
      
      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};

/**
 * Adds authorization token to request headers
 */
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Determines if token injection should be skipped for this URL
 */
function shouldSkipTokenInjection(url: string): boolean {
  const skipUrls = [
    '/Auth/login',
    '/Auth/refresh',
    '/Auth/validate-password',
    '/User/register',
    '/User/check-email',
    '/User/check-identification'
  ];

  return skipUrls.some(skipUrl => url.includes(skipUrl));
}

/**
 * Checks if this is a refresh token request
 */
function isRefreshTokenRequest(url: string): boolean {
  return url.includes('/Auth/refresh');
}

/**
 * Handles token refresh and retries the original request
 */
function handleTokenRefresh(authService: AuthService, originalReq: HttpRequest<unknown>, next: HttpHandlerFn) {
  return authService.refreshToken().pipe(
    switchMap(() => {
      // Get the new token after refresh
      const newToken = authService.getAccessToken();
      
      if (newToken) {
        // Retry the original request with the new token
        const newAuthReq = addTokenToRequest(originalReq, newToken);
        return next(newAuthReq);
      } else {
        // If no new token, redirect to login
        return throwError(() => new Error('Token refresh failed'));
      }
    }),
    catchError((refreshError) => {
      // If refresh fails, logout user and redirect to login
      authService.logout().subscribe();
      return throwError(() => refreshError);
    })
  );
}