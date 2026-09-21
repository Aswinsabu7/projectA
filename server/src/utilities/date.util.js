/**
 * Start and end instants of the calendar day `days` away from today
 * (negative values look backwards).
 */
function dayRange(days) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + days);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

module.exports = { dayRange };
