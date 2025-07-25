import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

import { NotificationService } from '../services/notification.service';

/**
 * Interface that components should implement to support unsaved changes detection
 */
export interface CanComponentDeactivate {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
  hasUnsavedChanges(): boolean;
}

/**
 * Unsaved changes guard (functional style for Angular 19)
 * Prevents navigation away from pages with unsaved changes
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate
): Observable<boolean> | Promise<boolean> | boolean => {
  const notificationService = inject(NotificationService);

  // If component doesn't implement the interface, allow navigation
  if (!component || typeof component.canDeactivate !== 'function') {
    return true;
  }

  // Check if component has unsaved changes
  if (!component.hasUnsavedChanges || !component.hasUnsavedChanges()) {
    return true;
  }

  // Component has unsaved changes, confirm with user
  return confirmNavigation(component, notificationService);
};

/**
 * Confirms navigation with user when there are unsaved changes
 */
function confirmNavigation(
  component: CanComponentDeactivate, 
  notificationService: NotificationService
): boolean | Promise<boolean> {
  // Use browser's native confirm dialog for now
  // In a real application, you'd use a custom dialog component
  const confirmed = confirm(
    'You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.'
  );

  if (!confirmed) {
    // User chose to stay, show a notification
    notificationService.showInfo(
      'Navigation Cancelled', 
      'You can continue editing. Don\'t forget to save your changes.'
    );
  }

  return confirmed;
}

/**
 * Enhanced version that uses a custom confirmation dialog
 * This would be used with a dialog service in a real application
 */
export function createUnsavedChangesGuardWithDialog(
  dialogService: any // Would be your custom dialog service
): CanDeactivateFn<CanComponentDeactivate> {
  return (component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean => {
    if (!component || !component.hasUnsavedChanges || !component.hasUnsavedChanges()) {
      return true;
    }

    // Use custom dialog service
    return dialogService.confirm({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.',
      confirmText: 'Leave Page',
      cancelText: 'Stay',
      confirmButtonClass: 'p-button-danger'
    });
  };
}

/**
 * Utility class for managing unsaved changes state in components
 */
export class UnsavedChangesTracker {
  private hasChanges = false;
  private originalData: any = null;
  private currentData: any = null;

  /**
   * Sets the original data to compare against
   */
  setOriginalData(data: any): void {
    this.originalData = JSON.stringify(data);
    this.hasChanges = false;
  }

  /**
   * Updates current data and checks for changes
   */
  updateCurrentData(data: any): void {
    this.currentData = JSON.stringify(data);
    this.hasChanges = this.originalData !== this.currentData;
  }

  /**
   * Checks if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  /**
   * Marks changes as saved (resets the tracker)
   */
  markAsSaved(): void {
    this.originalData = this.currentData;
    this.hasChanges = false;
  }

  /**
   * Manually sets the unsaved changes state
   */
  setUnsavedChanges(hasChanges: boolean): void {
    this.hasChanges = hasChanges;
  }

  /**
   * Resets the tracker
   */
  reset(): void {
    this.hasChanges = false;
    this.originalData = null;
    this.currentData = null;
  }
}

/**
 * Decorator for automatically tracking form changes
 */
export function TrackUnsavedChanges(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (this: any, ...args: any[]) {
    // Execute the original method
    const result = originalMethod.apply(this, args);

    // If the component has an unsaved changes tracker, update it
    if (this.unsavedChangesTracker && this.unsavedChangesTracker instanceof UnsavedChangesTracker) {
      this.unsavedChangesTracker.setUnsavedChanges(true);
    }

    return result;
  };

  return descriptor;
}