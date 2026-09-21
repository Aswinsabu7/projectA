const REGEX_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;

/**
 * Builds a case-insensitive "contains" matcher from user input.
 * Metacharacters are escaped so a search term is always matched literally
 * and can't be used to inject an expensive (ReDoS) pattern.
 */
function searchRegex(term) {
  return new RegExp(String(term).trim().replace(REGEX_METACHARACTERS, '\\$&'), 'i');
}

function paginationMeta({ total, page, limit }) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

module.exports = { searchRegex, paginationMeta };
