import { Component, computed, signal, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// PrimeNG Components
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/services/auth.service';

export interface MenuItemWithPermissions extends MenuItem {
  permissions?: string[];
  roles?: string[];
  children?: MenuItemWithPermissions[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PanelMenuModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Inputs and Outputs
  visible = input<boolean>(false);
  visibilityChange = output<boolean>();

  // Computed properties
  readonly user = computed(() => this.authService.user());

  // Menu items
  private menuItemsSignal = signal<MenuItemWithPermissions[]>([
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'User Management',
      icon: 'pi pi-users',
      expanded: false,
      roles: ['SuperAdmin', 'Admin'],
      items: [
        {
          label: 'All Users',
          icon: 'pi pi-list',
          routerLink: '/users'
        },
        {
          label: 'Add User',
          icon: 'pi pi-user-plus',
          routerLink: '/users/add'
        },
        {
          label: 'User Roles',
          icon: 'pi pi-shield',
          routerLink: '/users/roles'
        }
      ]
    },
    {
      label: 'Security',
      icon: 'pi pi-lock',
      expanded: false,
      roles: ['SuperAdmin', 'Admin', 'Staff'],
      items: [
        {
          label: 'Security Alerts',
          icon: 'pi pi-exclamation-triangle',
          routerLink: '/security/alerts'
        },
        {
          label: 'Blocked IPs',
          icon: 'pi pi-ban',
          routerLink: '/security/blocked-ips'
        },
        {
          label: 'Login Statistics',
          icon: 'pi pi-chart-line',
          routerLink: '/security/statistics'
        },
        {
          label: 'Audit Logs',
          icon: 'pi pi-file-edit',
          routerLink: '/security/audit'
        }
      ]
    },
    {
      label: 'Visitors',
      icon: 'pi pi-user',
      expanded: false,
      items: [
        {
          label: 'All Visitors',
          icon: 'pi pi-list',
          routerLink: '/visitors'
        },
        {
          label: 'Check In',
          icon: 'pi pi-sign-in',
          routerLink: '/visitors/checkin'
        },
        {
          label: 'Visitor Reports',
          icon: 'pi pi-chart-bar',
          routerLink: '/visitors/reports'
        }
      ]
    },
    {
      label: 'Sales',
      icon: 'pi pi-dollar',
      expanded: false,
      roles: ['SuperAdmin', 'Admin', 'Staff'],
      items: [
        {
          label: 'Sales Dashboard',
          icon: 'pi pi-chart-line',
          routerLink: '/sales'
        },
        {
          label: 'Leads',
          icon: 'pi pi-users',
          routerLink: '/sales/leads'
        },
        {
          label: 'Opportunities',
          icon: 'pi pi-star',
          routerLink: '/sales/opportunities'
        },
        {
          label: 'Reports',
          icon: 'pi pi-file-pdf',
          routerLink: '/sales/reports'
        }
      ]
    },
    {
      label: 'Billing',
      icon: 'pi pi-credit-card',
      expanded: false,
      roles: ['SuperAdmin', 'Admin'],
      items: [
        {
          label: 'Invoices',
          icon: 'pi pi-file',
          routerLink: '/billing/invoices'
        },
        {
          label: 'Payments',
          icon: 'pi pi-money-bill',
          routerLink: '/billing/payments'
        },
        {
          label: 'Billing Reports',
          icon: 'pi pi-chart-pie',
          routerLink: '/billing/reports'
        }
      ]
    },
    {
      label: 'Notifications',
      icon: 'pi pi-bell',
      routerLink: '/notifications'
    }
  ]);

  readonly filteredMenuItems = computed(() => {
    const user = this.user();
    if (!user) return [];

    return this.filterMenuItemsByPermissions(this.menuItemsSignal(), user);
  });

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveMenuItems();
      });
  }

  /**
   * Filters menu items based on user permissions and roles
   */
  private filterMenuItemsByPermissions(items: MenuItemWithPermissions[], user: any): MenuItem[] {
    return items
      .filter(item => this.hasAccessToMenuItem(item, user))
      .map(item => ({
        ...item,
        items: item.items ? this.filterMenuItemsByPermissions(item.items, user) : undefined
      }))
      .filter(item => !item.items || item.items.length > 0); // Remove empty parent items
  }

  /**
   * Checks if user has access to a menu item
   */
  private hasAccessToMenuItem(item: MenuItemWithPermissions, user: any): boolean {
    // SuperAdmin has access to everything
    if (user.personType === 'SuperAdmin') {
      return true;
    }

    // Check role requirements
    if (item.roles && item.roles.length > 0) {
      if (!item.roles.includes(user.personType)) {
        return false;
      }
    }

    // Check permission requirements
    if (item.permissions && item.permissions.length > 0) {
      const userPermissions = this.authService.getUserPermissions();
      const hasPermission = item.permissions.some(permission => 
        userPermissions.includes(permission) || userPermissions.includes('*')
      );
      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }

  /**
   * Updates active menu items based on current route
   */
  private updateActiveMenuItems(): void {
    const currentUrl = this.router.url;
    this.setActiveMenuItem(this.menuItemsSignal(), currentUrl);
  }

  /**
   * Sets active state for menu items based on current URL
   */
  private setActiveMenuItem(items: MenuItemWithPermissions[], currentUrl: string): void {
    items.forEach(item => {
      if (item.routerLink && currentUrl.startsWith(item.routerLink)) {
        item.styleClass = 'active-menu-item';
      } else {
        item.styleClass = '';
      }

      if (item.items) {
        this.setActiveMenuItem(item.items, currentUrl);
      }
    });
  }

  /**
   * Handles menu item click
   */
  onMenuItemClick(item: MenuItem): void {
    if (item.routerLink && this.isMobileView()) {
      // Close sidebar on mobile after navigation
      setTimeout(() => {
        this.visibilityChange.emit(false);
      }, 100);
    }
  }

  /**
   * Opens help documentation
   */
  openHelp(): void {
    // This would open help documentation or support
    console.log('Open help');
  }

  /**
   * Checks if current view is mobile
   */
  private isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Gets the current app version
   */
  getAppVersion(): string {
    return '1.0.0';
  }

  /**
   * Handles keyboard navigation
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.visible()) {
      this.visibilityChange.emit(false);
    }
  }
}