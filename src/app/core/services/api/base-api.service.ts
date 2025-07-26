import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ApiErrorResponse, ApiResponse, RequestOptions } from '../../models/api.models';
import { APP_CONSTANTS } from '../../constants/app.constants';

/**
 * Base API service providing common HTTP operations
 * All API services should extend this class
 */
@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  protected http = inject(HttpClient);
  protected readonly baseUrls = environment.apiUrls;

  constructor() {
    // Debug: Log the environment being used
    console.log('🔧 Environment loaded:', environment);
    console.log('🔧 API URLs:', this.baseUrls);
  }

  /**
   * Builds HTTP headers with common settings
   */
  protected buildHeaders(additionalHeaders?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (additionalHeaders) {
      Object.keys(additionalHeaders).forEach(key => {
        headers = headers.set(key, additionalHeaders[key]);
      });
    }

    return headers;
  }

  /**
   * Builds HTTP params from object
   */
  protected buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  /**
   * Builds complete URL for API endpoint
   */
  protected buildUrl(endpoint: keyof typeof environment.apiUrls, path: string): string {
    const baseUrl = this.baseUrls[endpoint];
    if (!baseUrl) {
      throw new Error(`API endpoint '${endpoint}' not configured`);
    }
    
    // Ensure proper URL formatting
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Generic GET request
   */
  protected get<T>(
    endpoint: keyof typeof environment.apiUrls, 
    path: string, 
    options?: RequestOptions
  ): Observable<T> {
    const url = this.buildUrl(endpoint, path);
    const headers = this.buildHeaders(options?.headers);
    const params = this.buildParams(options?.params);

    return this.http.get<T>(url, { headers, params }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT),
      retry({
        count: options?.retries || APP_CONSTANTS.API.RETRY_ATTEMPTS,
        delay: (error, retryCount) => timer(APP_CONSTANTS.API.RETRY_DELAY * retryCount)
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic POST request
   */
  protected post<T>(
    endpoint: keyof typeof environment.apiUrls,
    path: string,
    body: any,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.buildUrl(endpoint, path);
    const headers = this.buildHeaders(options?.headers);
    const params = this.buildParams(options?.params);

    return this.http.post<T>(url, body, { headers, params }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT),
      retry({
        count: options?.retries || APP_CONSTANTS.API.RETRY_ATTEMPTS,
        delay: (error, retryCount) => timer(APP_CONSTANTS.API.RETRY_DELAY * retryCount)
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic PUT request
   */
  protected put<T>(
    endpoint: keyof typeof environment.apiUrls,
    path: string,
    body: any,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.buildUrl(endpoint, path);
    const headers = this.buildHeaders(options?.headers);
    const params = this.buildParams(options?.params);

    return this.http.put<T>(url, body, { headers, params }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT),
      retry({
        count: options?.retries || APP_CONSTANTS.API.RETRY_ATTEMPTS,
        delay: (error, retryCount) => timer(APP_CONSTANTS.API.RETRY_DELAY * retryCount)
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic DELETE request
   */
  protected delete<T>(
    endpoint: keyof typeof environment.apiUrls,
    path: string,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.buildUrl(endpoint, path);
    const headers = this.buildHeaders(options?.headers);
    const params = this.buildParams(options?.params);

    return this.http.delete<T>(url, { headers, params }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT),
      retry({
        count: options?.retries || APP_CONSTANTS.API.RETRY_ATTEMPTS,
        delay: (error, retryCount) => timer(APP_CONSTANTS.API.RETRY_DELAY * retryCount)
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic PATCH request
   */
  protected patch<T>(
    endpoint: keyof typeof environment.apiUrls,
    path: string,
    body: any,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.buildUrl(endpoint, path);
    const headers = this.buildHeaders(options?.headers);
    const params = this.buildParams(options?.params);

    return this.http.patch<T>(url, body, { headers, params }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT),
      retry({
        count: options?.retries || APP_CONSTANTS.API.RETRY_ATTEMPTS,
        delay: (error, retryCount) => timer(APP_CONSTANTS.API.RETRY_DELAY * retryCount)
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * File upload request
   */
  protected uploadFile<T>(
    endpoint: keyof typeof environment.apiUrls,
    path: string,
    formData: FormData,
    options?: RequestOptions
  ): Observable<T> {
    const url = this.buildUrl(endpoint, path);
    
    // Don't set Content-Type for file uploads - let browser set it with boundary
    let headers = new HttpHeaders();
    if (options?.headers) {
      Object.keys(options.headers).forEach(key => {
        if (key.toLowerCase() !== 'content-type') {
          headers = headers.set(key, options.headers![key]);
        }
      });
    }

    const params = this.buildParams(options?.params);

    return this.http.post<T>(url, formData, { headers, params }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT * 3), // Longer timeout for uploads
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Download file request
   */
  protected downloadFile(
    endpoint: keyof typeof environment.apiUrls,
    path: string,
    options?: RequestOptions
  ): Observable<Blob> {
    const url = this.buildUrl(endpoint, path);
    const headers = this.buildHeaders(options?.headers);
    const params = this.buildParams(options?.params);

    return this.http.get(url, { 
      headers, 
      params, 
      responseType: 'blob' 
    }).pipe(
      timeout(options?.timeout || APP_CONSTANTS.API.TIMEOUT * 2),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Handles HTTP errors and transforms them to consistent format
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiErrorResponse;

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      apiError = {
        message: 'Network error occurred. Please check your connection.',
        errors: [error.error.message],
        timestamp: new Date().toISOString(),
        statusCode: 0
      };
    } else {
      // Server-side error
      const errorBody = error.error;
      
      if (errorBody && typeof errorBody === 'object') {
        // API returned structured error
        apiError = {
          message: errorBody.message || this.getDefaultErrorMessage(error.status),
          errors: errorBody.errors || [],
          timestamp: errorBody.timestamp || new Date().toISOString(),
          traceId: errorBody.traceId,
          statusCode: error.status
        };
      } else {
        // API returned unstructured error
        apiError = {
          message: this.getDefaultErrorMessage(error.status),
          errors: [error.statusText || 'Unknown error'],
          timestamp: new Date().toISOString(),
          statusCode: error.status
        };
      }
    }

    // Log error for debugging
    console.error('API Error:', apiError);

    return throwError(() => apiError);
  }

  /**
   * Gets default error message based on HTTP status code
   */
  private getDefaultErrorMessage(status: number): string {
    const httpErrorMessages: Record<number, string> = {
      400: 'Bad Request - Invalid data provided',
      401: 'Unauthorized - Please log in again',
      403: 'Forbidden - You don\'t have permission to access this resource',
      404: 'Not Found - The requested resource was not found',
      409: 'Conflict - The resource already exists',
      422: 'Validation Error - Please check your input',
      429: 'Too Many Requests - Please try again later',
      500: 'Internal Server Error - Something went wrong on our end',
      502: 'Bad Gateway - Service temporarily unavailable',
      503: 'Service Unavailable - Please try again later'
    };

    return httpErrorMessages[status] || 'An unexpected error occurred';
  }

  /**
   * Checks if the application is online
   */
  protected isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Builds query string from object
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  }
}