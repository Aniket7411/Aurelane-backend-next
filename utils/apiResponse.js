/**
 * Standardized API Response Utility
 * 
 * This utility provides consistent response formatting across all API endpoints
 * to ensure frontend can handle responses uniformly.
 */

/**
 * Success Response
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 * @param {*} options.data - Response data
 * @param {string} options.message - Success message
 * @param {number} options.statusCode - HTTP status code (default: 200)
 * @param {Object} options.meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, { data = null, message = 'Success', statusCode = 200, meta = null }) => {
    const response = {
        success: true,
        message,
        ...(data !== null && { data }),
        ...(meta && { meta })
    };

    return res.status(statusCode).json(response);
};

/**
 * Error Response
 * @param {Object} res - Express response object
 * @param {Object} options - Error options
 * @param {string} options.message - Error message
 * @param {number} options.statusCode - HTTP status code (default: 500)
 * @param {*} options.error - Error details (for development)
 * @param {Array} options.errors - Validation errors array
 */
const sendError = (res, { message = 'An error occurred', statusCode = 500, error = null, errors = null }) => {
    const response = {
        success: false,
        message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && error && { error: error.message || error })
    };

    return res.status(statusCode).json(response);
};

/**
 * Validation Error Response
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array from express-validator
 */
const sendValidationError = (res, errors) => {
    return sendError(res, {
        message: 'Validation failed',
        statusCode: 400,
        errors: errors
    });
};

/**
 * Not Found Response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'Gem', 'Order')
 */
const sendNotFound = (res, resource = 'Resource') => {
    return sendError(res, {
        message: `${resource} not found`,
        statusCode: 404
    });
};

/**
 * Unauthorized Response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
    return sendError(res, {
        message,
        statusCode: 401
    });
};

/**
 * Forbidden Response
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
    return sendError(res, {
        message,
        statusCode: 403
    });
};

/**
 * Paginated Response
 * @param {Object} res - Express response object
 * @param {Object} options - Pagination options
 * @param {Array} options.items - Array of items
 * @param {number} options.page - Current page
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total items
 * @param {string} options.message - Success message
 */
const sendPaginated = (res, { items, page, limit, total, message = 'Data retrieved successfully' }) => {
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, {
        data: items,
        message,
        meta: {
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalItems: total,
                itemsPerPage: Number(limit),
                hasNext: Number(page) < totalPages,
                hasPrev: Number(page) > 1
            }
        }
    });
};

/**
 * Created Response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, {
        data,
        message,
        statusCode: 201
    });
};

/**
 * No Content Response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
    return res.status(204).send();
};

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendNotFound,
    sendUnauthorized,
    sendForbidden,
    sendPaginated,
    sendCreated,
    sendNoContent
};

