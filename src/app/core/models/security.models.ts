// Security Alert Models
export interface SecurityAlert {
  alertId: string;
  type: SecurityAlertType;
  severity: SecurityAlertSeverity;
  title: string;
  description: string;
  createdAt: string;
  relatedIpAddress?: string;
  relatedPersonId?: string;
  metadata: Record<string, any>;
}

export interface SecurityAlertsResponse {
  alerts: SecurityAlert[];
  totalCount: number;
  severityFilter: string;
  timeWindowHours: number;
}

// Security Alert Enums
export enum SecurityAlertType {
  BruteForceAttack = 'BruteForceAttack',
  SuspiciousLoginPattern = 'SuspiciousLoginPattern',
  UnusualLocation = 'UnusualLocation',
  AccountLockout = 'AccountLockout',
  MassFailedAttempts = 'MassFailedAttempts',
  TokenCompromise = 'TokenCompromise'
}

export enum SecurityAlertSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

// IP Management Models
export interface BlockedIp {
  ipAddress: string;
  blockedAt: string;
  blockedUntil?: string;
  blockReason: string;
  blockedByUser: string;
  totalAttempts: number;
}

export interface BlockedIpsResponse {
  blockedIps: BlockedIp[];
  totalCount: number;
}

export interface BlockIpRequest {
  ipAddress: string;
  reason: string;
  blockDurationHours?: number;
}

export interface BlockIpResponse {
  success: boolean;
  message: string;
  ipAddress: string;
  blockedAt?: string;
}

export interface UnblockIpRequest {
  ipAddress: string;
  reason: string;
}

export interface UnblockIpResponse {
  success: boolean;
  message: string;
  ipAddress: string;
  unblockedAt?: string;
}

// Login Attempt Models
export interface LoginAttempt {
  attemptedAt: string;
  isSuccessful: boolean;
  failureReason?: string;
  ipAddress: string;
  userAgent?: string;
}

export interface UserLoginAttemptsResponse {
  personId: string;
  attempts: LoginAttempt[];
  totalCount: number;
  timeWindowHours: number;
  includesSuccessful: boolean;
}

// Statistics Models
export interface LoginStatisticsResponse {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  uniqueUsers: number;
  uniqueIpAddresses: number;
  successRate: number;
  failureReasons: Record<string, number>;
  periodDays: number;
  startDate: string;
  endDate: string;
}

// Audit Export Models
export interface SecurityAuditExportRequest {
  startDate: string;
  endDate: string;
  format: 'JSON' | 'CSV';
}

export interface SecurityAuditExportResponse {
  exportedAt: string;
  startDate: string;
  endDate: string;
  format: string;
  recordCount: number;
  data: string;
}

// Security Configuration Models
export interface SecurityConfiguration {
  maxFailedAttempts: number;
  accountLockoutDurationMinutes: number;
  failedAttemptWindowMinutes: number;
  maxIpFailedAttempts: number;
  ipBlockDurationHours: number;
  ipAnalysisWindowMinutes: number;
  enableAutomaticIpBlocking: boolean;
  enableBruteForceDetection: boolean;
  bruteForceDetectionThreshold: number;
}

// Real-time Security Monitoring
export interface SecurityDashboardData {
  activeAlerts: SecurityAlert[];
  recentFailedAttempts: number;
  blockedIpsCount: number;
  suspiciousActivities: number;
  systemHealth: 'Healthy' | 'Warning' | 'Critical';
  lastUpdated: string;
}