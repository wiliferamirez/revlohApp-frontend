export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface LogoutAllResponse {
  success: boolean;
  sessionsTerminated: number;
  message: string;
}

// Password Management Models
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface PasswordValidationRequest {
  password: string;
}

export interface PasswordValidationResponse {
  isValid: boolean;
  errors: string[];
}

// User Information Model
export interface UserInfo {
  personId: string;
  firstName: string;
  lastName: string;
  email: string;
  personType: string;
  personStatus: string;
}

// Token Management
export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: Date;
  isExpired: boolean;
}

// Authentication State
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: TokenInfo | null;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: Date | null;
}

// Role and Permission Types
export type PersonType = 'SuperAdmin' | 'Admin' | 'Staff' | 'Visitor' | 'ExternalAgent';
export type PersonStatus = 'Active' | 'Inactive' | 'Suspended' | 'PendingVerification' | 'Locked';

// Authentication Helper Types
export interface AuthenticationResult {
  success: boolean;
  message?: string;
  redirectUrl?: string;
  user?: UserInfo;
}