/**
 * Utility functions for data validation
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} Whether the value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
};

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (isEmpty(email)) return false;

  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate a phone number
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Country code (default: 'VN')
 * @returns {boolean} Whether the phone number is valid
 */
export const isValidPhone = (phone, countryCode = "VN") => {
  if (isEmpty(phone)) return false;

  // Strip non-numeric characters for comparison
  const numericPhone = phone.replace(/\D/g, "");

  switch (countryCode) {
    case "VN": // Vietnam
      // Vietnamese phone numbers: 10 digits or 11 digits (starting with 0)
      return /^0\d{9,10}$/.test(numericPhone);

    case "US": // United States
      // US phone numbers: 10 digits
      return /^\d{10}$/.test(numericPhone);

    default:
      // General validation: 7-15 digits
      return /^\d{7,15}$/.test(numericPhone);
  }
};

/**
 * Validate a password (check if it meets complexity requirements)
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false,
  } = options;

  if (isEmpty(password)) {
    return {
      isValid: false,
      message: "Password is required",
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (requireNumbers && !/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character",
    };
  }

  return {
    isValid: true,
    message: "Password is valid",
  };
};

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @param {boolean} requireProtocol - Whether to require a protocol (http/https)
 * @returns {boolean} Whether the URL is valid
 */
export const isValidUrl = (url, requireProtocol = true) => {
  if (isEmpty(url)) return false;

  try {
    const parsedUrl = new URL(url);

    if (requireProtocol && !parsedUrl.protocol.match(/^https?:/)) {
      return false;
    }

    return true;
  } catch (error) {
    if (!requireProtocol) {
      // Try adding a protocol and validating again
      try {
        const parsedUrl = new URL(`http://${url}`);
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }
};

/**
 * Validate a credit card number using Luhn algorithm
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} Whether the credit card number is valid
 */
export const isValidCreditCard = (cardNumber) => {
  if (isEmpty(cardNumber)) return false;

  // Remove spaces and dashes
  const digitsOnly = cardNumber.replace(/[\s-]/g, "");

  // Check if it contains only digits and has a valid length
  if (!/^\d{13,19}$/.test(digitsOnly)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;

  // Loop through digits from right to left
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Get credit card type based on number
 * @param {string} cardNumber - Credit card number
 * @returns {string|null} Card type or null if not recognized
 */
export const getCreditCardType = (cardNumber) => {
  if (isEmpty(cardNumber)) return null;

  // Remove spaces and dashes
  const digitsOnly = cardNumber.replace(/[\s-]/g, "");

  // Regex patterns for card types
  const patterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
    dinersclub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
  };

  for (const [type, regex] of Object.entries(patterns)) {
    if (regex.test(digitsOnly)) {
      return type;
    }
  }

  return null;
};

/**
 * Validate a postal/zip code
 * @param {string} postalCode - Postal code to validate
 * @param {string} countryCode - Country code (default: 'VN')
 * @returns {boolean} Whether the postal code is valid
 */
export const isValidPostalCode = (postalCode, countryCode = "VN") => {
  if (isEmpty(postalCode)) return false;

  // Country-specific validation
  switch (countryCode) {
    case "VN": // Vietnam - 6 digits
      return /^\d{6}$/.test(postalCode);

    case "US": // United States - 5 digits or 5+4
      return /^\d{5}(?:-\d{4})?$/.test(postalCode);

    case "CA": // Canada - Letter-Digit-Letter Digit-Letter-Digit
      return /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(postalCode);

    case "UK": // United Kingdom - Various formats
      return /^[A-Z]{1,2}\d[A-Za-z\d]? \d[A-Z]{2}$/.test(postalCode);

    default:
      // Generic check: at least 3 characters, alphanumeric
      return /^[A-Za-z0-9]{3,}$/.test(postalCode);
  }
};

/**
 * Validate a date string
 * @param {string} dateStr - Date string to validate
 * @param {string} format - Format to validate (default: any valid date)
 * @returns {boolean} Whether the date is valid
 */
export const isValidDate = (dateStr, format = "any") => {
  if (isEmpty(dateStr)) return false;

  // For 'any' format, just check if it's a valid date
  if (format === "any") {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  // For specific formats, use regex validation
  const formats = {
    "YYYY-MM-DD": /^\d{4}-\d{2}-\d{2}$/,
    "MM/DD/YYYY": /^\d{2}\/\d{2}\/\d{4}$/,
    "DD/MM/YYYY": /^\d{2}\/\d{2}\/\d{4}$/,
  };

  // Check if format is supported
  if (!formats[format]) {
    console.warn(`Unsupported date format: ${format}`);
    return false;
  }

  // Check if the date string matches the format
  if (!formats[format].test(dateStr)) {
    return false;
  }

  // Parse the date based on the format
  let year, month, day;

  switch (format) {
    case "YYYY-MM-DD":
      [year, month, day] = dateStr.split("-").map(Number);
      break;
    case "MM/DD/YYYY":
      [month, day, year] = dateStr.split("/").map(Number);
      break;
    case "DD/MM/YYYY":
      [day, month, year] = dateStr.split("/").map(Number);
      break;
  }

  // JavaScript months are 0-indexed
  month -= 1;

  // Create a date object and check if it's valid
  const date = new Date(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

/**
 * Validate that a value is a number
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @returns {boolean} Whether the value is a valid number
 */
export const isValidNumber = (value, options = {}) => {
  const {
    allowNegative = true,
    allowZero = true,
    allowDecimals = true,
    min = null,
    max = null,
  } = options;

  // Convert string to number if necessary
  const num = typeof value === "string" ? parseFloat(value) : value;

  // Check if it's a valid number
  if (typeof num !== "number" || isNaN(num)) {
    return false;
  }

  // Check if it's an integer if decimals are not allowed
  if (!allowDecimals && !Number.isInteger(num)) {
    return false;
  }

  // Check if negative numbers are allowed
  if (!allowNegative && num < 0) {
    return false;
  }

  // Check if zero is allowed
  if (!allowZero && num === 0) {
    return false;
  }

  // Check min/max constraints
  if (min !== null && num < min) {
    return false;
  }

  if (max !== null && num > max) {
    return false;
  }

  return true;
};

/**
 * Validate that a value is within a range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} Whether the value is within the range
 */
export const isInRange = (value, min, max) => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return false;
  }

  return num >= min && num <= max;
};

/**
 * Validate a name (check for minimum length and valid characters)
 * @param {string} name - Name to validate
 * @param {Object} options - Validation options
 * @returns {boolean} Whether the name is valid
 */
export const isValidName = (name, options = {}) => {
  const {
    minLength = 2,
    maxLength = 50,
    allowNumbers = false,
    allowSpecialChars = false,
  } = options;

  if (isEmpty(name)) return false;

  if (name.length < minLength || name.length > maxLength) {
    return false;
  }

  let regex;

  if (allowNumbers && allowSpecialChars) {
    // Allow letters, numbers, spaces, hyphens, apostrophes, and periods
    regex = /^[A-Za-z0-9 \-'.]+$/;
  } else if (allowNumbers) {
    // Allow letters, numbers, spaces, hyphens, and apostrophes
    regex = /^[A-Za-z0-9 \-']+$/;
  } else if (allowSpecialChars) {
    // Allow letters, spaces, hyphens, apostrophes, and periods
    regex = /^[A-Za-z \-'.]+$/;
  } else {
    // Allow only letters, spaces, hyphens, and apostrophes
    regex = /^[A-Za-z \-']+$/;
  }

  return regex.test(name);
};

/**
 * Validate a username (check for valid length and characters)
 * @param {string} username - Username to validate
 * @param {Object} options - Validation options
 * @returns {boolean} Whether the username is valid
 */
export const isValidUsername = (username, options = {}) => {
  const {
    minLength = 3,
    maxLength = 20,
    allowDots = true,
    allowUnderscores = true,
    allowHyphens = true,
  } = options;

  if (isEmpty(username)) return false;

  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  // Build regex based on options
  let pattern = "^[a-zA-Z0-9";
  if (allowDots) pattern += "\\.";
  if (allowUnderscores) pattern += "_";
  if (allowHyphens) pattern += "\\-";
  pattern += "]+$";

  const regex = new RegExp(pattern);

  return regex.test(username);
};

/**
 * Validate a form object with multiple fields
 * @param {Object} values - Form values to validate
 * @param {Object} validations - Validation rules for each field
 * @returns {Object} Validation errors (empty if all valid)
 */
export const validateForm = (values, validations) => {
  const errors = {};

  Object.entries(validations).forEach(([field, rules]) => {
    const value = values[field];

    // Required check
    if (rules.required && isEmpty(value)) {
      errors[field] = rules.requiredMessage || "This field is required";
      return;
    }

    // Skip other validations if the field is empty and not required
    if (isEmpty(value) && !rules.required) {
      return;
    }

    // Email validation
    if (rules.isEmail && !isValidEmail(value)) {
      errors[field] =
        rules.emailMessage || "Please enter a valid email address";
    }

    // Phone validation
    if (rules.isPhone && !isValidPhone(value, rules.countryCode)) {
      errors[field] = rules.phoneMessage || "Please enter a valid phone number";
    }

    // Minimum length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] =
        rules.minLengthMessage ||
        `Must be at least ${rules.minLength} characters`;
    }

    // Maximum length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] =
        rules.maxLengthMessage ||
        `Must be no more than ${rules.maxLength} characters`;
    }

    // Number validation
    if (rules.isNumber && !isValidNumber(value, rules.numberOptions)) {
      errors[field] = rules.numberMessage || "Please enter a valid number";
    }

    // Match validation (e.g., password confirmation)
    if (rules.match && value !== values[rules.match]) {
      errors[field] =
        rules.matchMessage || `Must match ${rules.matchLabel || rules.match}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || "Invalid format";
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === "function") {
      const customError = rules.validate(value, values);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
};

export default {
  isEmpty,
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidUrl,
  isValidCreditCard,
  getCreditCardType,
  isValidPostalCode,
  isValidDate,
  isValidNumber,
  isInRange,
  isValidName,
  isValidUsername,
  validateForm,
};
