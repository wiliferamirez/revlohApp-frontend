import { Component, computed, inject, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { BadgeDirective } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    AvatarModule,
    BadgeModule,
    BadgeDirective,
    TooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Inputs and Outputs
  sidebarVisible = input<boolean>(false);
  menuToggle = output<void>();

  // Computed properties
  readonly user = computed(() => this.authService.user());
  readonly notificationCount = computed(() => {
    const notifications = this.notificationService.notifications();
    return notifications.filter(n => n.type === 'error' || n.type === 'warning').length;
  });

  // User menu items
  readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    {
      separator: true
    },
    {
      label: 'Change Password',
      icon: 'pi pi-key',
      command: () => this.openChangePasswordDialog()
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ]);

  /**
   * Handles menu toggle click
   */
  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  /**
   * Gets user initials for avatar
   */
  getUserInitials(user: any): string {
    if (!user || !user.firstName || !user.lastName) {
      return 'U';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Gets current page title based on route
   */
  getPageTitle(): string {
    const url = this.router.url;
    const titleMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/profile': 'Profile',
      '/users': 'User Management',
      '/security': 'Security',
      '/security/alerts': 'Security Alerts',
      '/security/blocked-ips': 'Blocked IPs',
      '/visitors': 'Visitors',
      '/billing': 'Billing',
      '/sales': 'Sales',
      '/notifications': 'Notifications'
    };

    return titleMap[url] || 'RevlohApp';
  }

  /**
   * Toggles notifications panel
   */
  toggleNotifications(): void {
    // This would open a notifications sidebar or dropdown
    console.log('Toggle notifications');
  }

  /**
   * Toggles user menu
   */
  toggleUserMenu(event: Event): void {
    // The p-menu component handles this automatically
    // This method can be used for additional logic if needed
  }

  /**
   * Opens change password dialog
   */
  openChangePasswordDialog(): void {
    this.router.navigate(['/profile'], { fragment: 'change-password' });
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: (success) => {
        if (success) {
          this.notificationService.showSuccess(
            'Logged Out', 
            'You have been successfully logged out'
          );
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.notificationService.showError(
          'Logout Failed', 
          'An error occurred while logging out'
        );
      }
    });
  }

  /**
   * Gets notification badge class based on count
   */
  getNotificationBadgeClass(): string {
    const count = this.notificationCount();
    if (count === 0) return '';
    if (count < 5) return 'p-badge-warning';
    return 'p-badge-danger';
  }
}