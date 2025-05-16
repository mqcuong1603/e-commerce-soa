import React, { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Pie, Bar } from "react-chartjs-2";
import adminService from "../../../services/admin.service";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const SimpleDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [bestProducts, setBestProducts] = useState([]);
  const [error, setError] = useState(null);

  // Format currency with comma separators
  const formatCurrency = (value) => {
    return value?.toLocaleString("en-US") || "0";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make API calls using adminService - with better error handling
        const statsPromise = adminService
          .getOrderStatistics()
          .catch((err) => ({ data: { success: false, error: err.message } }));

        const productsPromise = adminService
          .getBestSellingProducts()
          .catch((err) => ({ data: { success: false, error: err.message } }));

        const userStatsPromise = adminService
          .getUserStatistics()
          .catch((err) => ({ data: { success: false, error: err.message } }));

        // Wait for all promises to resolve, even if some fail
        const [statsResponse, productsResponse, userStatsResponse] =
          await Promise.all([statsPromise, productsPromise, userStatsPromise]);

        // Track which endpoints succeeded and failed
        const failedEndpoints = [];

        if (!statsResponse.data?.success)
          failedEndpoints.push("Order statistics");
        if (!productsResponse.data?.success)
          failedEndpoints.push("Best selling products");
        if (!userStatsResponse.data?.success)
          failedEndpoints.push("User statistics");

        // If we have some data, use what we have
        if (statsResponse.data?.success) {
          setStats({
            ...statsResponse.data.data,
            users: userStatsResponse.data?.success
              ? userStatsResponse.data.data
              : {},
          });
        }

        if (productsResponse.data?.success) {
          setBestProducts(productsResponse.data.data || []);
        }

        // Set appropriate error message if some endpoints failed
        if (failedEndpoints.length > 0) {
          setError(`Failed to load: ${failedEndpoints.join(", ")}`);
        }

        // Show full dashboard only if all endpoints succeeded
        if (!failedEndpoints.length) {
          setError(null);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const statusData = {
    labels: stats?.statusCounts
      ? Object.keys(stats.statusCounts).map(
          (status) => status.charAt(0).toUpperCase() + status.slice(1)
        )
      : [],
    datasets: [
      {
        data: stats?.statusCounts ? Object.values(stats.statusCounts) : [],
        backgroundColor: [
          "#4e73df", // primary
          "#1cc88a", // success
          "#36b9cc", // info
          "#f6c23e", // warning
          "#e74a3b", // danger
          "#858796", // secondary
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare product data
  const productData = {
    labels:
      bestProducts
        ?.map((p) => p.name?.slice(0, 20) || "")
        .map((name) => (name.length === 20 ? `${name}...` : name)) || [],
    datasets: [
      {
        label: "Units Sold",
        data: bestProducts?.map((p) => p.unitsSold || p.quantity || 0) || [],
        backgroundColor: "#4e73df",
        borderColor: "#2e59d9",
        borderWidth: 1,
      },
    ],
  };

  // Render loading state
  if (loading) {
    return (
      <div>
        {/* Summary Cards Skeletons */}
        <Row className="g-4 mb-4">
          {/* Create 4 skeleton cards for the summary stats */}
          {[
            { color: "primary", icon: "bag-check" },
            { color: "success", icon: "cash-stack" },
            { color: "info", icon: "people" },
            { color: "warning", icon: "person-plus" },
          ].map((item, index) => (
            <Col md={6} lg={3} key={index}>
              <Card className="h-100 border-0 shadow-sm position-relative overflow-hidden">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="placeholder-glow w-75">
                      <span className="placeholder col-6 bg-secondary bg-opacity-10 mb-2"></span>
                      <h2 className="mb-0 placeholder col-8 bg-secondary"></h2>
                    </div>
                    <div
                      className={`bg-${item.color} bg-opacity-10 p-3 rounded`}
                    >
                      <i
                        className={`bi bi-${item.icon} text-${item.color} fs-3`}
                      ></i>
                    </div>
                  </div>
                </Card.Body>
                {/* Animated shimmer effect */}
                <div
                  className="position-absolute top-0 start-0 h-100 w-100"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                    animation: "shimmer 1.5s infinite",
                    transform: "skewX(-20deg)",
                    zIndex: 1,
                  }}
                ></div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Skeletons */}
        <Row className="g-4">
          {/* Pie Chart Skeleton */}
          <Col lg={6}>
            <Card className="h-100 border-0 shadow-sm position-relative overflow-hidden">
              <Card.Body>
                <h5 className="placeholder-glow">
                  <span className="placeholder col-7 bg-secondary"></span>
                </h5>
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "300px" }}
                >
                  <div className="text-center">
                    <div
                      className="spinner-border text-primary mb-3"
                      style={{ width: "3rem", height: "3rem" }}
                      role="status"
                    >
                      <span className="visually-hidden">Loading chart...</span>
                    </div>
                    <p className="text-muted mb-0">
                      Loading order statistics...
                    </p>
                  </div>
                </div>
              </Card.Body>
              {/* Animated shimmer effect */}
              <div
                className="position-absolute top-0 start-0 h-100 w-100"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                  animation: "shimmer 1.5s infinite",
                  transform: "skewX(-20deg)",
                  zIndex: 1,
                }}
              ></div>
            </Card>
          </Col>

          {/* Bar Chart Skeleton */}
          <Col lg={6}>
            <Card className="h-100 border-0 shadow-sm position-relative overflow-hidden">
              <Card.Body>
                <h5 className="placeholder-glow">
                  <span className="placeholder col-8 bg-secondary"></span>
                </h5>
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "300px" }}
                >
                  <div className="text-center">
                    <div
                      className="spinner-border text-primary mb-3"
                      style={{ width: "3rem", height: "3rem" }}
                      role="status"
                    >
                      <span className="visually-hidden">Loading chart...</span>
                    </div>
                    <p className="text-muted mb-0">
                      Loading product insights...
                    </p>
                  </div>
                </div>
              </Card.Body>
              {/* Animated shimmer effect */}
              <div
                className="position-absolute top-0 start-0 h-100 w-100"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                  animation: "shimmer 1.5s infinite",
                  transform: "skewX(-20deg)",
                  zIndex: 1,
                }}
              ></div>
            </Card>
          </Col>
        </Row>

        {/* Animation keyframes - add to your component */}
        <style jsx="true">{`
          @keyframes shimmer {
            0% {
              transform: translateX(-150%) skewX(-20deg);
            }
            100% {
              transform: translateX(150%) skewX(-20deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Render error state, but show partial data if available
  if (error && (!stats || !bestProducts.length)) {
    return (
      <div
        className="alert alert-danger d-flex align-items-center"
        role="alert"
      >
        <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
        <div>
          <h5 className="mb-1">Dashboard Error</h5>
          <p className="mb-0">{error}</p>
          <button
            className="btn btn-outline-danger btn-sm mt-3"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  // If we have partial data, show what we have with a warning
  if (error && (stats || bestProducts.length)) {
    return (
      <div>
        <div className="alert alert-warning mb-4" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error} - Showing partial data
        </div>

        {/* Render available dashboard components conditionally */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Orders</h6>
                    <h2 className="mb-0">{stats?.totalOrders || 0}</h2>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <i className="bi bi-bag-check text-primary fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Revenue</h6>
                    <h2 className="mb-0">
                      ₫{formatCurrency(stats?.totalRevenue)}
                    </h2>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <i className="bi bi-cash-stack text-success fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Users</h6>
                    <h2 className="mb-0">{stats?.users?.total || 0}</h2>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <i className="bi bi-people text-info fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">New Users (This Week)</h6>
                    <h2 className="mb-0">{stats?.users?.newUsers || 0}</h2>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <i className="bi bi-person-plus text-warning fs-3"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Order Status Distribution</h5>
                <div style={{ height: "300px" }}>
                  <Pie
                    data={statusData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Best-Selling Products</h5>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={productData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // Regular dashboard rendering when all data is available
  return (
    <div>
      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Orders</h6>
                  <h2 className="mb-0">{stats?.totalOrders || 0}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-bag-check text-primary fs-3"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Revenue</h6>
                  <h2 className="mb-0">
                    ₫{formatCurrency(stats?.totalRevenue)}
                  </h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-cash-stack text-success fs-3"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Users</h6>
                  <h2 className="mb-0">{stats?.users?.total || 0}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-people text-info fs-3"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">New Users (This Week)</h6>
                  <h2 className="mb-0">{stats?.users?.newUsers || 0}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person-plus text-warning fs-3"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-4">Order Status Distribution</h5>
              <div style={{ height: "300px" }}>
                <Pie
                  data={statusData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-4">Best-Selling Products</h5>
              <div style={{ height: "300px" }}>
                <Bar
                  data={productData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SimpleDashboard;
