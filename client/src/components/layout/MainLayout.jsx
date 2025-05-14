import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Main Layout component that wraps all pages
 */
const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
