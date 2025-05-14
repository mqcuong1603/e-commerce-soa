// Import Bootstrap CSS and Icons
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Import Bootstrap JS bundle (includes Popper)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import your global styles after Bootstrap to allow overrides
// import "./assets/styles/global.css";

// Add custom styles for hover effects and other Bootstrap extensions
const style = document.createElement("style");
style.textContent = `
  /* Hover effect for product cards */
  .product-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  
  /* Custom hover classes */
  .hover-shadow:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
  }
  
  .hover-text-white:hover {
    color: white !important;
  }
  
  /* Custom utility classes */
  .object-fit-contain {
    object-fit: contain;
  }
  
  .min-vh-40 {
    min-height: 40vh;
  }
  
  /* Custom colors */
  .text-danger {
    color: #dc3545 !important;
  }
  
  .bg-danger {
    background-color: #dc3545 !important;
  }
  
  .btn-danger {
    background-color: #dc3545 !important;
    border-color: #dc3545 !important;
  }
  
  .btn-outline-danger {
    color: #dc3545 !important;
    border-color: #dc3545 !important;
  }
  
  .btn-outline-danger:hover {
    color: #fff !important;
    background-color: #dc3545 !important;
  }
`;

document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
