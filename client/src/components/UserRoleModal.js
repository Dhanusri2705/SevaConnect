import React, { useState, useEffect } from "react";
import axios from "axios";

function UserRoleModal({ show, onClose, targetUser, onUpdate }) {
  const [newRole, setNewRole] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (targetUser) {
      setNewRole(targetUser.role || "citizen");
      setMessage(null);
    }
  }, [targetUser]);

  if (!show || !targetUser) return null;

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newRole === targetUser.role) {
      setMessage({ type: "info", text: "Selected role is the same as the current role." });
      return;
    }

    const confirmMessage = `Are you sure you want to change ${targetUser.name}'s role from ${targetUser.role.toUpperCase()} to ${newRole.toUpperCase()}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/auth/users/${targetUser._id}/role`,
        { role: newRole },
        authConfig
      );

      if (onUpdate && response.data.user) {
        onUpdate(response.data.user);
      }

      alert(response.data.message || "User role updated successfully.");
      onClose();
    } catch (err) {
      console.error("Error updating user role:", err);
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to update user role.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-gear me-2"></i>
              Manage User Role
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {message && (
                <div className={`alert alert-${message.type} mb-3`} role="alert">
                  {message.text}
                </div>
              )}

              <div className="card bg-light border-0 mb-3 p-3">
                <div className="row g-2 small">
                  <div className="col-12">
                    <span className="text-muted d-block">User Name</span>
                    <strong className="fs-6 text-dark">{targetUser.name}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Email</span>
                    <span>{targetUser.email}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Current Role</span>
                    <span className="badge bg-secondary text-uppercase">{targetUser.role}</span>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Select New Role</label>
                <select
                  className="form-select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  required
                >
                  <option value="citizen">Citizen (Standard User)</option>
                  <option value="operator">Operator (Service Reviewer)</option>
                  <option value="admin">Admin (System Manager)</option>
                </select>
                <small className="text-muted d-block mt-1">
                  Operators can review & verify documents. Admins have full portal management permissions.
                </small>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary px-3"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading || newRole === targetUser.role}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update Role"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserRoleModal;
