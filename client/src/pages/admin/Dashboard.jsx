import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminLayout from "../../components/admin/AdminLayout";
import SimpleDashboard from "../../components/admin/dashboard/SimpleDashboard";
import AdvancedDashboard from "../../components/admin/dashboard/AdvancedDashboard";
import { Tab, Tabs } from "react-bootstrap";

const AdminDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle authentication and authorization
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/admin" } } });
    } else if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // If not authenticated or authorized, don't render anything
  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-speedometer2 text-primary fs-3 me-2"></i>
          <h1 className="h3 mb-0">Dashboard</h1>
        </div>

        <Tabs defaultActiveKey="simple" className="mb-4">
          <Tab eventKey="simple" title="Simple Dashboard">
            <SimpleDashboard />
          </Tab>
          <Tab eventKey="advanced" title="Advanced Dashboard">
            <AdvancedDashboard />
          </Tab>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
