const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const roleRoutes = require('./role.routes');
const permissionRoutes = require('./permission.routes');
const subscriberRoutes = require('./subscriber.routes');
const messageHistoryRoutes = require('./messageHistory.routes');
const dashboardRoutes = require('./dashboard.routes');
const settingsRoutes = require('./settings.routes');
const auditLogRoutes = require('./auditLog.routes');

const router = express.Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'ProjectA API v1 is healthy' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/subscribers', subscriberRoutes);
router.use('/messages', messageHistoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/audit-logs', auditLogRoutes);

module.exports = router;
