import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import {
  UserRegistrationRequest,
  UserRegistrationResponse,
  UserProfile,
  UserProfileUpdateRequest,
  UserProfileUpdateResponse,
  EmailAvailabilityResponse,
  IdentificationAvailabilityResponse
} from '../../models/user.models';

/**
 * User API service
 * Handles all user-related HTTP requests
 */
@Injectable({
  providedIn: 'root'
})
export class UserApiService extends BaseApiService {
  private readonly endpoint = 'users' as const;

  /**
   * Registers a new user
   */
  register(request: UserRegistrationRequest): Observable<UserRegistrationResponse> {
    return this.post<UserRegistrationResponse>(this.endpoint, '/User/register', request);
  }

  /**
   * Gets current user profile
   */
  getProfile(): Observable<UserProfile> {
    return this.get<UserProfile>(this.endpoint, '/User/profile');
  }

  /**
   * Updates user profile
   */
  updateProfile(request: UserProfileUpdateRequest): Observable<UserProfileUpdateResponse> {
    return this.put<UserProfileUpdateResponse>(this.endpoint, '/User/profile', request);
  }

  /**
   * Checks if email is available for registration
   */
  checkEmailAvailability(email: string): Observable<EmailAvailabilityResponse> {
    return this.get<EmailAvailabilityResponse>(this.endpoint, '/User/check-email', {
      params: { email }
    });
  }

  /**
   * Checks if identification number is available for registration
   */
  checkIdentificationAvailability(identificationNumber: string): Observable<IdentificationAvailabilityResponse> {
    return this.get<IdentificationAvailabilityResponse>(this.endpoint, '/User/check-identification', {
      params: { identificationNumber }
    });
  }
}