import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, timer, EMPTY } from 'rxjs';
import { map, catchError, tap, switchMap, finalize } from 'rxjs/operators';

import { AuthApiService } from './api/auth-api.service';
import { StorageUtils } from '../utils/storage.utils';
import { APP_CONSTANTS } from '../constants/app.constants';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  UserInfo,
  TokenInfo,
  AuthenticationResult
} from '../models/auth.models';
import { ApiErrorResponse } from '../models/api.models';

/**
 * Core authentication service
 * Manages authentication state, tokens, and user session
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = inject(AuthApiService);
  private router = inject(Router);

  // Reactive state using signals (Angular 19)
  private isAuthenticatedSignal = signal<boolean>(false);
  private userSignal = signal<UserInfo | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Computed signals
  readonly isAuthenticated = computed(() => this.isAuthenticatedSignal());
  readonly user = computed(() => this.userSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  // User info for components that need observables
  private userSubject = new BehaviorSubject<UserInfo | null>(null);
  public user$ = this.userSubject.asObservable();

  // Authentication state for components that need observables
  private authSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.authSubject.asObservable();

  // Token refresh timer
  private tokenRefreshTimer?: any;

  constructor() {
    this.initializeAuthState();
    this.startTokenRefreshTimer();
  }

  /**
   * Initializes authentication state from storage
   */
  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.setAuthenticatedState(user, token);
    } else {
      this.clearAuthState();
    }
  }

  /**
   * Authenticates user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthenticationResult> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.authApi.login(credentials).pipe(
      tap((response: LoginResponse) => {
        const tokenInfo: TokenInfo = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tokenType: response.tokenType,
          expiresAt: new Date(Date.now() + response.expiresIn * 1000),
          isExpired: false
        };

        this.storeTokens(tokenInfo);
        this.storeUser(response.user);
        this.setAuthenticatedState(response.user, tokenInfo);
      }),
      map((response: LoginResponse) => ({
        success: true,
        user: response.user,
        redirectUrl: '/dashboard'
      } as AuthenticationResult)),
      catchError((error: ApiErrorResponse) => {
        this.errorSignal.set(error.message);
        return throwError(() => ({
          success: false,
          message: error.message
        } as AuthenticationResult));
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Logs out the current user
   */
  logout(): Observable<boolean> {
    this.loadingSignal.set(true);

    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      this.performLogout();
      return new Observable<boolean>(observer => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.authApi.logout({ refreshToken }).pipe(
      tap(() => this.performLogout()),
      map(() => true),
      catchError(() => {
        // Even if logout API fails, clear local state
        this.performLogout();
        return new Observable<boolean>(observer => {
          observer.next(true);
          observer.complete();
        });
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Logs out from all devices
   */
  logoutAll(): Observable<boolean> {
    this.loadingSignal.set(true);

    return this.authApi.logoutAll().pipe(
      tap(() => this.performLogout()),
      map((response) => response.success),
      catchError(() => {
        this.performLogout();
        return new Observable<boolean>(observer => {
          observer.next(true);
          observer.complete();
        });
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Changes user's password
   */
  changePassword(request: ChangePasswordRequest): Observable<boolean> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.authApi.changePassword(request).pipe(
      map((response) => response.success),
      catchError((error: ApiErrorResponse) => {
        this.errorSignal.set(error.message);
        return throwError(() => error);
      }),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Refreshes the access token
   */
  refreshToken(): Observable<boolean> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      this.clearAuthState();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.authApi.refreshToken({ refreshToken }).pipe(
      tap((response) => {
        const tokenInfo: TokenInfo = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tokenType: response.tokenType,
          expiresAt: new Date(Date.now() + response.expiresIn * 1000),
          isExpired: false
        };

        this.storeTokens(tokenInfo);
        this.updateTokenRefreshTimer();
      }),
      map(() => true),
      catchError((error) => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets current access token
   */
  getAccessToken(): string | null {
    return StorageUtils.getLocalStorage<string>(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Gets current refresh token
   */
  getRefreshToken(): string | null {
    return StorageUtils.getLocalStorage<string>(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Checks if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.userSignal();
    // This would typically check user.permissions array
    // For now, check by person type
    return user?.personType === 'SuperAdmin' || user?.personType === 'Admin';
  }

  /**
   * Checks if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user?.personType === role;
  }

  /**
   * Gets user's permissions (placeholder for future implementation)
   */
  getUserPermissions(): string[] {
    const user = this.userSignal();
    if (!user) return [];
    
    // This would typically come from the user object or API
    const rolePermissions: Record<string, string[]> = {
      'SuperAdmin': ['*'], // All permissions
      'Admin': ['user:read', 'user:write', 'security:read', 'security:write'],
      'Staff': ['user:read', 'security:read'],
      'Visitor': ['profile:read', 'profile:write']
    };

    return rolePermissions[user.personType] || [];
  }

  /**
   * Performs the actual logout operation
   */
  private performLogout(): void {
    this.clearTokenRefreshTimer();
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Sets authenticated state
   */
  private setAuthenticatedState(user: UserInfo, token: TokenInfo): void {
    this.userSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    this.userSubject.next(user);
    this.authSubject.next(true);
    this.updateTokenRefreshTimer();
  }

  /**
   * Clears authentication state
   */
  private clearAuthState(): void {
    this.userSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.userSubject.next(null);
    this.authSubject.next(false);
    this.clearStoredAuth();
    this.clearTokenRefreshTimer();
  }

  /**
   * Stores tokens in secure storage
   */
  private storeTokens(tokenInfo: TokenInfo): void {
    StorageUtils.setLocalStorage(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, tokenInfo.accessToken);
    StorageUtils.setLocalStorage(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, tokenInfo.refreshToken);
    StorageUtils.setLocalStorage(APP_CONSTANTS.STORAGE_KEYS.TOKEN_EXPIRATION, tokenInfo.expiresAt.toISOString());
  }

  /**
   * Stores user information
   */
  private storeUser(user: UserInfo): void {
    StorageUtils.setLocalStorage('user_info', user);
  }

  /**
   * Gets stored tokens
   */
  private getStoredToken(): TokenInfo | null {
    const accessToken = StorageUtils.getLocalStorage<string>(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = StorageUtils.getLocalStorage<string>(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    const expirationStr = StorageUtils.getLocalStorage<string>(APP_CONSTANTS.STORAGE_KEYS.TOKEN_EXPIRATION);

    if (!accessToken || !refreshToken || !expirationStr) return null;

    const expiresAt = new Date(expirationStr);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresAt,
      isExpired: this.isTokenExpired({ expiresAt } as TokenInfo)
    };
  }

  /**
   * Gets stored user
   */
  private getStoredUser(): UserInfo | null {
    return StorageUtils.getLocalStorage<UserInfo>('user_info');
  }

  /**
   * Gets stored refresh token
   */
  private getStoredRefreshToken(): string | null {
    return StorageUtils.getLocalStorage<string>(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clears stored authentication data
   */
  private clearStoredAuth(): void {
    StorageUtils.removeLocalStorage(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    StorageUtils.removeLocalStorage(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
    StorageUtils.removeLocalStorage(APP_CONSTANTS.STORAGE_KEYS.TOKEN_EXPIRATION);
    StorageUtils.removeLocalStorage('user_info');
  }

  /**
   * Checks if token is expired
   */
  private isTokenExpired(token: TokenInfo): boolean {
    if (!token.expiresAt) return true;
    
    const now = new Date();
    const expiration = new Date(token.expiresAt);
    
    // Consider token expired 5 minutes before actual expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return now.getTime() >= (expiration.getTime() - bufferTime);
  }

  /**
   * Starts automatic token refresh timer
   */
  private startTokenRefreshTimer(): void {
    // Check every minute if token needs refresh
    this.tokenRefreshTimer = timer(60000, 60000).subscribe(() => {
      const token = this.getStoredToken();
      if (token && this.isAuthenticated() && this.shouldRefreshToken(token)) {
        this.refreshToken().subscribe({
          error: (error) => console.error('Auto token refresh failed:', error)
        });
      }
    });
  }

  /**
   * Updates token refresh timer
   */
  private updateTokenRefreshTimer(): void {
    // Timer is already running, no need to restart
  }

  /**
   * Clears token refresh timer
   */
  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Checks if token should be refreshed
   */
  private shouldRefreshToken(token: TokenInfo): boolean {
    if (!token.expiresAt) return false;
    
    const now = new Date();
    const expiration = new Date(token.expiresAt);
    const timeUntilExpiry = expiration.getTime() - now.getTime();
    
    // Refresh if token expires within 5 minutes
    return timeUntilExpiry <= APP_CONSTANTS.AUTH.TOKEN_REFRESH_THRESHOLD;
  }
}