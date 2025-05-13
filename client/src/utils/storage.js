/**
 * Utility functions for browser storage operations (localStorage, sessionStorage)
 */

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  USER: "user",
  THEME: "theme",
  CART_ID: "cartId",
  LANGUAGE: "language",
  RECENT_SEARCHES: "recentSearches",
  RECENTLY_VIEWED: "recentlyViewed",
  COMPARE_LIST: "compareList",
  WISHLIST: "wishlist",
};

/**
 * Check if localStorage is available
 * @returns {boolean} Whether localStorage is available
 */
export const isLocalStorageAvailable = () => {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if sessionStorage is available
 * @returns {boolean} Whether sessionStorage is available
 */
export const isSessionStorageAvailable = () => {
  try {
    const testKey = "__storage_test__";
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * In-memory fallback storage when browser storage is not available
 */
const memoryStorage = {
  data: new Map(),
  getItem(key) {
    return this.data.get(key) || null;
  },
  setItem(key, value) {
    this.data.set(key, value);
  },
  removeItem(key) {
    this.data.delete(key);
  },
  clear() {
    this.data.clear();
  },
};

/**
 * Get storage based on type with fallback
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {Storage} Storage object
 */
const getStorage = (type = "local") => {
  if (type === "local" && isLocalStorageAvailable()) {
    return localStorage;
  }

  if (type === "session" && isSessionStorageAvailable()) {
    return sessionStorage;
  }

  console.warn(
    `${type}Storage is not available. Using memory storage instead.`
  );
  return memoryStorage;
};

/**
 * Get an item from storage
 * @param {string} key - Storage key
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {*} Stored value (parsed from JSON if possible)
 */
export const getItem = (key, type = "local") => {
  try {
    const storage = getStorage(type);
    const value = storage.getItem(key);

    if (value === null) return null;

    try {
      // Attempt to parse as JSON
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, return the raw value
      return value;
    }
  } catch (error) {
    console.error(`Error getting item ${key} from ${type}Storage:`, error);
    return null;
  }
};

/**
 * Set an item in storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be converted to JSON if not a string)
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {boolean} Whether the operation was successful
 */
export const setItem = (key, value, type = "local") => {
  try {
    const storage = getStorage(type);
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);
    storage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in ${type}Storage:`, error);
    return false;
  }
};

/**
 * Remove an item from storage
 * @param {string} key - Storage key
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {boolean} Whether the operation was successful
 */
export const removeItem = (key, type = "local") => {
  try {
    const storage = getStorage(type);
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from ${type}Storage:`, error);
    return false;
  }
};

/**
 * Clear all items from storage
 * @param {string} type - Storage type ('local' or 'session')
 * @returns {boolean} Whether the operation was successful
 */
export const clearStorage = (type = "local") => {
  try {
    const storage = getStorage(type);
    storage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing ${type}Storage:`, error);
    return false;
  }
};

/**
 * Get the current authentication token
 * @returns {string|null} Auth token or null if not found
 */
export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Save authentication token
 * @param {string} token - Auth token to save
 * @returns {boolean} Whether the operation was successful
 */
export const saveAuthToken = (token) => {
  return setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Remove authentication token (logout)
 * @returns {boolean} Whether the operation was successful
 */
export const removeAuthToken = () => {
  return removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get stored user data
 * @returns {Object|null} User data or null if not found
 */
export const getUser = () => {
  return getItem(STORAGE_KEYS.USER);
};

/**
 * Save user data
 * @param {Object} userData - User data to save
 * @returns {boolean} Whether the operation was successful
 */
export const saveUser = (userData) => {
  return setItem(STORAGE_KEYS.USER, userData);
};

/**
 * Remove user data
 * @returns {boolean} Whether the operation was successful
 */
export const removeUser = () => {
  return removeItem(STORAGE_KEYS.USER);
};

/**
 * Get the current theme
 * @returns {string} Theme name ('light', 'dark', or 'system')
 */
export const getTheme = () => {
  return getItem(STORAGE_KEYS.THEME) || "system";
};

/**
 * Save theme setting
 * @param {string} theme - Theme to save
 * @returns {boolean} Whether the operation was successful
 */
export const saveTheme = (theme) => {
  return setItem(STORAGE_KEYS.THEME, theme);
};

/**
 * Get list of recently viewed products
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} List of recently viewed product IDs
 */
export const getRecentlyViewed = (limit = 10) => {
  const items = getItem(STORAGE_KEYS.RECENTLY_VIEWED) || [];
  return items.slice(0, limit);
};

/**
 * Add a product to recently viewed
 * @param {string} productId - Product ID to add
 * @param {number} limit - Maximum number of items to keep
 * @returns {boolean} Whether the operation was successful
 */
export const addToRecentlyViewed = (productId, limit = 10) => {
  const items = getItem(STORAGE_KEYS.RECENTLY_VIEWED) || [];

  // Remove the item if it already exists
  const filteredItems = items.filter((id) => id !== productId);

  // Add the new item at the beginning
  const newItems = [productId, ...filteredItems].slice(0, limit);

  return setItem(STORAGE_KEYS.RECENTLY_VIEWED, newItems);
};

/**
 * Get list of recent searches
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} List of recent search terms
 */
export const getRecentSearches = (limit = 5) => {
  const items = getItem(STORAGE_KEYS.RECENT_SEARCHES) || [];
  return items.slice(0, limit);
};

/**
 * Add a search term to recent searches
 * @param {string} term - Search term to add
 * @param {number} limit - Maximum number of items to keep
 * @returns {boolean} Whether the operation was successful
 */
export const addToRecentSearches = (term, limit = 5) => {
  if (!term || term.trim() === "") return false;

  const items = getItem(STORAGE_KEYS.RECENT_SEARCHES) || [];

  // Normalize the term
  const normalizedTerm = term.trim().toLowerCase();

  // Remove the term if it already exists
  const filteredItems = items.filter(
    (item) => item.toLowerCase() !== normalizedTerm
  );

  // Add the new term at the beginning
  const newItems = [term.trim(), ...filteredItems].slice(0, limit);

  return setItem(STORAGE_KEYS.RECENT_SEARCHES, newItems);
};

/**
 * Clear recent searches
 * @returns {boolean} Whether the operation was successful
 */
export const clearRecentSearches = () => {
  return setItem(STORAGE_KEYS.RECENT_SEARCHES, []);
};

/**
 * Get wishlist items
 * @returns {Array} List of wishlist item IDs
 */
export const getWishlist = () => {
  return getItem(STORAGE_KEYS.WISHLIST) || [];
};

/**
 * Add an item to the wishlist
 * @param {string} productId - Product ID to add
 * @returns {boolean} Whether the operation was successful
 */
export const addToWishlist = (productId) => {
  const wishlist = getItem(STORAGE_KEYS.WISHLIST) || [];

  if (wishlist.includes(productId)) return true;

  const newWishlist = [...wishlist, productId];
  return setItem(STORAGE_KEYS.WISHLIST, newWishlist);
};

/**
 * Remove an item from the wishlist
 * @param {string} productId - Product ID to remove
 * @returns {boolean} Whether the operation was successful
 */
export const removeFromWishlist = (productId) => {
  const wishlist = getItem(STORAGE_KEYS.WISHLIST) || [];

  const newWishlist = wishlist.filter((id) => id !== productId);
  return setItem(STORAGE_KEYS.WISHLIST, newWishlist);
};

/**
 * Check if an item is in the wishlist
 * @param {string} productId - Product ID to check
 * @returns {boolean} Whether the item is in the wishlist
 */
export const isInWishlist = (productId) => {
  const wishlist = getItem(STORAGE_KEYS.WISHLIST) || [];
  return wishlist.includes(productId);
};

/**
 * Clear the wishlist
 * @returns {boolean} Whether the operation was successful
 */
export const clearWishlist = () => {
  return setItem(STORAGE_KEYS.WISHLIST, []);
};
