// Generic API Response Models
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  message: string;
  errors: string[];
  timestamp: string;
  traceId?: string;
  statusCode?: number;
}

export interface ApiSuccessResponse<T = any> {
  message: string;
  success: boolean;
  timestamp: string;
  data?: T;
}

// Pagination Models
export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search and Filter Models
export interface SearchRequest {
  searchTerm: string;
  filters?: Record<string, any>;
  pagination?: PaginationRequest;
}

export interface SearchResponse<T> extends PaginationResponse<T> {
  searchTerm: string;
  totalMatchingRecords: number;
}

// HTTP Request Options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

// Loading State Management
export interface LoadingState {
  loading: boolean;
  error: ApiErrorResponse | null;
  lastUpdated: Date | null;
}

// Validation Models
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// File Upload Models
export interface FileUploadRequest {
  file: File;
  description?: string;
  tags?: string[];
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
}

// Audit Models
export interface AuditInfo {
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  version?: number;
}

// Environment Configuration
export interface EnvironmentConfig {
  production: boolean;
  apiUrls: Record<string, string>;
  jwt: {
    tokenKey: string;
    refreshTokenKey: string;
    tokenExpirationKey: string;
  };
  app: {
    name: string;
    version: string;
    defaultLanguage: string;
    dateFormat: string;
    timeFormat: string;
  };
}

// HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503
}

// API Endpoint Types
export type ApiEndpoint = 'auth' | 'users' | 'security' | 'visitors' | 'billing' | 'sales' | 'notifications';

// Request/Response Interceptor Types
export interface InterceptorRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
}

export interface InterceptorResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  duration: number;
}