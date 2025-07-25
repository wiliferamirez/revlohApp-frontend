import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ValidationUtils } from '../../../../core/utils/validation.utils';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessageModule,
    ProgressSpinnerModule,
    DividerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Component state
  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  rememberMe = signal<boolean>(false);
  isProduction = environment.production;

  // Form
  loginForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadRememberedCredentials();
  }

  /**
   * Initializes the login form with validation
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        this.customEmailValidator
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      rememberMe: [false]
    });
  }

  /**
   * Custom email validator using ValidationUtils
   */
  private customEmailValidator(control: any) {
    if (!control.value) return null;
    
    const isValid = ValidationUtils.isValidEmail(control.value);
    return isValid ? null : { invalidEmail: true };
  }

  /**
   * Loads remembered credentials if available
   */
  private loadRememberedCredentials(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
      this.rememberMe.set(true);
    }
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    const { email, password, rememberMe } = this.loginForm.value;

    // Save or remove remembered email
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.authService.login({ email, password }).subscribe({
      next: (result) => {
        if (result.success) {
          this.notificationService.showSuccess(
            'Welcome Back!',
            `Successfully logged in as ${result.user?.firstName}`
          );
          
          // Navigate to intended destination or dashboard
          const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl');
          this.router.navigateByUrl(redirectUrl);
        }
      },
      error: (error) => {
        this.notificationService.showError(
          'Login Failed',
          error.message || 'Invalid email or password'
        );
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  /**
   * Toggles password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Handles "Remember Me" checkbox change
   */
  onRememberMeChange(checked: boolean): void {
    this.rememberMe.set(checked);
    this.loginForm.patchValue({ rememberMe: checked });
  }

  /**
   * Navigates to registration page
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navigates to forgot password page
   */
  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Marks all form controls as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Gets form control for easier access in template
   */
  getFormControl(controlName: string) {
    return this.loginForm.get(controlName);
  }

  /**
   * Checks if form control has error
   */
  hasError(controlName: string, errorType: string): boolean {
    const control = this.getFormControl(controlName);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  /**
   * Gets error message for form control
   */
  getErrorMessage(controlName: string): string {
    const control = this.getFormControl(controlName);
    if (!control?.errors) return '';

    if (control.hasError('required')) {
      return `${this.getFieldName(controlName)} is required`;
    }
    if (control.hasError('email') || control.hasError('invalidEmail')) {
      return 'Please enter a valid email address';
    }
    return 'Invalid input';
  }

  /**
   * Gets user-friendly field name
   */
  private getFieldName(controlName: string): string {
    const fieldNames: Record<string, string> = {
      email: 'Email',
      password: 'Password'
    };
    return fieldNames[controlName] || controlName;
  }

  /**
   * Handles Enter key press for form submission
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid && !this.loading()) {
      this.onSubmit();
    }
  }

  /**
   * Demo login (for development/testing)
   */
  demoLogin(userType: 'admin' | 'staff' | 'visitor'): void {
    const demoCredentials = {
      admin: { email: 'admin@revlohapp.com', password: 'Admin123!' },
      staff: { email: 'staff@revlohapp.com', password: 'Staff123!' },
      visitor: { email: 'visitor@revlohapp.com', password: 'Visitor123!' }
    };

    const credentials = demoCredentials[userType];
    this.loginForm.patchValue(credentials);
    this.onSubmit();
  }

  /**
   * Gets current year for footer
   */
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}