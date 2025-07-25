import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ValidationUtils } from '../../../../core/utils/validation.utils';
import { UserApiService } from '../../../../core/services/api/user-api.service';
import { APP_CONSTANTS, PersonTypes, SUCCESS_MESSAGES } from '../../../../core/constants/app.constants';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    MessageModule,
    ProgressSpinnerModule,
    StepsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userApiService = inject(UserApiService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Component state
  loading = signal<boolean>(false);
  emailChecking = signal<boolean>(false);
  idChecking = signal<boolean>(false);
  currentStep = signal<number>(0);
  acceptedTerms = signal<boolean>(false);

  // Form
  registerForm!: FormGroup;

  // Dropdown options
  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Prefer not to say', value: 'PreferNotToSay' }
  ];

  phoneTypeOptions = [
    { label: 'Personal', value: 'Personal' },
    { label: 'Work', value: 'Work' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Home', value: 'Home' }
  ];

  // Steps for the registration process
  steps: MenuItem[] = [
    { label: 'Personal Info', icon: 'pi pi-user' },
    { label: 'Contact Details', icon: 'pi pi-envelope' },
    { label: 'Account Setup', icon: 'pi pi-cog' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.setupAsyncValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the registration form with validation
   */
  private initializeForm(): void {
    this.registerForm = this.fb.group({
      // Step 1: Personal Information
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.nameValidator
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.nameValidator
      ]],
      secondLastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.nameValidator
      ]],
      middleName: ['', [
        Validators.maxLength(100),
        this.nameValidator
      ]],
      identificationNumber: ['', [
        Validators.required,
        this.idNumberValidator
      ]],
      birthDate: ['', [
        Validators.required,
        this.birthDateValidator
      ]],
      gender: [''],

      // Step 2: Contact Details
      email: ['', [
        Validators.required,
        Validators.email,
        this.customEmailValidator
      ]],
      phoneNumber: ['', [
        this.phoneValidator
      ]],
      phoneTypeName: ['Personal'],

      // Step 3: Account Setup
      password: ['', [
        Validators.required,
        this.passwordValidator
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
      personTypeName: [PersonTypes.VISITOR],
      acceptTerms: [false, [
        Validators.requiredTrue
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Sets up async validation for email and ID availability
   */
  private setupAsyncValidation(): void {
    // Email availability check
    this.registerForm.get('email')?.valueChanges.pipe(
      debounceTime(APP_CONSTANTS.UI.DEBOUNCE_TIME),
      distinctUntilChanged(),
      switchMap(email => {
        if (!email || this.registerForm.get('email')?.hasError('email')) {
          return of(null);
        }
        
        this.emailChecking.set(true);
        return this.userApiService.checkEmailAvailability(email);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.emailChecking.set(false);
        if (response && !response.isAvailable) {
          this.registerForm.get('email')?.setErrors({ emailTaken: true });
        }
      },
      error: () => {
        this.emailChecking.set(false);
      }
    });

    // ID availability check
    this.registerForm.get('identificationNumber')?.valueChanges.pipe(
      debounceTime(APP_CONSTANTS.UI.DEBOUNCE_TIME),
      distinctUntilChanged(),
      switchMap(id => {
        if (!id || this.registerForm.get('identificationNumber')?.hasError('invalidId')) {
          return of(null);
        }
        
        this.idChecking.set(true);
        return this.userApiService.checkIdentificationAvailability(id);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.idChecking.set(false);
        if (response && !response.isAvailable) {
          this.registerForm.get('identificationNumber')?.setErrors({ idTaken: true });
        }
      },
      error: () => {
        this.idChecking.set(false);
      }
    });
  }

  /**
   * Custom validators
   */
  private nameValidator(control: any) {
    if (!control.value) return null;
    const name = control.value.trim();
    if (!ValidationUtils.isValidLength(name, 2, 100)) {
      return { invalidName: true };
    }
    // Check for valid name characters (letters, spaces, accents)
    const namePattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    return namePattern.test(name) ? null : { invalidName: true };
  }

  private customEmailValidator(control: any) {
    if (!control.value) return null;
    return ValidationUtils.isValidEmail(control.value) ? null : { invalidEmail: true };
  }

  private idNumberValidator(control: any) {
    if (!control.value) return null;
    return ValidationUtils.isValidIdentification(control.value) ? null : { invalidId: true };
  }

  private phoneValidator(control: any) {
    if (!control.value) return null;
    return ValidationUtils.isValidPhone(control.value) ? null : { invalidPhone: true };
  }

  private birthDateValidator(control: any) {
    if (!control.value) return null;
    const birthDate = new Date(control.value);
    const today = new Date();
    
    if (birthDate > today) return { futureDate: true };
    
    // Check if person is at least 18 years old
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const actualAge = (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age;
    
    if (actualAge < 18) return { underAge: true };
    if (actualAge > 120) return { tooOld: true };
    
    return null;
  }

  private passwordValidator(control: any) {
    if (!control.value) return null;
    const validation = ValidationUtils.validatePassword(control.value);
    return validation.isValid ? null : { weakPassword: validation.errors };
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return ValidationUtils.validatePasswordConfirmation(password.value, confirmPassword.value) 
      ? null 
      : { passwordMismatch: true };
  }

  /**
   * Moves to next step
   */
  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep.set(Math.min(this.currentStep() + 1, this.steps.length - 1));
    }
  }

  /**
   * Moves to previous step
   */
  previousStep(): void {
    this.currentStep.set(Math.max(this.currentStep() - 1, 0));
  }

  /**
   * Validates current step
   */
  private validateCurrentStep(): boolean {
    const step = this.currentStep();
    let fieldsToValidate: string[] = [];

    switch (step) {
      case 0: // Personal Info
        fieldsToValidate = ['firstName', 'lastName', 'secondLastName', 'identificationNumber', 'birthDate'];
        break;
      case 1: // Contact Details
        fieldsToValidate = ['email'];
        break;
      case 2: // Account Setup
        fieldsToValidate = ['password', 'confirmPassword', 'acceptTerms'];
        break;
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const control = this.registerForm.get(field);
      control?.markAsTouched();
      if (control?.invalid) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Handles form submission
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    const formData = this.registerForm.value;

    // Format data for API
    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      secondLastName: formData.secondLastName,
      middleName: formData.middleName || undefined,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      identificationNumber: formData.identificationNumber,
      gender: formData.gender || undefined,
      birthDate: formData.birthDate.toISOString().split('T')[0],
      personTypeName: formData.personTypeName,
      phoneNumber: formData.phoneNumber || undefined,
      phoneTypeName: formData.phoneTypeName
    };

    this.userApiService.register(registrationData).subscribe({
      next: (result) => {
        if (result.success) {
          this.notificationService.showSuccess(
            'Registration Successful!',
            SUCCESS_MESSAGES.REGISTRATION
          );
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.notificationService.showError(
          'Registration Failed',
          error.message || 'An error occurred during registration'
        );
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  /**
   * Navigates to login page
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Handles terms acceptance
   */
  onTermsChange(accepted: boolean): void {
    this.acceptedTerms.set(accepted);
    this.registerForm.patchValue({ acceptTerms: accepted });
  }

  /**
   * Opens terms of service
   */
  openTermsOfService(): void {
    window.open('/terms-of-service', '_blank');
  }

  /**
   * Opens privacy policy
   */
  openPrivacyPolicy(): void {
    window.open('/privacy-policy', '_blank');
  }

  /**
   * Gets form control for easier access in template
   */
  getFormControl(controlName: string) {
    return this.registerForm.get(controlName);
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

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldName(controlName)} is required`;
    }
    if (errors['invalidEmail']) {
      return 'Please enter a valid email address';
    }
    if (errors['emailTaken']) {
      return 'This email is already registered';
    }
    if (errors['invalidId']) {
      return 'Please enter a valid identification number';
    }
    if (errors['idTaken']) {
      return 'This identification number is already registered';
    }
    if (errors['invalidName']) {
      return 'Please enter a valid name (letters only)';
    }
    if (errors['invalidPhone']) {
      return 'Please enter a valid phone number';
    }
    if (errors['futureDate']) {
      return 'Birth date cannot be in the future';
    }
    if (errors['underAge']) {
      return 'You must be at least 18 years old';
    }
    if (errors['tooOld']) {
      return 'Please enter a valid birth date';
    }
    if (errors['weakPassword']) {
      return errors['weakPassword'][0] || 'Password does not meet requirements';
    }
    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    return 'Invalid input';
  }

  /**
   * Gets user-friendly field name
   */
  private getFieldName(controlName: string): string {
    const fieldNames: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      secondLastName: 'Second last name',
      middleName: 'Middle name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Password confirmation',
      identificationNumber: 'Identification number',
      birthDate: 'Birth date',
      phoneNumber: 'Phone number',
      acceptTerms: 'Terms acceptance'
    };
    return fieldNames[controlName] || controlName;
  }

  /**
   * Marks all form controls as touched
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Gets current year for validation
   */
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Gets maximum date for birth date (18 years ago)
   */
  getMaxBirthDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }

  /**
   * Gets minimum date for birth date (120 years ago)
   */
  getMinBirthDate(): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    return date;
  }
}