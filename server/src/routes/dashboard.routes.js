const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const dashboardController = require('../controllers/dashboard.controller');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/widgets', requirePermission(PERMISSIONS.DASHBOARD_VIEW), dashboardController.getWidgets);
router.get('/charts', requirePermission(PERMISSIONS.DASHBOARD_VIEW), dashboardController.getCharts);

module.exports = router;
