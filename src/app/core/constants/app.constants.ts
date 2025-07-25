// Application Constants
export const APP_CONSTANTS = {
  // Application Info
  APP_NAME: 'RevlohApp',
  APP_VERSION: '1.0.0',
  
  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'revloh_access_token',
    REFRESH_TOKEN: 'revloh_refresh_token',
    TOKEN_EXPIRATION: 'revloh_token_expiration',
    USER_PREFERENCES: 'revloh_user_preferences',
    THEME: 'revloh_theme',
    LANGUAGE: 'revloh_language',
    LAST_LOGIN: 'revloh_last_login'
  },

  // API Configuration
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  },

  // Authentication
  AUTH: {
    TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128
  },

  // Date and Time Formats
  DATE_FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    INPUT: 'yyyy-MM-dd',
    DATETIME: 'dd/MM/yyyy HH:mm',
    TIME: 'HH:mm',
    ISO: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
  },

  // Validation Patterns
  VALIDATION: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE: /^[0-9+\-\s\(\)]+$/,
    IDENTIFICATION: /^[0-9]{10}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },

  // UI Configuration
  UI: {
    DEBOUNCE_TIME: 300,
    TOAST_DURATION: 5000,
    DIALOG_WIDTH: '400px',
    CONFIRM_DIALOG_WIDTH: '350px',
    TABLE_ROWS_PER_PAGE: [10, 20, 50, 100],
    SIDEBAR_WIDTH: '250px',
    MOBILE_BREAKPOINT: 768
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 10485760,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv'],
    CHUNK_SIZE: 1048576 // 1MB chunks
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_SIZE: 20,
    MAX_SIZE: 100,
    SIZE_OPTIONS: [10, 20, 50, 100]
  },

  // Security
  SECURITY: {
    SESSION_TIMEOUT: 3600000, // 1 hour
    IDLE_TIMEOUT: 1800000, // 30 minutes
    MAX_CONCURRENT_SESSIONS: 3,
    CSRF_TOKEN_HEADER: 'X-CSRF-TOKEN'
  },

  // Notifications
  NOTIFICATIONS: {
    MAX_DISPLAY: 5,
    AUTO_DISMISS_TIME: 5000,
    POLL_INTERVAL: 30000 // 30 seconds
  },

  // Cache
  CACHE: {
    DEFAULT_TTL: 300000, // 5 minutes
    USER_PROFILE_TTL: 600000, // 10 minutes
    LOOKUP_DATA_TTL: 1800000 // 30 minutes
  }
} as const;

// Enum Constants
export enum PersonTypes {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  STAFF = 'Staff',
  VISITOR = 'Visitor',
  EXTERNAL_AGENT = 'ExternalAgent'
}

export enum PersonStatuses {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended',
  PENDING_VERIFICATION = 'PendingVerification',
  LOCKED = 'Locked'
}

export enum SecurityAlertSeverities {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum SecurityAlertTypes {
  BRUTE_FORCE_ATTACK = 'BruteForceAttack',
  SUSPICIOUS_LOGIN_PATTERN = 'SuspiciousLoginPattern',
  UNUSUAL_LOCATION = 'UnusualLocation',
  ACCOUNT_LOCKOUT = 'AccountLockout',
  MASS_FAILED_ATTEMPTS = 'MassFailedAttempts',
  TOKEN_COMPROMISE = 'TokenCompromise'
}

// HTTP Status Messages
export const HTTP_ERROR_MESSAGES = {
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
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in',
  LOGOUT: 'Successfully logged out',
  REGISTRATION: 'Account created successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  DATA_SAVED: 'Data saved successfully',
  DATA_DELETED: 'Data deleted successfully'
} as const;