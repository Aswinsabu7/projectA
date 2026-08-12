const express = require('express');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const pagination = require('../middleware/pagination');
const { uploadExcel } = require('../middleware/upload');
const subscriberController = require('../controllers/subscriber.controller');
const subscriberValidator = require('../validators/subscriber.validator');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authenticate);

router.get(
  '/export',
  requirePermission(PERMISSIONS.SUBSCRIBER_EXPORT),
  subscriberController.exportSubscribers
);
router.get(
  '/import/template',
  requirePermission(PERMISSIONS.SUBSCRIBER_IMPORT),
  subscriberController.downloadTemplate
);
router.post(
  '/import/preview',
  requirePermission(PERMISSIONS.SUBSCRIBER_IMPORT),
  uploadExcel.single('file'),
  subscriberController.previewImport
);
router.post(
  '/import/confirm',
  requirePermission(PERMISSIONS.SUBSCRIBER_IMPORT),
  subscriberController.confirmImport
);

router.get('/', requirePermission(PERMISSIONS.SUBSCRIBER_VIEW), pagination(), subscriberController.getSubscribers);
router.get('/:id', requirePermission(PERMISSIONS.SUBSCRIBER_VIEW), subscriberController.getSubscriberById);
router.post(
  '/',
  requirePermission(PERMISSIONS.SUBSCRIBER_CREATE),
  validate(subscriberValidator.createSubscriber),
  subscriberController.createSubscriber
);
router.put(
  '/:id',
  requirePermission(PERMISSIONS.SUBSCRIBER_EDIT),
  validate(subscriberValidator.updateSubscriber),
  subscriberController.updateSubscriber
);
router.delete('/:id', requirePermission(PERMISSIONS.SUBSCRIBER_DELETE), subscriberController.deleteSubscriber);

module.exports = router;
