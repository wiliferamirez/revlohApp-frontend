import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private authService = inject(AuthService);

  // Computed properties
  readonly user = computed(() => this.authService.user());
  readonly currentYear = new Date().getFullYear();
  readonly appVersion = environment.app?.version || '1.0.0';
  readonly appName = environment.app?.name || 'RevlohApp';
  readonly isProduction = environment.production;

  /**
   * Gets the current year for copyright
   */
  getCurrentYear(): number {
    return this.currentYear;
  }

  /**
   * Gets the app version
   */
  getAppVersion(): string {
    return this.appVersion;
  }

  /**
   * Gets the app name
   */
  getAppName(): string {
    return this.appName;
  }

  /**
   * Opens privacy policy
   */
  openPrivacyPolicy(): void {
    window.open('/privacy-policy', '_blank');
  }

  /**
   * Opens terms of service
   */
  openTermsOfService(): void {
    window.open('/terms-of-service', '_blank');
  }

  /**
   * Opens contact page
   */
  openContact(): void {
    window.open('/contact', '_blank');
  }

  /**
   * Opens help documentation
   */
  openHelp(): void {
    window.open('/help', '_blank');
  }

  /**
   * Gets build information for debugging
   */
  getBuildInfo(): string {
    const buildDate = new Date().toLocaleDateString();
    const env = this.isProduction ? 'Production' : 'Development';
    return `Build: ${buildDate} | Environment: ${env}`;
  }

  /**
   * Gets system status (placeholder for future implementation)
   */
  getSystemStatus(): 'online' | 'maintenance' | 'offline' {
    // This would typically check actual system status
    return 'online';
  }

  /**
   * Gets status icon based on system status
   */
  getStatusIcon(): string {
    const status = this.getSystemStatus();
    switch (status) {
      case 'online':
        return 'pi pi-check-circle';
      case 'maintenance':
        return 'pi pi-exclamation-triangle';
      case 'offline':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-question-circle';
    }
  }

  /**
   * Gets status color based on system status
   */
  getStatusColor(): string {
    const status = this.getSystemStatus();
    switch (status) {
      case 'online':
        return 'var(--green-500)';
      case 'maintenance':
        return 'var(--orange-500)';
      case 'offline':
        return 'var(--red-500)';
      default:
        return 'var(--gray-500)';
    }
  }

  /**
   * Gets status text based on system status
   */
  getStatusText(): string {
    const status = this.getSystemStatus();
    switch (status) {
      case 'online':
        return 'All systems operational';
      case 'maintenance':
        return 'Under maintenance';
      case 'offline':
        return 'System offline';
      default:
        return 'Status unknown';
    }
  }
}