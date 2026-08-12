/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../config/logger');
const { connectDB, disconnectDB } = require('../config/db');
const { User, Role, Permission, Settings } = require('../models');
const { PERMISSION_GROUPS, PERMISSIONS } = require('../constants/permissions');
const { ROLES, USER_STATUS } = require('../constants/roles');
const { hashPassword } = require('../utilities/password.util');

async function seedPermissions() {
  const ops = [];
  for (const { group, permissions } of PERMISSION_GROUPS) {
    for (const p of permissions) {
      ops.push({
        updateOne: {
          filter: { key: p.key },
          update: { $set: { key: p.key, name: p.key, group, description: p.description, isActive: true } },
          upsert: true,
        },
      });
    }
  }
  await Permission.bulkWrite(ops);
  logger.info(`Seeded ${ops.length} permissions`);
  return Permission.find({});
}

async function seedRoles(allPermissions) {
  const allPermissionIds = allPermissions.map((p) => p._id);

  const adminPermissionKeys = [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SUBSCRIBER_VIEW,
    PERMISSIONS.SUBSCRIBER_CREATE,
    PERMISSIONS.SUBSCRIBER_EDIT,
    PERMISSIONS.SUBSCRIBER_DELETE,
    PERMISSIONS.SUBSCRIBER_IMPORT,
    PERMISSIONS.SUBSCRIBER_EXPORT,
    PERMISSIONS.MESSAGE_VIEW,
    PERMISSIONS.MESSAGE_SEND,
    PERMISSIONS.SETTINGS_VIEW,
  ];
  const adminPermissionIds = allPermissions
    .filter((p) => adminPermissionKeys.includes(p.key))
    .map((p) => p._id);

  const userPermissionKeys = [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.SUBSCRIBER_VIEW];
  const userPermissionIds = allPermissions.filter((p) => userPermissionKeys.includes(p.key)).map((p) => p._id);

  const rolesToSeed = [
    {
      name: ROLES.SUPER_ADMIN,
      description: 'Full system access with all permissions',
      permissions: allPermissionIds,
      isSystemRole: true,
      isActive: true,
    },
    {
      name: ROLES.ADMIN,
      description: 'Manages subscribers, imports, reminders and partial settings',
      permissions: adminPermissionIds,
      isSystemRole: true,
      isActive: true,
    },
    {
      name: ROLES.USER,
      description: 'Basic permission-based access (view only by default)',
      permissions: userPermissionIds,
      isSystemRole: true,
      isActive: true,
    },
  ];

  const roleDocs = {};
  for (const roleData of rolesToSeed) {
    const role = await Role.findOneAndUpdate(
      { name: roleData.name },
      { $set: roleData },
      { upsert: true, new: true }
    );
    roleDocs[roleData.name] = role;
  }

  logger.info(`Seeded roles: ${Object.keys(roleDocs).join(', ')}`);
  return roleDocs;
}

async function seedSuperAdmin(superAdminRole) {
  const existing = await User.findOne({ username: env.seed.superAdminUsername.toLowerCase() });
  if (existing) {
    logger.info('Super Admin user already exists - skipping creation');
    return existing;
  }

  const hashed = await hashPassword(env.seed.superAdminPassword);
  const user = await User.create({
    firstName: env.seed.superAdminFirstName,
    lastName: env.seed.superAdminLastName,
    email: env.seed.superAdminEmail.toLowerCase(),
    mobile: '0000000000',
    username: env.seed.superAdminUsername.toLowerCase(),
    password: hashed,
    role: superAdminRole._id,
    status: USER_STATUS.ACTIVE,
  });

  logger.info(`Created Super Admin user: ${user.username} / (password from .env SEED_SUPERADMIN_PASSWORD)`);
  return user;
}

async function seedSettings() {
  const existing = await Settings.findOne({ key: 'app_settings' });
  if (existing) {
    logger.info('Settings document already exists - skipping creation');
    return existing;
  }
  const settings = await Settings.create({ key: 'app_settings' });
  logger.info('Created default application settings');
  return settings;
}

async function run() {
  await connectDB();

  try {
    const permissions = await seedPermissions();
    const roles = await seedRoles(permissions);
    await seedSuperAdmin(roles[ROLES.SUPER_ADMIN]);
    await seedSettings();

    logger.info('Seeding completed successfully.');
  } catch (err) {
    logger.error(`Seeding failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    await mongoose.connection.close().catch(() => {});
  }
}

run();
