import React, { useState } from "react";
import api, { getFileUrl } from "../services/api";

function DocumentVerificationModal({ show, onClose, application, onUpdate }) {
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [message, setMessage] = useState(null); // { type: 'success' | 'danger', text: '' }

  if (!show || !application) return null;

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Construct viewable file URL
  const getDocumentUrl = (filePath) => {
    return getFileUrl(filePath);
  };

  // Open file in new window/tab
  const handleView = (filePath) => {
    const url = getDocumentUrl(filePath);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Verify Document (Approve or Reject)
  const handleVerify = async (docId, status, rejectionReason = "") => {
    setLoadingDocId(docId);
    setMessage(null);

    const isApprove =
      status === "Accepted" || status === "Approved" || status === "approved";
    const targetStatus = isApprove ? "Accepted" : "Rejected";
    const endpointUrl = `/api/applications/${application._id}/documents/verify`;

    console.log("VERIFY DOCUMENT CALL:", {
      endpoint: endpointUrl,
      documentId: docId,
      status: targetStatus,
    });

    try {
      const response = await api.put(
        endpointUrl,
        {
          documentId: docId,
          status: targetStatus,
          rejectionReason: !isApprove ? rejectionReason : "",
        },
        authConfig
      );

      console.log("VERIFY RESPONSE SUCCESS:", response.status, response.data);

      setMessage({
        type: "success",
        text: isApprove
          ? "Document approved successfully."
          : "Document rejected successfully.",
      });

      setRejectingDocId(null);
      setCustomReason("");

      // Notify parent to refresh list / application data
      if (onUpdate && response.data.application) {
        onUpdate(response.data.application);
      }
    } catch (error) {
      console.error(
        "Document verification error:",
        error.response?.status,
        error.response?.data || error.message
      );
      setMessage({
        type: "danger",
        text:
          "Failed to approve document: " +
          (error.response?.data?.message ||
            error.message ||
            "Server error occurred."),
      });
    } finally {
      setLoadingDocId(null);
    }
  };

  const getDocStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted" || s === "approved") {
      return (
        <span className="badge bg-success">
          <i className="bi bi-check-circle me-1"></i>Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="badge bg-danger">
          <i className="bi bi-x-circle me-1"></i>Rejected
        </span>
      );
    }
    return (
      <span className="badge bg-warning text-dark">
        <i className="bi bi-clock me-1"></i>Pending
      </span>
    );
  };

  const presetReasons = [
    "Document is unclear or blurry",
    "Document has expired",
    "Uploaded document does not match the applicant",
    "Incomplete document submitted",
  ];

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-folder-check me-2"></i>
              View & Verify Documents
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Alert Message */}
            {message && (
              <div
                className={`alert alert-${message.type} alert-dismissible fade show mb-3`}
                role="alert"
              >
                {message.text}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMessage(null)}
                ></button>
              </div>
            )}

            {/* Application Information Summary */}
            <div className="card bg-light border-0 mb-4">
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Application ID</small>
                    <span className="font-monospace fw-bold text-dark">
                      #{application._id}
                    </span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Citizen Name</small>
                    <span className="fw-semibold">{application.citizenName}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Service Requested</small>
                    <span className="fw-semibold text-primary">{application.service}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Overall App Status</small>
                    <span className="badge bg-secondary">{application.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document List */}
            <h6 className="fw-bold mb-3">
              <i className="bi bi-paperclip me-1"></i>
              Uploaded Documents ({application.documents ? application.documents.length : 0})
            </h6>

            {!application.documents || application.documents.length === 0 ? (
              <div className="alert alert-info">
                No documents were uploaded for this application.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Document Type</th>
                      <th>File Name</th>
                      <th>Status</th>
                      <th style={{ minWidth: "220px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.documents.map((doc) => {
                      const docId = doc._id || doc.id;
                      const isApproved =
                        doc.status &&
                        (doc.status.toLowerCase() === "accepted" ||
                          doc.status.toLowerCase() === "approved");

                      return (
                        <React.Fragment key={docId}>
                          <tr>
                            <td className="fw-semibold">{doc.documentType}</td>
                            <td>
                              <small
                                className="text-truncate d-inline-block"
                                style={{ maxWidth: "180px" }}
                                title={doc.fileName}
                              >
                                {doc.fileName}
                              </small>
                            </td>
                            <td>
                              {getDocStatusBadge(doc.status)}
                              {doc.status === "Rejected" && doc.rejectionReason && (
                                <div className="small text-danger mt-1">
                                  <i className="bi bi-info-circle me-1"></i>
                                  {doc.rejectionReason}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                {/* View / Open */}
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => handleView(doc.filePath)}
                                  title="View document"
                                >
                                  <i className="bi bi-eye-fill me-1"></i>
                                  View
                                </button>

                                {/* Approve */}
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleVerify(docId, "Accepted")}
                                  disabled={loadingDocId === docId || isApproved}
                                  title="Approve Document"
                                >
                                  {loadingDocId === docId ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                  ) : (
                                    <i className="bi bi-check-lg me-1"></i>
                                  )}
                                  {isApproved ? "Approved" : "Approve"}
                                </button>

                                {/* Reject Toggle */}
                                <button
                                  className={`btn ${
                                    rejectingDocId === docId ? "btn-dark" : "btn-danger"
                                  }`}
                                  onClick={() => {
                                    if (rejectingDocId === docId) {
                                      setRejectingDocId(null);
                                    } else {
                                      setRejectingDocId(docId);
                                      setCustomReason("");
                                    }
                                  }}
                                  disabled={loadingDocId === docId}
                                  title="Reject Document"
                                >
                                  <i className="bi bi-x-lg me-1"></i>
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Inline Rejection Reason Panel */}
                          {rejectingDocId === docId && (
                            <tr className="table-warning">
                              <td colSpan="4">
                                <div className="p-2">
                                  <label className="form-label fw-bold small text-dark mb-1">
                                    Select or enter rejection reason for "{doc.documentType}":
                                  </label>
                                  <div className="mb-2">
                                    {presetReasons.map((reason, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary me-2 mb-1"
                                        onClick={() => setCustomReason(reason)}
                                      >
                                        {reason}
                                      </button>
                                    ))}
                                  </div>
                                  <div className="input-group input-group-sm">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Enter custom rejection reason..."
                                      value={customReason}
                                      onChange={(e) => setCustomReason(e.target.value)}
                                    />
                                    <button
                                      className="btn btn-danger"
                                      onClick={() =>
                                        handleVerify(
                                          docId,
                                          "Rejected",
                                          customReason ||
                                            "Document rejected during verification."
                                        )
                                      }
                                      disabled={loadingDocId === docId}
                                    >
                                      Confirm Rejection
                                    </button>
                                    <button
                                      className="btn btn-outline-secondary"
                                      onClick={() => setRejectingDocId(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentVerificationModal;
