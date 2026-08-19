// Parses page/limit/sort query params into a consistent shape used by every
// repository's paginate() method.
function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 100);
  const skip = (page - 1) * limit;

  let sort = { createdAt: -1 };
  if (query.sort) {
    const dir = query.sort.startsWith('-') ? -1 : 1;
    const field = query.sort.replace(/^-/, '');
    sort = { [field]: dir };
  }

  return { page, limit, skip, sort };
}

function buildMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

module.exports = { parsePagination, buildMeta };
