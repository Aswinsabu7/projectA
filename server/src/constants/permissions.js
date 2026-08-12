/**
 * Canonical list of all permission keys available in the system.
 * Permissions are seeded into the database (Permission collection)
 * and referenced by Roles. This list is the single source of truth
 * used by the seed script and by `requirePermission` middleware docs.
 */
const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'DASHBOARD_VIEW',

  // Subscribers
  SUBSCRIBER_VIEW: 'SUBSCRIBER_VIEW',
  SUBSCRIBER_CREATE: 'SUBSCRIBER_CREATE',
  SUBSCRIBER_EDIT: 'SUBSCRIBER_EDIT',
  SUBSCRIBER_DELETE: 'SUBSCRIBER_DELETE',
  SUBSCRIBER_IMPORT: 'SUBSCRIBER_IMPORT',
  SUBSCRIBER_EXPORT: 'SUBSCRIBER_EXPORT',

  // Messages
  MESSAGE_VIEW: 'MESSAGE_VIEW',
  MESSAGE_SEND: 'MESSAGE_SEND',

  // Users
  USER_VIEW: 'USER_VIEW',
  USER_CREATE: 'USER_CREATE',
  USER_EDIT: 'USER_EDIT',
  USER_DELETE: 'USER_DELETE',

  // Roles
  ROLE_VIEW: 'ROLE_VIEW',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_EDIT: 'ROLE_EDIT',
  ROLE_DELETE: 'ROLE_DELETE',

  // Settings
  SETTINGS_VIEW: 'SETTINGS_VIEW',
  SETTINGS_EDIT: 'SETTINGS_EDIT',

  // Audit Log
  AUDIT_LOG_VIEW: 'AUDIT_LOG_VIEW',
};

const PERMISSION_GROUPS = [
  {
    group: 'Dashboard',
    permissions: [{ key: PERMISSIONS.DASHBOARD_VIEW, description: 'View dashboard widgets & charts' }],
  },
  {
    group: 'Subscribers',
    permissions: [
      { key: PERMISSIONS.SUBSCRIBER_VIEW, description: 'View subscribers' },
      { key: PERMISSIONS.SUBSCRIBER_CREATE, description: 'Create subscribers' },
      { key: PERMISSIONS.SUBSCRIBER_EDIT, description: 'Edit subscribers' },
      { key: PERMISSIONS.SUBSCRIBER_DELETE, description: 'Delete subscribers' },
      { key: PERMISSIONS.SUBSCRIBER_IMPORT, description: 'Import subscribers from Excel' },
      { key: PERMISSIONS.SUBSCRIBER_EXPORT, description: 'Export subscribers to Excel' },
    ],
  },
  {
    group: 'Messages',
    permissions: [
      { key: PERMISSIONS.MESSAGE_VIEW, description: 'View WhatsApp message history' },
      { key: PERMISSIONS.MESSAGE_SEND, description: 'Send / resend WhatsApp reminders' },
    ],
  },
  {
    group: 'Users',
    permissions: [
      { key: PERMISSIONS.USER_VIEW, description: 'View users' },
      { key: PERMISSIONS.USER_CREATE, description: 'Create users' },
      { key: PERMISSIONS.USER_EDIT, description: 'Edit / activate / deactivate users' },
      { key: PERMISSIONS.USER_DELETE, description: 'Delete users' },
    ],
  },
  {
    group: 'Roles',
    permissions: [
      { key: PERMISSIONS.ROLE_VIEW, description: 'View roles' },
      { key: PERMISSIONS.ROLE_CREATE, description: 'Create roles' },
      { key: PERMISSIONS.ROLE_EDIT, description: 'Edit / activate / deactivate roles' },
      { key: PERMISSIONS.ROLE_DELETE, description: 'Delete roles' },
    ],
  },
  {
    group: 'Settings',
    permissions: [
      { key: PERMISSIONS.SETTINGS_VIEW, description: 'View application settings' },
      { key: PERMISSIONS.SETTINGS_EDIT, description: 'Edit application settings' },
    ],
  },
  {
    group: 'Audit',
    permissions: [{ key: PERMISSIONS.AUDIT_LOG_VIEW, description: 'View audit logs' }],
  },
];

module.exports = { PERMISSIONS, PERMISSION_GROUPS };
