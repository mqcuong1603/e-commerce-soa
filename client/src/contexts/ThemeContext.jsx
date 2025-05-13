import React, { createContext, useState, useContext, useEffect } from "react";

// Default themes
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system", // Follow system preference
};

// Create the context
const ThemeContext = createContext();

/**
 * ThemeProvider component manages the theme state and provides theme-related
 * functionality to all child components.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'system'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || THEMES.SYSTEM;
  });

  // Track if the system prefers dark mode
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Determine the active theme based on selection and system preference
  const activeTheme =
    theme === THEMES.SYSTEM
      ? systemPrefersDark
        ? THEMES.DARK
        : THEMES.LIGHT
      : theme;

  // Change theme and persist to localStorage
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = activeTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Safari 13.1-14
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove("light", "dark");

    // Add the appropriate class
    root.classList.add(activeTheme);

    // Optional: update meta theme-color for browsers that support it
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        activeTheme === "dark" ? "#1f2937" : "#ffffff"
      );
    }
  }, [activeTheme]);

  // Create memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      theme,
      activeTheme,
      setTheme: changeTheme,
      toggleTheme,
      isDark: activeTheme === THEMES.DARK,
      isLight: activeTheme === THEMES.LIGHT,
      isSystem: theme === THEMES.SYSTEM,
      systemPrefersDark,
    }),
    [theme, activeTheme, systemPrefersDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 * @returns {Object} Theme context object
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default ThemeContext;
