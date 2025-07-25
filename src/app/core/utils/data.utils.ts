import { format, parseISO, isValid, addDays, subDays, startOfDay, endOfDay, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { APP_CONSTANTS } from '../constants/app.constants';

/**
 * Utility functions for date and time operations
 * Uses date-fns for reliable date manipulation
 */
export class DateUtils {
  
  /**
   * Formats a date string or Date object for display
   */
  static formatForDisplay(date: string | Date | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      return format(dateObj, APP_CONSTANTS.DATE_FORMATS.DISPLAY);
    } catch {
      return '';
    }
  }

  /**
   * Formats a date for HTML input elements
   */
  static formatForInput(date: string | Date | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      return format(dateObj, APP_CONSTANTS.DATE_FORMATS.INPUT);
    } catch {
      return '';
    }
  }

  /**
   * Formats a date with time for display
   */
  static formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      return format(dateObj, APP_CONSTANTS.DATE_FORMATS.DATETIME);
    } catch {
      return '';
    }
  }

  /**
   * Formats time only
   */
  static formatTime(date: string | Date | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      return format(dateObj, APP_CONSTANTS.DATE_FORMATS.TIME);
    } catch {
      return '';
    }
  }

  /**
   * Converts to ISO string for API calls
   */
  static toISOString(date: string | Date | null | undefined): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      return dateObj.toISOString();
    } catch {
      return '';
    }
  }

  /**
   * Gets relative time description (e.g., "2 hours ago", "in 3 days")
   */
  static getRelativeTime(date: string | Date): string {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return '';
      
      const now = new Date();
      const diffMinutes = differenceInMinutes(now, dateObj);
      const diffHours = differenceInHours(now, dateObj);
      const diffDays = differenceInDays(now, dateObj);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      
      return this.formatForDisplay(dateObj);
    } catch {
      return '';
    }
  }

  /**
   * Validates if a date string is valid
   */
  static isValidDate(date: string | Date | null | undefined): boolean {
    if (!date) return false;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return isValid(dateObj);
    } catch {
      return false;
    }
  }

  /**
   * Gets the start of day for a date
   */
  static getStartOfDay(date: string | Date): Date | null {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return null;
      
      return startOfDay(dateObj);
    } catch {
      return null;
    }
  }

  /**
   * Gets the end of day for a date
   */
  static getEndOfDay(date: string | Date): Date | null {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return null;
      
      return endOfDay(dateObj);
    } catch {
      return null;
    }
  }

  /**
   * Adds days to a date
   */
  static addDays(date: string | Date, days: number): Date | null {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return null;
      
      return addDays(dateObj, days);
    } catch {
      return null;
    }
  }

  /**
   * Subtracts days from a date
   */
  static subtractDays(date: string | Date, days: number): Date | null {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return null;
      
      return subDays(dateObj, days);
    } catch {
      return null;
    }
  }

  /**
   * Checks if a date is in the past
   */
  static isPastDate(date: string | Date): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      
      return dateObj < new Date();
    } catch {
      return false;
    }
  }

  /**
   * Checks if a date is in the future
   */
  static isFutureDate(date: string | Date): boolean {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return false;
      
      return dateObj > new Date();
    } catch {
      return false;
    }
  }

  /**
   * Gets date range for common periods
   */
  static getDateRange(period: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth'): { start: Date; end: Date } {
    const now = new Date();
    const today = startOfDay(now);
    
    switch (period) {
      case 'today':
        return { start: today, end: endOfDay(now) };
      
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { start: yesterday, end: endOfDay(yesterday) };
      
      case 'last7days':
        return { start: subDays(today, 6), end: endOfDay(now) };
      
      case 'last30days':
        return { start: subDays(today, 29), end: endOfDay(now) };
      
      case 'thisMonth':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: startOfMonth, end: endOfDay(now) };
      
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: lastMonthStart, end: endOfDay(lastMonthEnd) };
      
      default:
        return { start: today, end: endOfDay(now) };
    }
  }

  /**
   * Calculates age from birth date
   */
  static calculateAge(birthDate: string | Date): number {
    try {
      const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
      if (!isValid(birth)) return 0;
      
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return Math.max(0, age);
    } catch {
      return 0;
    }
  }
}