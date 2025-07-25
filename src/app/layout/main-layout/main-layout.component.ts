import { Component, computed, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Components
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { NotificationService } from '../../core/services/notification.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarModule,
    ButtonModule,
    MenuModule,
    ToastModule,
    ProgressBarModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Layout state
  private sidebarVisibleSignal = signal<boolean>(true);
  private isMobileSignal = signal<boolean>(false);

  // Computed properties
  readonly sidebarVisible = computed(() => this.sidebarVisibleSignal());
  readonly isMobile = computed(() => this.isMobileSignal());
  readonly isLoading = computed(() => this.loadingService.isLoading());
  readonly user = computed(() => this.authService.user());

  ngOnInit(): void {
    this.checkMobileView();
    this.setupEventListeners();
    this.initializeLayout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggles sidebar visibility
   */
  toggleSidebar(): void {
    this.sidebarVisibleSignal.set(!this.sidebarVisible());
    this.saveSidebarState();
  }

  /**
   * Closes the sidebar
   */
  closeSidebar(): void {
    this.sidebarVisibleSignal.set(false);
    this.saveSidebarState();
  }

  /**
   * Opens the sidebar
   */
  openSidebar(): void {
    this.sidebarVisibleSignal.set(true);
    this.saveSidebarState();
  }

  /**
   * Handles sidebar visibility change from child component
   */
  onSidebarVisibilityChange(visible: boolean): void {
    this.sidebarVisibleSignal.set(visible);
    this.saveSidebarState();
  }

  /**
   * Checks if current view is mobile
   */
  private checkMobileView(): void {
    const isMobile = window.innerWidth <= 768;
    this.isMobileSignal.set(isMobile);
    
    // Auto-hide sidebar on mobile
    if (isMobile && this.sidebarVisible()) {
      this.sidebarVisibleSignal.set(false);
    }
  }

  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    // Listen to window resize
    window.addEventListener('resize', () => {
      this.checkMobileView();
    });

    // Listen to escape key for closing sidebar on mobile
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isMobile() && this.sidebarVisible()) {
        this.closeSidebar();
      }
    });

    // Listen to notifications and display them
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        // Handle notifications display logic here if needed
        // PrimeNG Toast will handle the display automatically
      });
  }

  /**
   * Initializes layout based on saved preferences
   */
  private initializeLayout(): void {
    const savedSidebarState = localStorage.getItem('sidebarVisible');
    if (savedSidebarState !== null) {
      const isVisible = savedSidebarState === 'true';
      this.sidebarVisibleSignal.set(isVisible && !this.isMobile());
    } else {
      // Default: show sidebar on desktop, hide on mobile
      this.sidebarVisibleSignal.set(!this.isMobile());
    }
  }

  /**
   * Saves sidebar state to localStorage
   */
  private saveSidebarState(): void {
    localStorage.setItem('sidebarVisible', this.sidebarVisible().toString());
  }

  /**
   * Gets current layout classes for dynamic styling
   */
  getLayoutClasses(): string[] {
    const classes = ['layout-wrapper'];
    
    if (this.sidebarVisible()) {
      classes.push('layout-sidebar-active');
    }
    
    if (this.isMobile()) {
      classes.push('layout-mobile');
    }
    
    return classes;
  }
}