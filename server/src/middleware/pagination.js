/**
 * Normalizes pagination & sorting query params onto req.pagination.
 * Usage: GET /resource?page=1&limit=20&sortBy=createdAt&sortOrder=desc
 */
function pagination(defaultLimit = 20, maxLimit = 100) {
  return (req, _res, next) => {
    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (!Number.isFinite(page) || page < 1) page = 1;
    if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
    if (limit > maxLimit) limit = maxLimit;

    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit,
      sort: { [sortBy]: sortOrder },
    };

    next();
  };
}

module.exports = pagination;
