import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';
import { permissionGuard } from './guards/permission.guard';
import { PERMISSIONS } from './shared/constants/permissions';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./core/layout/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.DASHBOARD_VIEW] },
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'subscribers',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.SUBSCRIBER_VIEW] },
        loadComponent: () =>
          import('./features/subscribers/subscriber-list/subscriber-list.component').then((m) => m.SubscriberListComponent),
      },
      {
        path: 'messages',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.MESSAGE_VIEW] },
        loadComponent: () =>
          import('./features/messages/message-history-list/message-history-list.component').then(
            (m) => m.MessageHistoryListComponent
          ),
      },
      {
        path: 'users',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.USER_VIEW] },
        loadComponent: () => import('./features/users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'roles',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.ROLE_VIEW] },
        loadComponent: () => import('./features/roles/role-list/role-list.component').then((m) => m.RoleListComponent),
      },
      {
        path: 'audit-log',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.AUDIT_LOG_VIEW] },
        loadComponent: () => import('./features/audit-log/audit-log-list.component').then((m) => m.AuditLogListComponent),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: { permissions: [PERMISSIONS.SETTINGS_VIEW] },
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      { path: 'forbidden', loadComponent: () => import('./core/forbidden/forbidden.component').then((m) => m.ForbiddenComponent) },
    ],
  },
  { path: '**', loadComponent: () => import('./core/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];

