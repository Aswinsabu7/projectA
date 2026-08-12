const asyncHandler = require('../utilities/asyncHandler');
const ApiResponse = require('../utilities/apiResponse');
const dashboardService = require('../services/dashboard.service');

const getWidgets = asyncHandler(async (_req, res) => {
  const widgets = await dashboardService.getWidgets();
  return ApiResponse.ok(res, widgets);
});

const getCharts = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months, 10) || 6;
  const [monthlyGrowth, subscribersByPlatform, revenueTrend] = await Promise.all([
    dashboardService.getMonthlyGrowth(months),
    dashboardService.getSubscribersByPlatform(),
    dashboardService.getRevenueTrend(months),
  ]);

  return ApiResponse.ok(res, { monthlyGrowth, subscribersByPlatform, revenueTrend });
});

module.exports = { getWidgets, getCharts };
