import React, { useState } from "react";

function UserManagement({ users, loading, onOpenRoleModal }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const nameMatch = user.name ? user.name.toLowerCase().includes(searchLower) : false;
    const emailMatch = user.email ? user.email.toLowerCase().includes(searchLower) : false;
    const phoneMatch = user.phone ? user.phone.includes(searchLower) : false;

    const matchesSearch = searchLower === "" || nameMatch || emailMatch || phoneMatch;
    const matchesRole = roleFilter === "All" || (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleBadge = (role) => {
    const r = (role || "citizen").toLowerCase();
    if (r === "admin") return <span className="badge bg-dark">ADMIN</span>;
    if (r === "operator") return <span className="badge bg-info text-dark">OPERATOR</span>;
    return <span className="badge bg-primary">CITIZEN</span>;
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
          <h4 className="fw-bold mb-0">
            <i className="bi bi-people-fill text-primary me-2"></i>
            User Management
          </h4>
          <span className="badge bg-light text-dark border px-3 py-2">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> registered users
          </span>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          <div className="col-md-4 col-lg-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="operator">Operators</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {(searchTerm || roleFilter !== "All") && (
            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="alert alert-info text-center py-4 my-2">
            <i className="bi bi-person-x fs-2 d-block mb-2 text-muted"></i>
            <h6 className="fw-bold mb-1">No users found</h6>
            <p className="small text-muted mb-0">Try adjusting your search query or role filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>User Details</th>
                  <th>Contact Phone</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th style={{ width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong className="text-dark">{user.name}</strong>
                      <br />
                      <small className="text-muted">
                        <i className="bi bi-envelope me-1"></i>
                        {user.email}
                      </small>
                    </td>

                    <td>{user.phone || "N/A"}</td>

                    <td>{getRoleBadge(user.role)}</td>

                    <td>
                      <small className="text-muted">{formatDate(user.createdAt)}</small>
                    </td>

                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => onOpenRoleModal(user)}
                        title="Change user access role"
                      >
                        <i className="bi bi-person-gear me-1"></i>
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
