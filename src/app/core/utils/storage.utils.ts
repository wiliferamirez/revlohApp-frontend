/**
 * Utility functions for browser storage operations
 * Provides secure and type-safe storage management
 */
export class StorageUtils {

  /**
   * Checks if storage is available
   */
  static isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const test = '__storage_test__';
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sets item in localStorage with error handling
   */
  static setLocalStorage<T>(key: string, value: T): boolean {
    try {
      if (!this.isStorageAvailable('localStorage')) return false;
      
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting localStorage:', error);
      return false;
    }
  }

  /**
   * Gets item from localStorage with type safety
   */
  static getLocalStorage<T>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.isStorageAvailable('localStorage')) return defaultValue || null;
      
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return defaultValue || null;
    }
  }

  /**
   * Removes item from localStorage
   */
  static removeLocalStorage(key: string): boolean {
    try {
      if (!this.isStorageAvailable('localStorage')) return false;
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage:', error);
      return false;
    }
  }

  /**
   * Clears all localStorage data
   */
  static clearLocalStorage(): boolean {
    try {
      if (!this.isStorageAvailable('localStorage')) return false;
      
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Sets item in sessionStorage with error handling
   */
  static setSessionStorage<T>(key: string, value: T): boolean {
    try {
      if (!this.isStorageAvailable('sessionStorage')) return false;
      
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
      return false;
    }
  }

  /**
   * Gets item from sessionStorage with type safety
   */
  static getSessionStorage<T>(key: string, defaultValue?: T): T | null {
    try {
      if (!this.isStorageAvailable('sessionStorage')) return defaultValue || null;
      
      const item = sessionStorage.getItem(key);
      if (item === null) return defaultValue || null;
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Error getting sessionStorage:', error);
      return defaultValue || null;
    }
  }

  /**
   * Removes item from sessionStorage
   */
  static removeSessionStorage(key: string): boolean {
    try {
      if (!this.isStorageAvailable('sessionStorage')) return false;
      
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing sessionStorage:', error);
      return false;
    }
  }

  /**
   * Sets encrypted storage (for sensitive data)
   */
  static setSecureStorage<T>(key: string, value: T): boolean {
    try {
      // Basic encoding (in production, use proper encryption)
      const encoded = btoa(JSON.stringify(value));
      return this.setLocalStorage(key, encoded);
    } catch (error) {
      console.error('Error setting secure storage:', error);
      return false;
    }
  }

  /**
   * Gets encrypted storage (for sensitive data)
   */
  static getSecureStorage<T>(key: string, defaultValue?: T): T | null {
    try {
      const encoded = this.getLocalStorage<string>(key);
      if (!encoded) return defaultValue || null;
      
      const decoded = atob(encoded);
      return JSON.parse(decoded) as T;
    } catch (error) {
      console.error('Error getting secure storage:', error);
      return defaultValue || null;
    }
  }

  /**
   * Sets storage with expiration
   */
  static setStorageWithExpiry<T>(key: string, value: T, expiryMinutes: number): boolean {
    try {
      const expiryTime = new Date().getTime() + (expiryMinutes * 60 * 1000);
      const item = {
        value,
        expiry: expiryTime
      };
      
      return this.setLocalStorage(key, item);
    } catch (error) {
      console.error('Error setting storage with expiry:', error);
      return false;
    }
  }

  /**
   * Gets storage with expiration check
   */
  static getStorageWithExpiry<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.getLocalStorage<{ value: T; expiry: number }>(key);
      if (!item) return defaultValue || null;
      
      const now = new Date().getTime();
      if (now > item.expiry) {
        this.removeLocalStorage(key);
        return defaultValue || null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error getting storage with expiry:', error);
      return defaultValue || null;
    }
  }

  /**
   * Gets all keys from localStorage
   */
  static getLocalStorageKeys(): string[] {
    try {
      if (!this.isStorageAvailable('localStorage')) return [];
      
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Gets storage size estimation
   */
  static getStorageSize(): { localStorage: number; sessionStorage: number } {
    let localSize = 0;
    let sessionSize = 0;

    try {
      if (this.isStorageAvailable('localStorage')) {
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localSize += localStorage[key].length + key.length;
          }
        }
      }

      if (this.isStorageAvailable('sessionStorage')) {
        for (const key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            sessionSize += sessionStorage[key].length + key.length;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }

    return { localStorage: localSize, sessionStorage: sessionSize };
  }

  /**
   * Cleans expired items from storage
   */
  static cleanExpiredStorage(): number {
    let cleanedCount = 0;

    try {
      const keys = this.getLocalStorageKeys();
      
      keys.forEach(key => {
        const item = this.getLocalStorage<{ value: any; expiry: number }>(key);
        if (item && item.expiry && new Date().getTime() > item.expiry) {
          this.removeLocalStorage(key);
          cleanedCount++;
        }
      });
    } catch (error) {
      console.error('Error cleaning expired storage:', error);
    }

    return cleanedCount;
  }

  /**
   * Backs up storage data
   */
  static backupStorage(): string {
    try {
      const backup = {
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage },
        timestamp: new Date().toISOString()
      };
      
      return JSON.stringify(backup);
    } catch (error) {
      console.error('Error backing up storage:', error);
      return '';
    }
  }

  /**
   * Restores storage from backup
   */
  static restoreStorage(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      
      if (backup.localStorage) {
        for (const key in backup.localStorage) {
          localStorage.setItem(key, backup.localStorage[key]);
        }
      }
      
      if (backup.sessionStorage) {
        for (const key in backup.sessionStorage) {
          sessionStorage.setItem(key, backup.sessionStorage[key]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error restoring storage:', error);
      return false;
    }
  }

  /**
   * Removes storage items by prefix
   */
  static removeByPrefix(prefix: string): number {
    let removedCount = 0;

    try {
      const keys = this.getLocalStorageKeys();
      
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          this.removeLocalStorage(key);
          removedCount++;
        }
      });
    } catch (error) {
      console.error('Error removing storage by prefix:', error);
    }

    return removedCount;
  }
}