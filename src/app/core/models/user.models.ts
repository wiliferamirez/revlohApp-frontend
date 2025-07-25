// User Registration Models
export interface UserRegistrationRequest {
  firstName: string;
  lastName: string;
  secondLastName: string;
  middleName?: string;
  email: string;
  password: string;
  confirmPassword: string;
  identificationNumber: string;
  gender?: string;
  birthDate: string;
  personTypeName?: string;
  phoneNumber?: string;
  phoneTypeName?: string;
}

export interface UserRegistrationResponse {
  success: boolean;
  message: string;
  user: UserInfo;
}

// User Profile Models
export interface UserProfile {
  user: UserInfo;
  personalInfo: PersonalInfo;
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
}

export interface PersonalInfo {
  middleName?: string;
  secondLastName: string;
  gender?: string;
  birthDate: string;
  identificationNumber: string;
}

export interface EmailAddress {
  emailAddressId: string;
  email: string;
  isPrimary: boolean;
  isVerified: boolean;
}

export interface PhoneNumber {
  phoneNumberId: string;
  number: string;
  countryCode: string;
  isPrimary: boolean;
  phoneType: string;
}

// Profile Update Models
export interface UserProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  middleName?: string;
  gender?: string;
  birthDate?: string;
}

export interface UserProfileUpdateResponse {
  success: boolean;
  message: string;
}

// Validation Models
export interface EmailAvailabilityResponse {
  email: string;
  isAvailable: boolean;
  message: string;
}

export interface IdentificationAvailabilityResponse {
  identificationNumber: string;
  isAvailable: boolean;
  message: string;
}

// User Summary for Lists/Tables
export interface UserSummary {
  personId: string;
  fullName: string;
  email: string;
  personTypeName: string;
  personStatusName: string;
  createdAt: string;
  isActive: boolean;
}

// Pagination and Filtering
export interface UserFilter {
  personTypeName?: string;
  personStatusName?: string;
  createdAfter?: string;
  createdBefore?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// User Management Actions
export interface UserStatusChangeRequest {
  personId: string;
  newStatusName: string;
  reason: string;
}

export interface UserTypeChangeRequest {
  personId: string;
  newTypeName: string;
}

// Import UserInfo from auth models
import { UserInfo } from './auth.models';