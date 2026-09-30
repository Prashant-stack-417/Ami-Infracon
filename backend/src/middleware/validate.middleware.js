/**
 * Validation Middleware
 * Provides request validation for various endpoints
 * Normalizes email to lowercase for case-insensitive matching
 * @module middleware/validate
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendValidationError = (res, errors) => {
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  return false;
};

/**
 * Validate registration request body
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, coordinates, phone } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2)
    errors.push("Name must be at least 2 characters long");

  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email address is required");
  } else {
    req.body.email = email.toLowerCase().trim();
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  } else {
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
  }

  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phone || typeof phone !== "string" || !phoneRegex.test(phone.trim())) {
    errors.push("Valid phone number is required (e.g. +911234567890)");
  }

  if (coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      errors.push("Coordinates must be an array of [longitude, latitude]");
    } else if (typeof coordinates[0] !== "number" || typeof coordinates[1] !== "number") {
      errors.push("Coordinates must contain valid numbers");
    }
  }

  if (sendValidationError(res, errors)) return;
  next();
};

/**
 * Validate admin registration request body
 */
export const validateAdminRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2)
    errors.push("Name must be at least 2 characters long");

  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email address is required");
  } else {
    req.body.email = email.toLowerCase().trim();
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  } else {
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
  }

  if (sendValidationError(res, errors)) return;
  next();
};

/**
 * Validate login request body
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email address is required");
  } else {
    req.body.email = email.toLowerCase().trim();
  }

  if (!password || password.length < 1) errors.push("Password is required");

  if (sendValidationError(res, errors)) return;
  next();
};

/**
 * Validate order creation request body
 */
export const validateOrder = (req, res, next) => {
  const { title, quantity, address } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || title.trim().length < 3)
    errors.push("Title must be at least 3 characters long");

  if (!quantity || typeof quantity !== "number" || quantity < 1)
    errors.push("Quantity must be a positive number");

  if (!address || typeof address !== "string" || address.trim().length < 5)
    errors.push("Address must be at least 5 characters long");

  if (sendValidationError(res, errors)) return;
  next();
};
