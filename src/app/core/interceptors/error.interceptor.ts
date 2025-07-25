import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
import { ApiErrorResponse } from '../models/api.models';
import { HTTP_ERROR_MESSAGES } from '../constants/app.constants';

/**
 * Error interceptor (functional style for Angular 19)
 * Handles HTTP errors, loading states, and user notifications
 */
export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const loadingService = inject(LoadingService);

  // Start loading for non-background requests
  if (!isBackgroundRequest(req)) {
    loadingService.show();
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = handleHttpError(error, router, notificationService);
      return throwError(() => apiError);
    }),
    finalize(() => {
      // Stop loading for non-background requests
      if (!isBackgroundRequest(req)) {
        loadingService.hide();
      }
    })
  );
};

/**
 * Handles different types of HTTP errors
 */
function handleHttpError(
  error: HttpErrorResponse, 
  router: Router, 
  notificationService: NotificationService
): ApiErrorResponse {
  let apiError: ApiErrorResponse;

  if (error.error instanceof ErrorEvent) {
    // Client-side or network error
    apiError = {
      message: 'Network error occurred. Please check your connection.',
      errors: [error.error.message],
      timestamp: new Date().toISOString(),
      statusCode: 0
    };
    
    notificationService.showError('Network Error', apiError.message);
  } else {
    // Server-side error
    apiError = createServerErrorResponse(error);
    handleServerError(error.status, apiError, router, notificationService);
  }

  // Log error for debugging
  console.error('HTTP Error:', {
    url: error.url,
    status: error.status,
    statusText: error.statusText,
    error: apiError
  });

  return apiError;
}

/**
 * Creates standardized error response from server error
 */
function createServerErrorResponse(error: HttpErrorResponse): ApiErrorResponse {
  const errorBody = error.error;
  
  if (errorBody && typeof errorBody === 'object') {
    // API returned structured error
    return {
      message: errorBody.message || getDefaultErrorMessage(error.status),
      errors: errorBody.errors || [],
      timestamp: errorBody.timestamp || new Date().toISOString(),
      traceId: errorBody.traceId,
      statusCode: error.status
    };
  } else {
    // API returned unstructured error
    return {
      message: getDefaultErrorMessage(error.status),
      errors: [error.statusText || 'Unknown error'],
      timestamp: new Date().toISOString(),
      statusCode: error.status
    };
  }
}

/**
 * Handles specific server error status codes
 */
function handleServerError(
  status: number, 
  apiError: ApiErrorResponse, 
  router: Router, 
  notificationService: NotificationService
): void {
  switch (status) {
    case 400:
      // Bad Request - show validation errors
      if (apiError.errors && apiError.errors.length > 0) {
        notificationService.showError('Validation Error', apiError.errors.join(', '));
      } else {
        notificationService.showError('Bad Request', apiError.message);
      }
      break;

    case 401:
      // Unauthorized - handled by auth interceptor, but show message if needed
      if (!isAuthRelatedRequest()) {
        notificationService.showError('Session Expired', 'Please log in again');
        router.navigate(['/auth/login']);
      }
      break;

    case 403:
      // Forbidden - show access denied message
      notificationService.showError('Access Denied', 'You don\'t have permission to access this resource');
      break;

    case 404:
      // Not Found - show not found message
      notificationService.showWarning('Not Found', 'The requested resource was not found');
      break;

    case 409:
      // Conflict - show conflict message
      notificationService.showError('Conflict', apiError.message);
      break;

    case 422:
      // Unprocessable Entity - show validation errors
      if (apiError.errors && apiError.errors.length > 0) {
        notificationService.showError('Validation Error', apiError.errors.join(', '));
      } else {
        notificationService.showError('Validation Error', apiError.message);
      }
      break;

    case 429:
      // Too Many Requests - show rate limit message
      notificationService.showWarning('Rate Limited', 'Too many requests. Please try again later.');
      break;

    case 500:
      // Internal Server Error - show generic server error
      notificationService.showError('Server Error', 'Something went wrong on our end. Please try again later.');
      break;

    case 502:
    case 503:
      // Bad Gateway / Service Unavailable - show service unavailable message
      notificationService.showError('Service Unavailable', 'The service is temporarily unavailable. Please try again later.');
      break;

    default:
      // Other errors - show generic error message
      if (status >= 500) {
        notificationService.showError('Server Error', 'Something went wrong. Please try again later.');
      } else if (status >= 400) {
        notificationService.showError('Request Error', apiError.message);
      }
      break;
  }
}

/**
 * Gets default error message based on HTTP status code
 */
function getDefaultErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status as keyof typeof HTTP_ERROR_MESSAGES] || 'An unexpected error occurred';
}

/**
 * Checks if this is a background request that shouldn't show loading
 */
function isBackgroundRequest(req: HttpRequest<unknown>): boolean {
  // Check for custom header indicating background request
  return req.headers.has('X-Background-Request') || 
         req.url.includes('/Auth/refresh') ||
         req.url.includes('/notifications/poll');
}

/**
 * Checks if this is an authentication-related request
 */
function isAuthRelatedRequest(): boolean {
  // This would be set by the auth interceptor or service
  // For now, check current URL
  return window.location.pathname.includes('/auth/');
}

/**
 * Determines if error should be silenced (not shown to user)
 */
function shouldSilenceError(req: HttpRequest<unknown>, status: number): boolean {
  // Don't show notifications for certain requests or status codes
  const silentUrls = [
    '/Auth/refresh',
    '/notifications/poll',
    '/health-check'
  ];

  const silentStatuses = [401]; // 401 is handled by auth interceptor

  return silentUrls.some(url => req.url.includes(url)) || 
         silentStatuses.includes(status);
}