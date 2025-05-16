import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import adminService from "../../services/admin.service";
import AdminLayout from "../../components/admin/AdminLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import EditUserModal from "../../components/admin/EditUserModal";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";

const UserManagement = () => {
  // State for users and pagination
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
  });

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users when component mounts or when filters/pagination changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role !== "all" ? filters.role : undefined,
        status: filters.status !== "all" ? filters.status : undefined,
      });

      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle search input change
  const handleSearchChange = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  // Function to handle role filter change
  const handleRoleChange = (e) => {
    setFilters({ ...filters, role: e.target.value });
  };

  // Function to handle status filter change
  const handleStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value });
  };

  // Function to handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 }); // Reset to first page on search
  };

  // Function to handle page change
  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Function to handle edit user button click
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Function to handle delete user button click
  const handleDeleteUserClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Function to delete a user
  const handleDeleteUser = async () => {
    try {
      const response = await adminService.deleteUser(selectedUser._id);

      if (response.success) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh users list
      } else {
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (err) {
      toast.error(err.message || "Error deleting user");
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Function to handle user update
  const handleUserUpdate = async (userData) => {
    try {
      const response = await adminService.updateUser(
        selectedUser._id,
        userData
      );

      if (response.success) {
        toast.success("User updated successfully");
        fetchUsers(); // Refresh users list
        setShowEditModal(false);
      } else {
        throw new Error(response.message || "Failed to update user");
      }
    } catch (err) {
      toast.error(err.message || "Error updating user");
    }
  };

  // Function to handle user status toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await adminService.updateUserStatus(userId, {
        status: newStatus,
      });

      if (response.success) {
        toast.success(
          `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );
        fetchUsers(); // Refresh users list
      } else {
        throw new Error(response.message || "Failed to update user status");
      }
    } catch (err) {
      toast.error(err.message || "Error updating user status");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-4">
        <div className="bg-gradient bg-primary text-white p-4 rounded-3 mb-4 shadow-sm">
          <h1 className="display-6 mb-0">
            <i className="bi bi-people me-2"></i>
            User Management
          </h1>
        </div>

        {/* Filters and search */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <form onSubmit={handleSearchSubmit}>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search by name, email, or ID..."
                      value={filters.search}
                      onChange={handleSearchChange}
                    />
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                  </div>
                </form>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-person-badge text-primary"></i>
                  </span>
                  <select
                    className="form-select"
                    value={filters.role}
                    onChange={handleRoleChange}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <i className="bi bi-toggle-on text-success"></i>
                  </span>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={handleStatusChange}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Users table */}
        <Card className="mb-4">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <Loader size="lg" />
              </div>
            ) : users.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle border-bottom">
                  <thead className="table-light">
                    <tr>
                      <th className="text-secondary">ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th className="text-center">Role</th>
                      <th className="text-center">Status</th>
                      <th>Created</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-bottom">
                        <td>
                          <span className="badge bg-light text-secondary">
                            {user._id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="fw-medium">{user.fullName || "N/A"}</td>
                        <td>{user.email}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              user.role === "admin" ? "bg-danger" : "bg-primary"
                            } rounded-pill px-3 py-2`}
                          >
                            <i
                              className={`bi ${
                                user.role === "admin"
                                  ? "bi-shield-lock"
                                  : "bi-person"
                              } me-1`}
                            ></i>
                            {user.role}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              user.status === "active"
                                ? "bg-success"
                                : "bg-secondary"
                            } rounded-pill px-3 py-2`}
                          >
                            <i
                              className={`bi ${
                                user.status === "active"
                                  ? "bi-check-circle"
                                  : "bi-dash-circle"
                              } me-1`}
                            ></i>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <i className="bi bi-calendar3 text-secondary me-1"></i>
                          {formatDate(user.createdAt)}
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-sm btn-outline-primary text-primary"
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger text-danger"
                              onClick={() => handleDeleteUserClick(user)}
                              title="Delete User"
                              disabled={user.role === "admin"}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleToggleUserStatus(user._id, user.status)
                              }
                              title={
                                user.status === "active"
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              <i
                                className={`bi ${
                                  user.status === "active"
                                    ? "bi-lock"
                                    : "bi-unlock"
                                }`}
                              ></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="mb-3">
                  <i
                    className="bi bi-people text-secondary"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
                <h5 className="text-secondary">No users found</h5>
                <p className="text-muted">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}

            {/* Pagination */}
            {users.length > 0 && pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            show={showEditModal}
            user={selectedUser}
            onClose={() => setShowEditModal(false)}
            onSave={handleUserUpdate}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete the user ${
            selectedUser?.fullName || selectedUser?.email
          }? This action cannot be undone.`}
        />

        {/* For the empty state when no users are found */}
        {!loading && users.length === 0 && (
          <div className="text-center p-5 bg-light rounded-3 shadow-sm">
            <div className="mb-4">
              <i
                className="bi bi-people text-secondary"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h5 className="text-secondary">No users found</h5>
            <p className="text-muted mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setFilters({ search: "", role: "all", status: "all" });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Export the component wrapped in the admin layout
export default UserManagement;
