/**
 * Error Handling Utilities
 * Centralized error handling and logging
 */
import toast from "react-hot-toast";

/**
 * Error types
 */
export const ErrorTypes = {
  NETWORK: "NETWORK_ERROR",
  AUTHENTICATION: "AUTHENTICATION_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  SERVER: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Determine error type from error object
 * @param {Error} error - Error object
 * @returns {string} Error type
 */
export const getErrorType = (error) => {
  if (!error.response) {
    return ErrorTypes.NETWORK;
  }

  const status = error.response?.status;

  switch (status) {
    case 401:
      return ErrorTypes.AUTHENTICATION;
    case 403:
      return ErrorTypes.AUTHORIZATION;
    case 404:
      return ErrorTypes.NOT_FOUND;
    case 422:
      return ErrorTypes.VALIDATION;
    case 500:
    case 502:
    case 503:
      return ErrorTypes.SERVER;
    default:
      return ErrorTypes.UNKNOWN;
  }
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @param {string} fallbackMessage - Fallback message if none found
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error, fallbackMessage = "An error occurred") => {
  // API error response
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Network error
  if (error.request && !error.response) {
    return "Network error. Please check your connection.";
  }

  // Error with message property
  if (error.message) {
    return error.message;
  }

  // String error
  if (typeof error === "string") {
    return error;
  }

  return fallbackMessage;
};

/**
 * Handle API errors with toast notifications
 * @param {Error} error - Error object
 * @param {Object} options - Configuration options
 * @returns {void}
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    fallbackMessage = "An error occurred",
    onAuthError = null,
    onValidationError = null,
  } = options;

  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error, fallbackMessage);

  // Log error for debugging
  console.error("API Error:", {
    type: errorType,
    message: errorMessage,
    error,
  });

  // Handle authentication errors
  if (errorType === ErrorTypes.AUTHENTICATION && onAuthError) {
    onAuthError(error);
    return;
  }

  // Handle validation errors
  if (errorType === ErrorTypes.VALIDATION && onValidationError) {
    onValidationError(error);
    return;
  }

  // Show toast notification
  if (showToast) {
    switch (errorType) {
      case ErrorTypes.NETWORK:
        toast.error("Network error. Please check your connection.");
        break;
      case ErrorTypes.AUTHENTICATION:
        toast.error("Please login to continue.");
        break;
      case ErrorTypes.AUTHORIZATION:
        toast.error("You don't have permission to perform this action.");
        break;
      case ErrorTypes.NOT_FOUND:
        toast.error("Requested resource not found.");
        break;
      case ErrorTypes.VALIDATION:
        toast.error(errorMessage);
        break;
      case ErrorTypes.SERVER:
        toast.error("Server error. Please try again later.");
        break;
      default:
        toast.error(errorMessage);
    }
  }
};

/**
 * Handle success responses with toast notifications
 * @param {string} message - Success message
 * @param {Object} options - Configuration options
 * @returns {void}
 */
export const handleSuccess = (message, options = {}) => {
  const { showToast = true, duration = 3000 } = options;

  if (showToast) {
    toast.success(message, { duration });
  }
};

/**
 * Async error wrapper - wraps async functions with error handling
 * @param {Function} asyncFn - Async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Function} Wrapped function
 */
export const withErrorHandling = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      handleApiError(error, options);
      throw error;
    }
  };
};

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateInput = (input, options = {}) => {
  const {
    required = false,
    minLength = 0,
    maxLength = Infinity,
    pattern = null,
    sanitize = true,
  } = options;

  const errors = [];

  // Required check
  if (required && !input?.trim()) {
    errors.push("This field is required");
  }

  const trimmedInput = input?.trim() || "";

  // Length checks
  if (trimmedInput.length < minLength) {
    errors.push(`Minimum length is ${minLength} characters`);
  }

  if (trimmedInput.length > maxLength) {
    errors.push(`Maximum length is ${maxLength} characters`);
  }

  // Pattern check
  if (pattern && !pattern.test(trimmedInput)) {
    errors.push("Invalid format");
  }

  // Sanitize (basic XSS prevention)
  let sanitizedInput = trimmedInput;
  if (sanitize) {
    sanitizedInput = trimmedInput
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: sanitizedInput,
    originalValue: trimmedInput,
  };
};

/**
 * Retry a failed operation
 * @param {Function} operation - Operation to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Operation result
 */
export const retryOperation = async (operation, options = {}) => {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const waitTime = backoff ? delay * attempt : delay;
        console.log(`Retry attempt ${attempt}/${maxAttempts} after ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
};
