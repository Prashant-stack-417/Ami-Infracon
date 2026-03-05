/**
 * Validation Middleware
 * Provides request validation for various endpoints
 * Normalizes email to lowercase for case-insensitive matching
 * @module middleware/validate
 */

/**
 * Validate registration request body
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, coordinates } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Email validation + normalize
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email address is required");
  } else {
    // Normalize email in-place so controllers always receive lowercase
    req.body.email = email.toLowerCase().trim();
  }

  // Password validation — enforce strong passwords
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  } else {
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
  }

  // Coordinates validation (optional but if provided must be valid)
  if (coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      errors.push("Coordinates must be an array of [longitude, latitude]");
    } else if (
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      errors.push("Coordinates must contain valid numbers");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Validate login request body
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Email validation + normalize
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Valid email address is required");
  } else {
    // Normalize email in-place so controllers always receive lowercase
    req.body.email = email.toLowerCase().trim();
  }

  // Password validation
  if (!password || password.length < 1) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Validate order creation request body
 */
export const validateOrder = (req, res, next) => {
  const { title, quantity, address } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    errors.push("Title must be at least 3 characters long");
  }

  // Quantity validation
  if (!quantity || typeof quantity !== "number" || quantity < 1) {
    errors.push("Quantity must be a positive number");
  }

  // Address validation
  if (!address || typeof address !== "string" || address.trim().length < 5) {
    errors.push("Address must be at least 5 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};
