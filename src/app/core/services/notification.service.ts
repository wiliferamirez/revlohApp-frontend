import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  createdAt: Date;
}

/**
 * Notification service for displaying user messages
 * Manages toast notifications and alerts across the application
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Signal-based state for notifications
  private notificationsSignal = signal<Notification[]>([]);
  
  // Observable for components that need it
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Computed signal for accessing notifications
  readonly notifications = this.notificationsSignal.asReadonly();

  /**
   * Shows a success notification
   */
  showSuccess(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'success',
      title,
      message,
      duration: duration || APP_CONSTANTS.NOTIFICATIONS.AUTO_DISMISS_TIME
    });
  }

  /**
   * Shows an error notification
   */
  showError(title: string, message: string, persistent = false): void {
    this.addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? undefined : APP_CONSTANTS.NOTIFICATIONS.AUTO_DISMISS_TIME * 2 // Longer for errors
    });
  }

  /**
   * Shows a warning notification
   */
  showWarning(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || APP_CONSTANTS.NOTIFICATIONS.AUTO_DISMISS_TIME
    });
  }

  /**
   * Shows an info notification
   */
  showInfo(title: string, message: string, duration?: number): void {
    this.addNotification({
      type: 'info',
      title,
      message,
      duration: duration || APP_CONSTANTS.NOTIFICATIONS.AUTO_DISMISS_TIME
    });
  }

  /**
   * Adds a custom notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      createdAt: new Date()
    };

    const currentNotifications = this.notificationsSignal();
    const updatedNotifications = [...currentNotifications, newNotification];

    // Limit the number of notifications displayed
    const limitedNotifications = updatedNotifications.slice(-APP_CONSTANTS.NOTIFICATIONS.MAX_DISPLAY);

    this.notificationsSignal.set(limitedNotifications);
    this.notificationsSubject.next(limitedNotifications);

    // Auto-dismiss if duration is specified
    if (newNotification.duration && !newNotification.persistent) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  }

  /**
   * Removes a notification by ID
   */
  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSignal();
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    
    this.notificationsSignal.set(filteredNotifications);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Clears all notifications
   */
  clearAll(): void {
    this.notificationsSignal.set([]);
    this.notificationsSubject.next([]);
  }

  /**
   * Clears notifications by type
   */
  clearByType(type: Notification['type']): void {
    const currentNotifications = this.notificationsSignal();
    const filteredNotifications = currentNotifications.filter(n => n.type !== type);
    
    this.notificationsSignal.set(filteredNotifications);
    this.notificationsSubject.next(filteredNotifications);
  }

  /**
   * Gets notification count by type
   */
  getCountByType(type: Notification['type']): number {
    return this.notificationsSignal().filter(n => n.type === type).length;
  }

  /**
   * Checks if there are any error notifications
   */
  hasErrors(): boolean {
    return this.getCountByType('error') > 0;
  }

  /**
   * Checks if there are any warning notifications
   */
  hasWarnings(): boolean {
    return this.getCountByType('warning') > 0;
  }

  /**
   * Gets the most recent notification
   */
  getLatest(): Notification | null {
    const notifications = this.notificationsSignal();
    return notifications.length > 0 ? notifications[notifications.length - 1] : null;
  }

  /**
   * Shows a confirmation-style notification with action buttons
   */
  showConfirmation(
    title: string, 
    message: string, 
    onConfirm?: () => void, 
    onCancel?: () => void
  ): void {
    // This would typically integrate with a confirmation dialog component
    // For now, we'll create a persistent notification
    this.addNotification({
      type: 'warning',
      title,
      message,
      persistent: true
    });
  }

  /**
   * Shows a loading notification
   */
  showLoading(message: string = 'Loading...'): string {
    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title: 'Please wait',
      message,
      persistent: true,
      createdAt: new Date()
    };

    const currentNotifications = this.notificationsSignal();
    this.notificationsSignal.set([...currentNotifications, notification]);
    this.notificationsSubject.next(this.notificationsSignal());

    return notification.id;
  }

  /**
   * Hides a loading notification
   */
  hideLoading(id: string): void {
    this.removeNotification(id);
  }

  /**
   * Generates a unique ID for notifications
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}