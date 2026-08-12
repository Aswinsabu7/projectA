/**
 * Mirrors server/src/constants/permissions.js - single source of truth for
 * permission keys used by the *appHasPermission directive, PermissionGuard,
 * and UI conditionals.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  SUBSCRIBER_VIEW: 'SUBSCRIBER_VIEW',
  SUBSCRIBER_CREATE: 'SUBSCRIBER_CREATE',
  SUBSCRIBER_EDIT: 'SUBSCRIBER_EDIT',
  SUBSCRIBER_DELETE: 'SUBSCRIBER_DELETE',
  SUBSCRIBER_IMPORT: 'SUBSCRIBER_IMPORT',
  SUBSCRIBER_EXPORT: 'SUBSCRIBER_EXPORT',

  MESSAGE_VIEW: 'MESSAGE_VIEW',
  MESSAGE_SEND: 'MESSAGE_SEND',

  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',

  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_EDIT: 'ROLE_EDIT',
  ROLE_DELETE: 'ROLE_DELETE',

  SETTINGS_VIEW: 'SETTINGS_VIEW',
  SETTINGS_EDIT: 'SETTINGS_EDIT',

  AUDIT_LOG_VIEW: 'AUDIT_LOG_VIEW',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  USER: 'User',
} as const;
