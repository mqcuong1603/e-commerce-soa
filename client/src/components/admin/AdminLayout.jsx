import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div
          className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse"
          style={{ minHeight: "100vh" }}
        >
          <div className="position-sticky pt-3">
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
              <span>Admin Panel</span>
            </h6>
            <ul className="nav flex-column mb-2">
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/orders">
                  <i className="bi bi-bag me-2"></i>
                  Orders
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/products">
                  <i className="bi bi-box me-2"></i>
                  Products
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/users">
                  <i className="bi bi-people me-2"></i>
                  Users
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/discounts">
                  <i className="bi bi-percent me-2"></i>
                  Discount Codes
                </Link>
              </li>
            </ul>
            <hr />
            <ul className="nav flex-column mt-3">
              <li className="nav-item">
                <Link className="nav-link" to="/" target="_blank">
                  <i className="bi bi-shop me-2"></i>
                  View Store
                </Link>
              </li>
              <li className="nav-item">
                <button
                  className="nav-link border-0 bg-transparent text-danger"
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="col-md-9 col-lg-10 ms-sm-auto px-md-4">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
