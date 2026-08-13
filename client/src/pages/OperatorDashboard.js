import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";
import DocumentVerificationModal from "../components/DocumentVerificationModal";
import StatusUpdateModal from "../components/StatusUpdateModal";
import ApplicationFilters from "../components/ApplicationFilters";

function OperatorDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals State
  const [selectedDocApp, setSelectedDocApp] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [selectedStatusApp, setSelectedStatusApp] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Operator Payment Confirmation Modal State
  const [selectedPaymentApp, setSelectedPaymentApp] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Operator Payment Rejection Modal State
  const [selectedRejectApp, setSelectedRejectApp] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/applications");
      setApplications(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleModalUpdate = (updatedApplication) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === updatedApplication._id ? updatedApplication : app))
    );
    if (selectedDocApp?._id === updatedApplication._id) {
      setSelectedDocApp(updatedApplication);
    }
    if (selectedStatusApp?._id === updatedApplication._id) {
      setSelectedStatusApp(updatedApplication);
    }
  };

  // Confirm Payment Action (Operator -> Backend POST /api/payment/operator-confirm)
  const handleConfirmPayment = async () => {
    if (!selectedPaymentApp) return;
    setConfirming(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/payment/operator-confirm",
        { applicationId: selectedPaymentApp._id },
        authConfig
      );

      alert(`✓ Payment confirmed successfully! Receipt generated: ${response.data.receiptNumber}`);
      setShowConfirmModal(false);
      setSelectedPaymentApp(null);
      fetchApplications();
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert(error.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setConfirming(false);
    }
  };

  // Reject Payment Action (Operator -> Backend POST /api/payment/operator-reject)
  const handleRejectPayment = async () => {
    if (!selectedRejectApp) return;
    setRejecting(true);

    try {
      await axios.post(
        "http://localhost:5000/api/payment/operator-reject",
        {
          applicationId: selectedRejectApp._id,
          rejectionReason: rejectReason || "Payment could not be verified.",
        },
        authConfig
      );

      alert("Payment verification rejected.");
      setShowRejectModal(false);
      setSelectedRejectApp(null);
      setRejectReason("");
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert(error.response?.data?.message || "Failed to reject payment.");
    } finally {
      setRejecting(false);
    }
  };

  // Client-Side Search & Filter Logic
  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const formattedId = `sc-${new Date(app.createdAt || Date.now()).getFullYear()}-${app._id.slice(-6)}`.toLowerCase();
    const shortId = `#${app._id.slice(-6)}`.toLowerCase();
    const fullId = app._id.toLowerCase();

    const nameMatch = app.citizenName ? app.citizenName.toLowerCase().includes(searchLower) : false;
    const emailMatch = app.email ? app.email.toLowerCase().includes(searchLower) : false;
    const idMatch = fullId.includes(searchLower) || shortId.includes(searchLower) || formattedId.includes(searchLower);

    const matchesSearch = searchLower === "" || nameMatch || emailMatch || idMatch;

    let matchesStatus = true;
    if (statusFilter === "Pending") {
      matchesStatus = app.status === "Pending" || app.status === "Document Verification";
    } else if (statusFilter === "Processing") {
      matchesStatus = app.status === "Processing";
    } else if (statusFilter === "Approved") {
      matchesStatus = app.status === "Approved" || app.status === "Document Ready";
    } else if (statusFilter === "Rejected") {
      matchesStatus = app.status === "Rejected" || app.status === "Documents Rejected";
    } else if (statusFilter === "Payment Pending") {
      matchesStatus = app.paymentStatus === "Verification Pending" || app.status === "Payment Verification Pending";
    }

    return matchesSearch && matchesStatus;
  });

  const pendingPayments = applications.filter(
    (app) => app.paymentStatus === "Verification Pending" || app.status === "Payment Verification Pending"
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <span className="badge bg-warning text-dark">Pending</span>;
      case "Document Verification":
        return <span className="badge bg-info text-dark">Document Verification</span>;
      case "Processing":
        return <span className="badge bg-primary">Processing</span>;
      case "Approved":
      case "Document Ready":
        return <span className="badge bg-success">Document Ready</span>;
      case "Payment Verification Pending":
        return <span className="badge bg-warning text-dark">Payment Verification Pending</span>;
      case "Completed":
        return <span className="badge bg-success">Completed ✓</span>;
      case "Rejected":
      case "Documents Rejected":
      case "Payment Rejected":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold">Operator Dashboard 👨‍💼</h2>
          <p className="text-muted">
            Review citizen applications, verify uploaded documents, confirm fee payments, and complete service issuance.
          </p>
        </div>

        {/* Statistics */}
        <div className="row mb-4 g-3">
          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Total Applications</h6>
                <h3 className="fw-bold">{applications.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Doc Verification Pending</h6>
                <h3 className="fw-bold text-warning">
                  {
                    applications.filter(
                      (app) => app.status === "Pending" || app.status === "Document Verification"
                    ).length
                  }
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Payment Verification Pending</h6>
                <h3 className="fw-bold text-warning">{pendingPayments.length}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Completed Services</h6>
                <h3 className="fw-bold text-success">
                  {applications.filter((app) => app.status === "Completed").length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION A: PENDING PAYMENT VERIFICATIONS CARD */}
        {pendingPayments.length > 0 && (
          <div className="card shadow-sm border-0 mb-4 border-start border-4 border-warning">
            <div className="card-header bg-warning bg-opacity-10 py-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-clock-history text-warning me-2"></i>
                Pending Payment Verifications ({pendingPayments.length})
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>App ID</th>
                      <th>Citizen Name</th>
                      <th>Email</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map((app) => (
                      <tr key={app._id}>
                        <td className="font-monospace fw-bold">#{app._id.slice(-6).toUpperCase()}</td>
                        <td className="fw-semibold">{app.citizenName}</td>
                        <td className="small text-muted">{app.email}</td>
                        <td className="fw-bold text-primary">{app.service}</td>
                        <td className="fw-bold text-success">₹{app.payment?.amount || 100}</td>
                        <td>
                          <span className="badge bg-warning text-dark">Verification Pending</span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm fw-bold px-3"
                              onClick={() => {
                                setSelectedPaymentApp(app);
                                setShowConfirmModal(true);
                              }}
                            >
                              <i className="bi bi-check-circle me-1"></i> Confirm Payment
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm px-3"
                              onClick={() => {
                                setSelectedRejectApp(app);
                                setShowRejectModal(true);
                              }}
                            >
                              <i className="bi bi-x-circle me-1"></i> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: APPLICATIONS MANAGEMENT TABLE */}
        <ApplicationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={applications.length}
          filteredCount={filteredApplications.length}
          onClear={handleClearFilters}
        />

        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="alert alert-info m-4">No matching applications found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>App ID</th>
                      <th>Citizen Name</th>
                      <th>Service</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Uploaded Docs</th>
                      <th>Payment Status</th>
                      <th style={{ minWidth: "220px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => {
                      const docCount = app.documents ? app.documents.length : 0;
                      const acceptedCount = app.documents
                        ? app.documents.filter((d) => d.status === "Accepted").length
                        : 0;

                      return (
                        <tr key={app._id}>
                          <td>
                            <span className="font-monospace fw-bold">
                              #{app._id.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td className="fw-semibold">{app.citizenName}</td>
                          <td>
                            <strong className="text-primary">{app.service}</strong>
                          </td>
                          <td className="small text-muted">{app.description}</td>
                          <td>{getStatusBadge(app.status)}</td>
                          <td>
                            {docCount > 0 ? (
                              <span
                                className={`badge ${
                                  acceptedCount === docCount ? "bg-success" : "bg-secondary"
                                }`}
                              >
                                {acceptedCount}/{docCount} Accepted
                              </span>
                            ) : (
                              <span className="badge bg-light text-dark border">None</span>
                            )}
                          </td>
                          <td>
                            {app.paymentStatus === "Paid" ? (
                              <span className="badge bg-success">Paid ✓</span>
                            ) : app.paymentStatus === "Verification Pending" ? (
                              <span className="badge bg-warning text-dark">Verification Pending</span>
                            ) : (
                              <span className="badge bg-secondary">Pending</span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                              <button
                                className="btn btn-outline-primary btn-sm text-start"
                                onClick={() => {
                                  setSelectedDocApp(app);
                                  setShowVerifyModal(true);
                                }}
                              >
                                📋 Verify Documents ({docCount})
                              </button>

                              <button
                                className="btn btn-outline-secondary btn-sm text-start"
                                onClick={() => {
                                  setSelectedStatusApp(app);
                                  setShowStatusModal(true);
                                }}
                              >
                                ✏️ Update Status
                              </button>

                              {app.paymentStatus === "Verification Pending" && (
                                <button
                                  className="btn btn-success btn-sm text-start fw-bold"
                                  onClick={() => {
                                    setSelectedPaymentApp(app);
                                    setShowConfirmModal(true);
                                  }}
                                >
                                  💳 Confirm Payment
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DOCUMENT VERIFICATION MODAL */}
      <DocumentVerificationModal
        show={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          fetchApplications();
        }}
        application={selectedDocApp}
        onStatusUpdated={handleModalUpdate}
      />

      {/* STATUS UPDATE MODAL */}
      <StatusUpdateModal
        show={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          fetchApplications();
        }}
        application={selectedStatusApp}
        onStatusUpdated={handleModalUpdate}
      />

      {/* OPERATOR PAYMENT CONFIRMATION DIALOG MODAL */}
      {showConfirmModal && selectedPaymentApp && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-3">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i> Confirm Payment Verification
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="fw-semibold text-dark mb-3">
                  Are you sure you want to confirm this citizen service fee payment?
                </p>

                <div className="bg-light p-3 rounded border mb-3 small">
                  <div className="row g-2">
                    <div className="col-6">
                      <span className="text-muted d-block">Application ID</span>
                      <strong className="font-monospace text-dark">
                        #{selectedPaymentApp._id.slice(-6).toUpperCase()}
                      </strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Citizen Name</span>
                      <strong className="text-dark">{selectedPaymentApp.citizenName}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Service Name</span>
                      <strong className="text-primary">{selectedPaymentApp.service}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Service Fee Amount</span>
                      <strong className="text-success fs-6">
                        ₹{selectedPaymentApp.payment?.amount || 100}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="alert alert-info py-2 mb-0 small">
                  <i className="bi bi-info-circle me-1"></i> Confirming will mark payment as <strong>PAID</strong>, generate an official receipt, and set application status to <strong>COMPLETED</strong>.
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={confirming}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success fw-bold px-4"
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Confirming...
                    </>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OPERATOR PAYMENT REJECTION MODAL */}
      {showRejectModal && selectedRejectApp && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-3">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-x-circle-fill me-2"></i> Reject Payment Verification
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowRejectModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <p className="small text-muted mb-3">
                  Specify the reason why payment verification could not be completed for application{" "}
                  <strong className="font-monospace">
                    #{selectedRejectApp._id.slice(-6).toUpperCase()}
                  </strong>.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-bold">Rejection Reason *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Payment transaction could not be verified."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejecting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4"
                  onClick={handleRejectPayment}
                  disabled={rejecting}
                >
                  {rejecting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Rejecting...
                    </>
                  ) : (
                    "Reject Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default OperatorDashboard;