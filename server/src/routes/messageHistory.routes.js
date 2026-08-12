const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const pagination = require('../middleware/pagination');
const messageHistoryController = require('../controllers/messageHistory.controller');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get('/', requirePermission(PERMISSIONS.MESSAGE_VIEW), pagination(), messageHistoryController.getMessages);
router.post('/send', requirePermission(PERMISSIONS.MESSAGE_SEND), messageHistoryController.sendManualMessage);
router.post(
  '/:id/resend',
  requirePermission(PERMISSIONS.MESSAGE_SEND),
  messageHistoryController.resendMessage
);

module.exports = router;
