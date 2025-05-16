import React, { useState, useEffect } from "react";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import adminService from "../../../services/admin.service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import Loader from "../../ui/Loader";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdvancedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    if (timeframe !== "custom") {
      fetchChartData();
    }
  }, [timeframe]);

  const fetchChartData = async (customDates = null) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (customDates) {
        response = await adminService.getCustomRevenueChartData(
          customDates.startDate,
          customDates.endDate
        );
      } else {
        response = await adminService.getRevenueChartData(timeframe);
      }

      // Add console log to inspect the structure
      console.log("Chart API response:", response);

      if (response.success) {
        // FIX: Handle nested data structure correctly
        if (Array.isArray(response.data)) {
          // Data is directly an array
          setChartData(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          // Data is nested in response.data.data
          setChartData(response.data.data);
        } else {
          throw new Error("Unexpected data format received from API");
        }
      } else {
        throw new Error(response.message || "Failed to fetch chart data");
      }
    } catch (err) {
      console.error("Chart data fetch error:", err);
      setError("Failed to load chart data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (e) => {
    const value = e.target.value;
    setTimeframe(value);
    setShowCustomDates(value === "custom");
  };

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setCustomDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCustomDates = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      fetchChartData(customDateRange);
    }
  };

  // Prepare chart data
  const revenueData = {
    labels: chartData?.map((item) => item.label) || [],
    datasets: [
      {
        label: "Revenue",
        data: chartData?.map((item) => item.revenue) || [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
      },
      {
        label: "Orders",
        data: chartData?.map((item) => item.orders) || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue & Orders Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading && !chartData) {
    return <Loader text="Loading chart data..." />;
  }

  return (
    <div>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-4">Revenue & Orders Analysis</h5>

          {/* Timeframe selector */}
          <Row className="mb-4 align-items-end">
            <Col md={6} lg={4}>
              <Form.Group>
                <Form.Label>Select Timeframe</Form.Label>
                <Form.Select value={timeframe} onChange={handleTimeframeChange}>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="quarter">Last 3 months</option>
                  <option value="year">Last 12 months</option>
                  <option value="custom">Custom date range</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {showCustomDates && (
              <>
                <Col md={3} lg={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={customDateRange.startDate}
                      onChange={handleCustomDateChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} lg={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={customDateRange.endDate}
                      onChange={handleCustomDateChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} lg={2}>
                  <Button
                    variant="primary"
                    onClick={handleApplyCustomDates}
                    disabled={
                      !customDateRange.startDate || !customDateRange.endDate
                    }
                  >
                    Apply
                  </Button>
                </Col>
              </>
            )}
          </Row>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Chart */}
          <div style={{ height: "400px" }}>
            <Line data={revenueData} options={chartOptions} />
          </div>
        </Card.Body>
      </Card>

      {/* Revenue metrics table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="mb-4">Detailed Metrics</h5>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Growth (%)</th>
                </tr>
              </thead>
              <tbody>
                {chartData?.map((item, index) => {
                  // Calculate growth percentage
                  const prevRevenue =
                    index > 0 ? chartData[index - 1].revenue : null;
                  const growth = prevRevenue
                    ? (
                        ((item.revenue - prevRevenue) / prevRevenue) *
                        100
                      ).toFixed(2)
                    : "-";

                  return (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td>{item.orders}</td>
                      <td>₫{item.revenue.toLocaleString("en-US")}</td>
                      <td>
                        {growth !== "-" ? (
                          <span
                            className={
                              growth >= 0 ? "text-success" : "text-danger"
                            }
                          >
                            {growth >= 0 ? "+" : ""}
                            {growth}%
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdvancedDashboard;
