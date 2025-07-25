import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  PasswordValidationRequest,
  PasswordValidationResponse,
  UserInfo
} from '../../models/auth.models';

/**
 * Authentication API service
 * Handles all authentication-related HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService extends BaseApiService {
  private readonly endpoint = 'auth' as const;

  /**
   * Authenticates user with email and password
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(this.endpoint, '/Auth/login', request);
  }

  /**
   * Refreshes access token using refresh token
   */
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.post<RefreshTokenResponse>(this.endpoint, '/Auth/refresh', request);
  }

  /**
   * Logs out user by revoking refresh token
   */
  logout(request: LogoutRequest): Observable<LogoutResponse> {
    return this.post<LogoutResponse>(this.endpoint, '/Auth/logout', request);
  }

  /**
   * Logs out user from all devices
   */
  logoutAll(): Observable<LogoutAllResponse> {
    return this.post<LogoutAllResponse>(this.endpoint, '/Auth/logout-all', {});
  }

  /**
   * Changes user's password
   */
  changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.post<ChangePasswordResponse>(this.endpoint, '/Auth/change-password', request);
  }

  /**
   * Gets current user information
   */
  getCurrentUser(): Observable<UserInfo> {
    return this.get<UserInfo>(this.endpoint, '/Auth/me');
  }

  /**
   * Validates password strength
   */
  validatePassword(request: PasswordValidationRequest): Observable<PasswordValidationResponse> {
    return this.post<PasswordValidationResponse>(this.endpoint, '/Auth/validate-password', request);
  }

  /**
   * Checks authentication status
   */
  checkAuthStatus(): Observable<UserInfo> {
    return this.getCurrentUser();
  }

  /**
   * Validates token by attempting to get user info
   */
  validateToken(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getCurrentUser().subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}