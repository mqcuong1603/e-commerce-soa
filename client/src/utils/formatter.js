/**
 * Utility functions for formatting different data types
 */

// USD to VND conversion rate (example: 1 USD = 23,500 VND)
const USD_TO_VND_RATE = 23500;

/**
 * Convert price from USD to VND or other specified currency
 * @param {number} priceInUsd - Price in USD
 * @param {string} targetCurrency - Target currency code
 * @returns {number} Converted price
 */
export const convertPrice = (priceInUsd, targetCurrency = "VND") => {
  if (priceInUsd === undefined || priceInUsd === null || isNaN(priceInUsd)) {
    return 0;
  }

  // Add more currencies here as needed
  switch (targetCurrency) {
    case "VND":
      return priceInUsd * USD_TO_VND_RATE;
    case "USD":
      return priceInUsd;
    default:
      return priceInUsd;
  }
};

/**
 * Format a price with comma separators and currency symbol
 * @param {number} price - Price to format (in USD from database)
 * @param {string} currency - Currency code (default: 'VND')
 * @param {string} locale - Locale for formatting (default: 'vi-VN')
 * @param {boolean} convert - Whether to convert from USD (default: true)
 * @returns {string} Formatted price
 */
export const formatPrice = (
  price,
  currency = "VND",
  locale = "vi-VN",
  convert = true
) => {
  // Handle undefined, null, or NaN
  if (price === undefined || price === null || isNaN(price)) {
    return "₫0";
  }

  // Different currency symbols
  const currencySymbols = {
    VND: "₫",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  // Convert price if needed
  const finalPrice = convert ? convertPrice(price, currency) : price;

  // Format based on currency
  if (currency === "VND") {
    // For VND, we don't use decimal points and use the symbol after the number
    return `${currencySymbols[currency]}${new Intl.NumberFormat(locale).format(
      Math.round(finalPrice)
    )}`;
  } else {
    // For other currencies, use the standard formatter with symbol before the number
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(finalPrice);
  }
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Date formatting options
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}, locale = "en-US") => {
  if (!date) return "";

  // Convert string to Date object if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Default formatting options
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

/**
 * Format a date with time
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (date, locale = "en-US") => {
  return formatDate(
    date,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    locale
  );
};

/**
 * Format a date as a relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, locale = "en-US") => {
  if (!date) return "";

  // Convert string to Date object if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - dateObj;

  // Convert to seconds
  const diffSec = Math.round(diffMs / 1000);

  // Less than a minute
  if (diffSec < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffSec < 3600) {
    const minutes = Math.floor(diffSec / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Less than a day
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Less than a week
  if (diffSec < 604800) {
    const days = Math.floor(diffSec / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Otherwise, use standard date format
  return formatDate(date, {}, locale);
};

/**
 * Format a file size from bytes to human-readable form
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
};

/**
 * Format a phone number for display
 * @param {string} phone - Phone number to format
 * @param {string} countryCode - Country code (default: 'VN')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, countryCode = "VN") => {
  if (!phone) return "";

  // Strip non-numeric characters
  const numericOnly = phone.replace(/\D/g, "");

  // Format based on country code
  switch (countryCode) {
    case "VN": // Vietnam
      if (numericOnly.length === 10) {
        return `${numericOnly.slice(0, 4)} ${numericOnly.slice(
          4,
          7
        )} ${numericOnly.slice(7)}`;
      } else if (numericOnly.length === 11) {
        return `${numericOnly.slice(0, 4)} ${numericOnly.slice(
          4,
          7
        )} ${numericOnly.slice(7)}`;
      }
      return phone;

    case "US": // United States
      if (numericOnly.length === 10) {
        return `(${numericOnly.slice(0, 3)}) ${numericOnly.slice(
          3,
          6
        )}-${numericOnly.slice(6)}`;
      }
      return phone;

    default:
      return phone;
  }
};

/**
 * Format a name for display (e.g., "John D.")
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {boolean} abbreviateLastName - Whether to abbreviate the last name (default: false)
 * @returns {string} Formatted name
 */
export const formatName = (firstName, lastName, abbreviateLastName = false) => {
  if (!firstName && !lastName) return "";
  if (!firstName) return lastName;
  if (!lastName) return firstName;

  if (abbreviateLastName) {
    return `${firstName} ${lastName.charAt(0)}.`;
  }
  return `${firstName} ${lastName}`;
};

/**
 * Format a full name from components or split a full name into components
 * @param {Object|string} input - Either a full name string or an object with name components
 * @returns {string|Object} Formatted name or name components
 */
export const formatFullName = (input) => {
  // If input is a string, split it into components
  if (typeof input === "string") {
    const nameParts = input.trim().split(" ");

    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: "" };
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    return { firstName, lastName };
  }

  // If input is an object, format to string
  if (input && typeof input === "object") {
    const { firstName, lastName, middleName } = input;

    if (middleName) {
      return `${firstName || ""} ${middleName || ""} ${lastName || ""}`.trim();
    }

    return `${firstName || ""} ${lastName || ""}`.trim();
  }

  return "";
};

/**
 * Format an address into a readable string
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return "";

  const { addressLine1, addressLine2, city, state, postalCode, country } =
    address;

  let formattedAddress = "";

  if (addressLine1) {
    formattedAddress += addressLine1;
  }

  if (addressLine2) {
    formattedAddress += formattedAddress ? `, ${addressLine2}` : addressLine2;
  }

  if (city) {
    formattedAddress += formattedAddress ? `, ${city}` : city;
  }

  if (state) {
    formattedAddress += city ? ` ${state}` : `, ${state}`;
  }

  if (postalCode) {
    formattedAddress += state ? ` ${postalCode}` : `, ${postalCode}`;
  }

  if (country) {
    formattedAddress += formattedAddress ? `, ${country}` : country;
  }

  return formattedAddress;
};

/**
 * Format an email address to partially hide it for privacy
 * @param {string} email - Email address to format
 * @returns {string} Partially hidden email
 */
export const formatEmail = (email) => {
  if (!email) return "";

  const [username, domain] = email.split("@");

  if (!domain) return email;

  // Show first 3 characters of username, rest as asterisks
  const hiddenUsername =
    username.length <= 4
      ? username
      : `${username.substring(0, 3)}${"*".repeat(
          username.length - 4
        )}${username.slice(-1)}`;

  return `${hiddenUsername}@${domain}`;
};
