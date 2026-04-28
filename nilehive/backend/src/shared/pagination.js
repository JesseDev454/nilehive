const ApiError = require("./ApiError");

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value, field, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, `${field} must be a positive integer`, "VALIDATION_ERROR", {
      field
    });
  }

  return parsed;
}

function parsePaginationQuery(query = {}, options = {}) {
  const {
    defaultPage = DEFAULT_PAGE,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    maxPageSize = MAX_PAGE_SIZE,
    defaultSort = "created_at",
    defaultOrder = "desc",
    allowedSorts = []
  } = options;

  const page = parsePositiveInteger(query.page, "page", defaultPage);
  const pageSize = parsePositiveInteger(query.page_size, "page_size", defaultPageSize);

  if (pageSize > maxPageSize) {
    throw new ApiError(400, `page_size cannot be greater than ${maxPageSize}`, "VALIDATION_ERROR", {
      field: "page_size"
    });
  }

  const order = query.order ? String(query.order).toLowerCase() : defaultOrder;

  if (!["asc", "desc"].includes(order)) {
    throw new ApiError(400, "order must be either asc or desc", "VALIDATION_ERROR", {
      field: "order"
    });
  }

  const sort = query.sort ? String(query.sort) : defaultSort;

  if (allowedSorts.length && !allowedSorts.includes(sort)) {
    throw new ApiError(400, `sort must be one of: ${allowedSorts.join(", ")}`, "VALIDATION_ERROR", {
      field: "sort"
    });
  }

  return {
    page,
    pageSize,
    page_size: pageSize,
    sort,
    order,
    from: (page - 1) * pageSize,
    to: (page - 1) * pageSize + pageSize - 1
  };
}

function buildPaginatedResult({ items, page, pageSize, total }) {
  const safeItems = items ?? [];
  const safeTotal = Number.isFinite(total) ? total : safeItems.length;

  return {
    items: safeItems,
    page,
    page_size: pageSize,
    total: safeTotal,
    has_next: page * pageSize < safeTotal
  };
}

function mapPaginatedResult(result, mapper) {
  return {
    ...result,
    items: result.items.map(mapper)
  };
}

function paginateArray(items, pagination) {
  const safeItems = items ?? [];
  const pageItems = safeItems.slice(pagination.from, pagination.to + 1);

  return buildPaginatedResult({
    items: pageItems,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: safeItems.length
  });
}

function ensurePaginatedResult(result, pagination) {
  if (!pagination) {
    return result;
  }

  if (Array.isArray(result)) {
    return paginateArray(result, pagination);
  }

  return result;
}

module.exports = {
  buildPaginatedResult,
  ensurePaginatedResult,
  mapPaginatedResult,
  paginateArray,
  parsePaginationQuery
};
