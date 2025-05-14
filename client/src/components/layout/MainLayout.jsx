import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Main Layout component that wraps all pages
 * Provides consistent page structure with header, main content area, and footer
 */
const MainLayout = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Site header */}
      <Header />

      {/* Main content area with flexible growth */}
      <main className="flex-grow-1">
        <div className="py-4">
          <Outlet />
        </div>
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
