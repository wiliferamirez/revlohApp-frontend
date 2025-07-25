import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Utility functions for data validation
 * Provides reusable validation logic across the application
 */
export class ValidationUtils {

  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    return APP_CONSTANTS.VALIDATION.EMAIL.test(email.trim());
  }

  /**
   * Validates phone number format
   */
  static isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    const cleanPhone = phone.replace(/\s/g, '');
    return APP_CONSTANTS.VALIDATION.PHONE.test(cleanPhone) && cleanPhone.length >= 7;
  }

  /**
   * Validates Ecuador identification number (cedula)
   */
  static isValidIdentification(identification: string): boolean {
    if (!identification || typeof identification !== 'string') return false;
    
    const cedula = identification.trim();
    if (!APP_CONSTANTS.VALIDATION.IDENTIFICATION.test(cedula)) return false;

    // Ecuador cedula validation algorithm
    const digits = cedula.split('').map(Number);
    const province = parseInt(cedula.substring(0, 2));
    
    // Province validation (01-24)
    if (province < 1 || province > 24) return false;

    // Third digit validation (0-6 for natural persons)
    if (digits[2] > 6) return false;

    // Calculate verification digit
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let product = digits[i] * coefficients[i];
      if (product > 9) product -= 9;
      sum += product;
    }

    const remainder = sum % 10;
    const verificationDigit = remainder === 0 ? 0 : 10 - remainder;

    return verificationDigit === digits[9];
  }

  /**
   * Validates password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || typeof password !== 'string') {
      return { isValid: false, errors: ['Password is required'] };
    }

    if (password.length < APP_CONSTANTS.AUTH.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${APP_CONSTANTS.AUTH.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (password.length > APP_CONSTANTS.AUTH.PASSWORD_MAX_LENGTH) {
      errors.push(`Password must not exceed ${APP_CONSTANTS.AUTH.PASSWORD_MAX_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validates password confirmation
   */
  static validatePasswordConfirmation(password: string, confirmation: string): boolean {
    return password === confirmation;
  }

  /**
   * Validates required field
   */
  static isRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * Validates string length
   */
  static isValidLength(value: string, min: number, max?: number): boolean {
    if (!value || typeof value !== 'string') return false;
    const length = value.trim().length;
    if (length < min) return false;
    if (max && length > max) return false;
    return true;
  }

  /**
   * Validates numeric range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return typeof value === 'number' && value >= min && value <= max;
  }

  /**
   * Validates date format and range
   */
  static isValidDate(date: string, allowFuture = true, allowPast = true): boolean {
    if (!date) return false;

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;

    const now = new Date();
    if (!allowFuture && dateObj > now) return false;
    if (!allowPast && dateObj < now) return false;

    return true;
  }

  /**
   * Validates birth date (must be in past, reasonable age range)
   */
  static isValidBirthDate(birthDate: string): boolean {
    if (!this.isValidDate(birthDate, false, true)) return false;

    const birth = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();

    // Reasonable age range: 0-120 years
    return age >= 0 && age <= 120;
  }

  /**
   * Validates URL format
   */
  static isValidUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates file type
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    if (!file || !allowedTypes || allowedTypes.length === 0) return false;
    return allowedTypes.includes(file.type);
  }

  /**
   * Validates file size
   */
  static isValidFileSize(file: File, maxSizeBytes: number): boolean {
    if (!file) return false;
    return file.size <= maxSizeBytes;
  }

  /**
   * Sanitizes string input
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * Validates UUID format
   */
  static isValidUUID(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validates IP address format
   */
  static isValidIpAddress(ip: string): boolean {
    if (!ip || typeof ip !== 'string') return false;
    
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Validates pagination parameters
   */
  static isValidPagination(pageNumber: number, pageSize: number): boolean {
    return (
      Number.isInteger(pageNumber) && pageNumber >= 1 &&
      Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= APP_CONSTANTS.PAGINATION.MAX_SIZE
    );
  }

  /**
   * Validates sort parameters
   */
  static isValidSort(sortBy: string, allowedFields: string[]): boolean {
    if (!sortBy || typeof sortBy !== 'string') return false;
    return allowedFields.includes(sortBy);
  }

  /**
   * Comprehensive form validation
   */
  static validateForm(data: Record<string, any>, rules: Record<string, any>): { isValid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};

    for (const field in rules) {
      const fieldRules = rules[field];
      const value = data[field];
      const fieldErrors: string[] = [];

      if (fieldRules.required && !this.isRequired(value)) {
        fieldErrors.push(`${field} is required`);
      }

      if (value && fieldRules.email && !this.isValidEmail(value)) {
        fieldErrors.push(`${field} must be a valid email address`);
      }

      if (value && fieldRules.phone && !this.isValidPhone(value)) {
        fieldErrors.push(`${field} must be a valid phone number`);
      }

      if (value && fieldRules.minLength && !this.isValidLength(value, fieldRules.minLength)) {
        fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters long`);
      }

      if (value && fieldRules.maxLength && !this.isValidLength(value, 0, fieldRules.maxLength)) {
        fieldErrors.push(`${field} must not exceed ${fieldRules.maxLength} characters`);
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  }
}