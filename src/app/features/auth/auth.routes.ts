import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    title: 'Login - RevlohApp'
   },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    title: 'Register - RevlohApp'
  }
//,
//   {
//     path: 'forgot-password',
//     loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
//     title: 'Forgot Password - RevlohApp'
//   },
//   {
//     path: 'reset-password',
//     loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
//     title: 'Reset Password - RevlohApp'
//   }
];