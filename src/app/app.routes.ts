import { Routes } from '@angular/router';
import { authGuard } from './Guard/auth.guard';
import { roleGuard } from './Guard/role.guard';

export const routes: Routes = [
    {path:'login',loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)},
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {path:'Registerbusiness',loadComponent: () => import('./registerbusiness/registerbusiness.component').then(m => m.RegisterbusinessComponent)},
    {path:'Customerregistration',loadComponent: () => import('./customerregistration/customerregistration.component').then(m => m.CustomerregistrationComponent)},
    {path:'Businesssearch',loadComponent: () => import('./businesssearch/businesssearch.component').then(m => m.BusinesssearchComponent), canActivate:[authGuard]},
    {path:'BusinessNameSearch',loadComponent: () => import('./business-name-search/business-name-search.component').then(m => m.BusinessNameSearchComponent), canActivate:[authGuard]},
    {path:'Forgot-password', loadComponent: () => import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)},
    {path:'Reset-password', loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent)},
    {path:'Change-password', loadComponent: () => import('./changepassword/changepassword.component').then(m => m.ChangepasswordComponent), canActivate:[authGuard]},
    {path: 'Subadmin',loadComponent: () => import('./subadmin/subadmin.component').then(m => m.SubadminComponent), canActivate:[authGuard, roleGuard]},
    {path: 'edit-user', loadComponent: () => import('./edit-user/edit-user.component').then(m => m.EditUserComponent)}
];
