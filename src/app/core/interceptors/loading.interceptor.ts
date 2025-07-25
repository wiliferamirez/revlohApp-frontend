import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../services/loading.service';

/**
 * Loading interceptor (functional style for Angular 19)
 * Manages global loading state for HTTP requests
 */
export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const loadingService = inject(LoadingService);

  // Skip loading for certain requests
  if (shouldSkipLoading(req)) {
    return next(req);
  }

  // Show loading indicator
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Hide loading indicator when request completes
      loadingService.hide();
    })
  );
};

/**
 * Determines if loading should be skipped for this request
 */
function shouldSkipLoading(req: HttpRequest<unknown>): boolean {
  // Skip loading for certain URLs or request types
  const skipUrls = [
    '/Auth/refresh',
    '/notifications/poll',
    '/health-check',
    '/ping'
  ];

  // Skip loading for background requests
  if (req.headers.has('X-Background-Request')) {
    return true;
  }

  // Skip loading for certain HTTP methods
  const skipMethods = ['OPTIONS'];
  if (skipMethods.includes(req.method)) {
    return true;
  }

  // Skip loading for certain URLs
  return skipUrls.some(url => req.url.includes(url));
}