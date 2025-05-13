import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for making API requests with loading, error, and caching support
 *
 * @param {string} url - API endpoint to fetch from
 * @param {Object} options - Fetch options
 * @param {boolean} options.skip - Whether to skip the fetch (default: false)
 * @param {Object} options.headers - Additional headers to include
 * @param {string} options.method - HTTP method (default: 'GET')
 * @param {Object|null} options.body - Request body (for POST, PUT, etc.)
 * @param {boolean} options.cache - Whether to cache the result (default: true)
 * @param {number} options.cacheTime - Time in ms to keep cache valid (default: 5 minutes)
 * @param {Array} options.deps - Dependencies array to trigger refetch
 * @returns {Object} - { data, error, loading, refetch }
 */
const useFetch = (url, options = {}) => {
  // Default options
  const {
    skip = false,
    headers = {},
    method = "GET",
    body = null,
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    deps = [],
  } = options;

  // States for data, loading and error
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref for the abort controller to persist across renders
  const abortControllerRef = useRef(null);

  // Cache ref to store previous results
  const cacheRef = useRef({});

  // Check if data for this URL is already in cache and still valid
  const isCacheValid = useCallback(
    (url) => {
      if (!cache || !cacheRef.current[url]) return false;

      const { timestamp } = cacheRef.current[url];
      const now = Date.now();

      return timestamp && now - timestamp < cacheTime;
    },
    [cache, cacheTime]
  );

  // Function to make the fetch request
  const fetchData = useCallback(
    async (url, customOptions = {}) => {
      // Merge default options with custom options
      const fetchOptions = {
        ...options,
        ...customOptions,
      };

      // Check cache first if caching is enabled
      if (cache && isCacheValid(url)) {
        const { data: cachedData } = cacheRef.current[url];
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // Prepare fetch options
        const requestOptions = {
          method: fetchOptions.method || method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...fetchOptions.headers,
          },
          signal: abortControllerRef.current.signal,
        };

        // Add body if provided and method is not GET
        if (requestOptions.method !== "GET" && (fetchOptions.body || body)) {
          requestOptions.body = JSON.stringify(fetchOptions.body || body);
        }

        // Make the request
        const response = await fetch(url, requestOptions);

        // Parse the response
        let result;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          result = await response.json();
        } else {
          result = await response.text();
        }

        // Check if response is ok
        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              `Request failed with status ${response.status}`
          );
        }

        // Update data state and cache
        setData(result);

        // Store in cache if caching is enabled
        if (cache) {
          cacheRef.current[url] = {
            data: result,
            timestamp: Date.now(),
          };
        }

        setLoading(false);
        return result;
      } catch (err) {
        // Ignore AbortError as it's intentional
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }

        setError(err.message || "An error occurred");
        setLoading(false);
        return null;
      }
    },
    [url, method, body, headers, cache, isCacheValid]
  );

  // Function to manually trigger a refetch
  const refetch = useCallback(
    (customOptions = {}) => {
      return fetchData(url, customOptions);
    },
    [url, fetchData]
  );

  // Effect to fetch data when component mounts or dependencies change
  useEffect(() => {
    // Skip fetch if requested
    if (skip) {
      setLoading(false);
      return;
    }

    fetchData(url);

    // Cleanup function to abort fetch when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, skip, fetchData, ...deps]);

  return { data, loading, error, refetch };
};

export default useFetch;
