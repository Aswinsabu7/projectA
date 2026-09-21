const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const ApiError = require('../utilities/apiError');
const { paginationMeta } = require('../utilities/query.util');
const subscriberService = require('../services/subscriber.service');
const excelService = require('../services/excel.service');
const { recordAudit } = require('../middleware/auditLogger');
const { AUDIT_ACTIONS } = require('../constants/roles');

const getSubscribers = asyncHandler(async (req, res) => {
  const { search, platform, status } = req.query;
  const result = await subscriberService.listSubscribers(req.pagination, { search, platform, status });
  return ApiResponse.ok(res, result.items, 'Subscribers fetched successfully', paginationMeta(result));
});

const getSubscriberById = asyncHandler(async (req, res) => {
  const subscriber = await subscriberService.getSubscriberById(req.params.id);
  return ApiResponse.ok(res, subscriber);
});

const createSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await subscriberService.createSubscriber(req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.SUBSCRIBER_CHANGE,
    module: 'Subscriber',
    entityId: subscriber._id,
    description: `Created subscriber ${subscriber.fullName} (${subscriber.subscriberId})`,
    req,
    after: subscriber,
  });

  return ApiResponse.created(res, subscriber);
});

const updateSubscriber = asyncHandler(async (req, res) => {
  const before = await subscriberService.getSubscriberById(req.params.id);
  const subscriber = await subscriberService.updateSubscriber(req.params.id, req.body, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.SUBSCRIBER_CHANGE,
    module: 'Subscriber',
    entityId: subscriber._id,
    description: `Updated subscriber ${subscriber.fullName} (${subscriber.subscriberId})`,
    req,
    before,
    after: subscriber,
  });

  return ApiResponse.ok(res, subscriber, 'Subscriber updated successfully');
});

const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await subscriberService.deleteSubscriber(req.params.id);

  await recordAudit({
    action: AUDIT_ACTIONS.DELETE,
    module: 'Subscriber',
    entityId: subscriber._id,
    description: `Deleted subscriber ${subscriber.fullName} (${subscriber.subscriberId})`,
    req,
    before: subscriber,
  });

  return ApiResponse.ok(res, null, 'Subscriber deleted successfully');
});

const exportSubscribers = asyncHandler(async (req, res) => {
  const { search, platform, status } = req.query;
  const result = await subscriberService.listSubscribers(
    { page: 1, limit: 100000, skip: 0, sort: { createdAt: -1 } },
    { search, platform, status }
  );

  const rows = result.items.map((s) => ({
    'Subscriber ID': s.subscriberId,
    Name: s.fullName,
    'Mobile Number': s.mobileNumber,
    Email: s.email,
    Platform: s.platform,
    'Start Date': s.subscriptionStartDate?.toISOString().slice(0, 10),
    'End Date': s.subscriptionEndDate?.toISOString().slice(0, 10),
    'Amount Paid': s.amountPaid,
    Status: s.status,
    Remarks: s.remarks,
  }));

  const buffer = await excelService.generateExportBuffer(rows);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="subscribers-export.xlsx"');
  return res.send(buffer);
});

const downloadTemplate = asyncHandler(async (_req, res) => {
  const buffer = await excelService.generateTemplateBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="subscriber-import-template.xlsx"');
  return res.send(buffer);
});

const previewImport = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Excel file is required');

  const rows = await excelService.parseWorkbookBuffer(req.file.buffer);
  if (!rows.length) throw ApiError.badRequest('The uploaded file has no data rows');

  const { validRows, invalidRows, totalRows } = await excelService.validateRows(rows);
  return ApiResponse.ok(res, { validRows, invalidRows, totalRows }, 'Import file validated');
});

const confirmImport = asyncHandler(async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows) || !rows.length) throw ApiError.badRequest('No valid rows to import');

  const inserted = await excelService.bulkImport(rows, req.user.id);

  await recordAudit({
    action: AUDIT_ACTIONS.IMPORT,
    module: 'Subscriber',
    description: `Bulk imported ${inserted.length} subscribers from Excel`,
    req,
    after: { count: inserted.length },
  });

  return ApiResponse.created(res, { insertedCount: inserted.length }, 'Subscribers imported successfully');
});

module.exports = {
  getSubscribers,
  getSubscriberById,
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  exportSubscribers,
  downloadTemplate,
  previewImport,
  confirmImport,
};
