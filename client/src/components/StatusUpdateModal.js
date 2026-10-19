import React, { useState, useEffect } from "react";
import api from "../services/api";

function StatusUpdateModal({ show, onClose, application, onUpdate }) {
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (application) {
      setNewStatus(application.status || "Pending");
      setRemarks(application.rejectionReason || "");
      setErrorMsg(null);
    }
  }, [application]);

  if (!show || !application) return null;

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const isRejection = newStatus === "Rejected" || newStatus === "Documents Rejected";

  const handlePresetReason = (reasonText) => {
    setRemarks(reasonText);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    // Mandatory rejection reason validation
    if (isRejection && !remarks.trim()) {
      setErrorMsg("A rejection reason is required when rejecting an application.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(
        `/api/applications/${application._id}/status`,
        {
          status: newStatus,
          rejectionReason: remarks.trim(),
        },
        authConfig
      );

      if (onUpdate && response.data.application) {
        onUpdate(response.data.application);
      }

      onClose();
    } catch (err) {
      console.error("Error updating status:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to update status. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "Document Verification":
        return <span className="badge bg-info text-dark">Document Verification</span>;
      case "Processing":
        return <span className="badge bg-primary">Processing</span>;
      case "Approved":
        return <span className="badge bg-success">Approved</span>;
      case "Rejected":
      case "Documents Rejected":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const presetReasons = [
    "Incomplete documentation submitted",
    "Uploaded document is unclear or illegible",
    "Applicant does not meet criteria",
    "Document verification failed",
  ];

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil-square me-2"></i>
              Update Application Status
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMsg && (
                <div className="alert alert-danger mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorMsg}
                </div>
              )}

              {/* Summary details */}
              <div className="card bg-light border-0 mb-3 p-3">
                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted d-block">App ID</span>
                    <strong className="font-monospace">#{application._id.slice(-6).toUpperCase()}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Applicant</span>
                    <strong className="text-dark">{application.citizenName}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Service</span>
                    <span className="fw-semibold text-primary">{application.service}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Current Status</span>
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </div>

              {/* Select New Status */}
              <div className="mb-3">
                <label className="form-label fw-semibold">New Status</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    setErrorMsg(null);
                  }}
                  required
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Document Verification">Document Verification</option>
                  <option value="Processing">Processing</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Remarks / Rejection Reason */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Remarks / Rejection Reason
                  {isRejection && <span className="text-danger ms-1">* (Required)</span>}
                </label>

                {isRejection && (
                  <div className="mb-2">
                    <small className="text-muted d-block mb-1">Quick Presets:</small>
                    {presetReasons.map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-2 mb-1"
                        onClick={() => handlePresetReason(reason)}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  className="form-control"
                  rows="3"
                  placeholder={
                    isRejection
                      ? "Enter required rejection reason or remarks..."
                      : "Enter optional remarks..."
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required={isRejection}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
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
                className={`btn ${isRejection ? "btn-danger" : "btn-primary"} px-4`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StatusUpdateModal;
