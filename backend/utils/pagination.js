/**
 * Pagination Utility for API Response Optimization
 * Reduces response payload sizes and improves performance
 */

/**
 * Parse pagination parameters from query string
 * @param {Object} query - Express req.query object
 * @returns {Object} Parsed pagination options
 */
export const parsePaginationParams = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20)); // Max 100, default 20
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
        hasPagination: true
    };
};

/**
 * Parse field selection parameters
 * @param {Object} query - Express req.query object
 * @param {Array} allowedFields - Array of allowed field names
 * @returns {String|null} MongoDB projection string or null for all fields
 */
export const parseFieldSelection = (query, allowedFields = null) => {
    const fields = query.fields;

    if (!fields) return null; // Return all fields

    const requestedFields = fields.split(',').map(f => f.trim());

    // If allowedFields specified, filter only allowed ones
    const validFields = allowedFields
        ? requestedFields.filter(field => allowedFields.includes(field))
        : requestedFields;

    return validFields.join(' '); // MongoDB projection string
};

/**
 * Apply query optimizations to Mongoose queries
 * @param {Object} query - Mongoose query object
 * @param {Object} options - Optimization options
 * @returns {Object} Optimized query
 */
export const optimizeQuery = (query, options = {}) => {
    const { useLean = true, selectFields = null, populateFields = null } = options;

    // Use lean() for read-only operations (faster, less memory)
    if (useLean) {
        query = query.lean();
    }

    // Select only needed fields
    if (selectFields) {
        query = query.select(selectFields);
    }

    // Limit population if specified
    if (populateFields) {
        populateFields.forEach(populate => {
            query = query.populate(populate);
        });
    }

    return query;
};

/**
 * Create paginated response
 * @param {Array} data - Query results
 * @param {Number} total - Total count of documents
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Formatted response
 */
export const createPaginatedResponse = (data, total, pagination) => {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null
        },
        meta: {
            timestamp: new Date().toISOString(),
            responseSize: JSON.stringify(data).length
        }
    };
};

/**
 * Middleware for automatic pagination
 * @param {Object} options - Configuration options
 */
export const withPagination = (options = {}) => {
    return async (req, res, next) => {
        try {
            // Parse pagination parameters
            const pagination = parsePaginationParams(req.query);
            req.pagination = pagination;

            // Parse field selection
            if (options.allowedFields) {
                const selectFields = parseFieldSelection(req.query, options.allowedFields);
                req.fieldSelection = selectFields;
            }

            // Store original json method
            const originalJson = res.json;

            // Override res.json to add pagination info
            res.json = function(data) {
                // If data has pagination info, format it
                if (data && typeof data === 'object' && data.data && data.total !== undefined) {
                    const paginatedResponse = createPaginatedResponse(
                        data.data,
                        data.total,
                        pagination
                    );
                    return originalJson.call(this, paginatedResponse);
                }

                // Otherwise return as-is
                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Helper to get optimized query options
 * @param {Object} req - Express request object
 * @param {Object} options - Default options
 * @returns {Object} Query options
 */
export const getQueryOptions = (req, options = {}) => {
    return {
        useLean: options.useLean !== false, // Default true
        selectFields: req.fieldSelection || options.defaultFields || null,
        populateFields: options.populateFields || null,
        pagination: req.pagination || null
    };
};