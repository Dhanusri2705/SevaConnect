import React, { useEffect, useState } from "react";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout";

import ApplicationDetailsModal from "../components/ApplicationDetailsModal";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import RazorpayPaymentModal from "../components/RazorpayPaymentModal";
import PaymentReceiptModal from "../components/PaymentReceiptModal";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedDetailsApp, setSelectedDetailsApp] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedPreviewApp, setSelectedPreviewApp] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [selectedPaymentApp, setSelectedPaymentApp] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedReceiptApp, setSelectedReceiptApp] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email;

  const fetchApplications = async () => {
    try {
      const response = await api.get(
        `/api/applications/user/${userEmail}`
      );
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error loading user applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [userEmail]);

  const handleAppUpdate = (updatedApp) => {
    setApplications((prev) =>
      prev.map((app) => (app._id === updatedApp._id ? updatedApp : app))
    );

    if (selectedDetailsApp?._id === updatedApp._id) setSelectedDetailsApp(updatedApp);
    if (selectedPreviewApp?._id === updatedApp._id) setSelectedPreviewApp(updatedApp);
    if (selectedPaymentApp?._id === updatedApp._id) setSelectedPaymentApp(updatedApp);
    if (selectedReceiptApp?._id === updatedApp._id) setSelectedReceiptApp(updatedApp);
  };

  // Helper to check if all uploaded verification documents are accepted & application is approved
  const areAllRequiredDocumentsApproved = (app) => {
    if (!app) return false;
    const unapprovedStatuses = [
      "Pending",
      "Document Verification",
      "Documents Rejected",
      "Rejected",
    ];
    if (unapprovedStatuses.includes(app.status)) return false;

    if (!app.documents || app.documents.length === 0) return false;

    const allAccepted = app.documents.every((doc) => doc.status === "Accepted");
    if (!allAccepted) return false;

    return true;
  };

  // Download PDF Document (Available ONLY after approval + payment)
  const downloadServiceDocument = async (appId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/api/applications/${appId}/document/stream`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SevaConnect-Certificate-${appId.slice(-6).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading service document PDF:", err);
      alert("Failed to download service document PDF.");
    }
  };

  // Download PDF Payment Receipt
  const downloadPaymentReceipt = async (appId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(
        `/api/payment/${appId}/receipt/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `SevaConnect-Payment-Receipt-${appId.slice(-6).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading payment receipt PDF:", err);
      alert("Failed to download payment receipt PDF.");
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
      case "Document Ready":
        return <span className="badge bg-success">Approved</span>;
      case "Payment Verification Pending":
        return <span className="badge bg-warning text-dark">Verification Pending</span>;
      case "Paid":
        return <span className="badge bg-info text-dark">Paid</span>;
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

  const getWorkflowMessage = (app) => {
    const s = app.status;
    if (s === "Pending") return <span className="text-muted small">Application Under Review</span>;
    if (s === "Document Verification" || s === "Processing")
      return <span className="text-info small">Documents under verification</span>;
    if (s === "Approved" || s === "Document Ready")
      return <span className="text-success small fw-semibold">Document Ready - Payment Required</span>;
    if (s === "Payment Verification Pending")
      return <span className="text-warning text-dark small fw-bold">Verification Pending by Operator</span>;
    if (s === "Paid" || s === "Completed")
      return <span className="text-success small fw-bold">✓ Completed - Receipt Available</span>;
    if (s === "Rejected" || s === "Documents Rejected" || s === "Payment Rejected")
      return <span className="text-danger small fw-semibold">Rejected / Incomplete</span>;
    return <span className="text-muted small">{s}</span>;
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">My Applications</h2>
            <p className="text-muted mb-0">
              Track application status, inspect uploaded verification documents, view provisional certificates, and download receipts.
            </p>
          </div>
          <span className="badge bg-primary fs-6 px-3 py-2">
            {applications.length} Total Submissions
          </span>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading your applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="alert alert-info text-center py-5 border-0 shadow-sm">
                <i className="bi bi-folder-x fs-2 d-block mb-2 text-muted"></i>
                <h5 className="fw-bold mb-1">You have not submitted any applications yet.</h5>
                <p className="text-muted small mb-3">Browse available services to apply online.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>App ID</th>
                      <th>Service Details</th>
                      <th>Application Status</th>
                      <th>Generated Document</th>
                      <th>Payment Status</th>
                      <th>Permanent Dispatch</th>
                      <th style={{ minWidth: "230px" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((app) => {
                      const isApprovedAndVerified = areAllRequiredDocumentsApproved(app);
                      const isPaid = app.paymentStatus === "Paid" || app.status === "Completed";
                      const isVerificationPending =
                        app.paymentStatus === "Verification Pending" ||
                        app.status === "Payment Verification Pending";
                      const isPaymentNeeded = isApprovedAndVerified && !isPaid && !isVerificationPending;

                      return (
                        <tr key={app._id}>
                          <td>
                            <small className="text-muted font-monospace fw-bold">
                              #{app._id.slice(-6).toUpperCase()}
                            </small>
                          </td>

                          <td>
                            <strong className="text-primary d-block">{app.service}</strong>
                            <small className="text-muted d-inline-block text-truncate" style={{ maxWidth: "200px" }}>
                              {app.description}
                            </small>
                          </td>

                          <td>
                            <div>{getStatusBadge(app.status)}</div>
                            <div className="mt-1">{getWorkflowMessage(app)}</div>
                          </td>

                          <td>
                            {isPaid ? (
                              <span className="badge bg-success">
                                <i className="bi bi-file-earmark-check me-1"></i> Available ✓
                              </span>
                            ) : isApprovedAndVerified ? (
                              <span className="badge bg-success">
                                <i className="bi bi-lock me-1"></i> Ready (Payment Required)
                              </span>
                            ) : app.status === "Documents Rejected" ? (
                              <span className="badge bg-danger">Not Available</span>
                            ) : (
                              <span className="badge bg-secondary">Pending Verification</span>
                            )}
                          </td>

                          <td>
                            {isPaid ? (
                              <span className="badge bg-success">Paid ✓</span>
                            ) : isVerificationPending ? (
                              <span className="badge bg-warning text-dark">Verification Pending</span>
                            ) : isPaymentNeeded ? (
                              <span className="badge bg-warning text-dark">Payment Required</span>
                            ) : (
                              <span className="badge bg-secondary">Not Available</span>
                            )}
                          </td>

                          <td>
                            {isPaid ? (
                              <small className="text-success fw-semibold">
                                <i className="bi bi-truck me-1"></i> Dispatched
                              </small>
                            ) : isApprovedAndVerified ? (
                              <small className="text-muted">Will dispatch after payment</small>
                            ) : (
                              <small className="text-muted">Not Applicable</small>
                            )}
                          </td>

                          <td>
                            <div className="d-flex flex-column gap-1">
                              {/* ALWAYS ALLOW CITIZEN TO VIEW DETAILS */}
                              <button
                                className="btn btn-outline-dark btn-sm text-start"
                                onClick={() => {
                                  setSelectedDetailsApp(app);
                                  setShowDetailsModal(true);
                                }}
                              >
                                <i className="bi bi-info-circle-fill me-1"></i> View Details
                              </button>

                              {/* VIEW DOCUMENT BUTTON ONLY FOR APPROVED APPLICATIONS */}
                              {isApprovedAndVerified && (
                                <button
                                  className="btn btn-outline-primary btn-sm text-start"
                                  onClick={() => {
                                    setSelectedPreviewApp(app);
                                    setShowPreviewModal(true);
                                  }}
                                >
                                  <i className="bi bi-eye-fill me-1"></i> View Document
                                </button>
                              )}

                              {/* DOWNLOAD DOCUMENT BUTTON ONLY AFTER BOTH APPROVAL AND PAYMENT */}
                              {isApprovedAndVerified && isPaid && (
                                <button
                                  className="btn btn-primary btn-sm text-start fw-semibold"
                                  onClick={() => downloadServiceDocument(app._id)}
                                >
                                  <i className="bi bi-download me-1"></i> Download Document
                                </button>
                              )}

                              {/* PAY NOW BUTTON FOR APPROVED UNPAID APPLICATIONS */}
                              {isPaymentNeeded && (
                                <button
                                  className="btn btn-success btn-sm text-start fw-bold"
                                  onClick={() => {
                                    setSelectedPaymentApp(app);
                                    setShowPaymentModal(true);
                                  }}
                                >
                                  <i className="bi bi-credit-card-fill me-1"></i> Pay Now
                                </button>
                              )}

                              {/* VIEW PAYMENT STATUS BUTTON IF VERIFICATION PENDING */}
                              {isVerificationPending && (
                                <button
                                  className="btn btn-outline-warning btn-sm text-dark text-start"
                                  onClick={() => {
                                    setSelectedPaymentApp(app);
                                    setShowPaymentModal(true);
                                  }}
                                >
                                  <i className="bi bi-clock-history me-1"></i> View Payment Status
                                </button>
                              )}

                              {/* VIEW RECEIPT & DOWNLOAD RECEIPT BUTTONS ONLY IF PAID */}
                              {isPaid && (
                                <>
                                  <button
                                    className="btn btn-outline-success btn-sm text-start"
                                    onClick={() => {
                                      setSelectedReceiptApp(app);
                                      setShowReceiptModal(true);
                                    }}
                                  >
                                    <i className="bi bi-receipt me-1"></i> View Receipt
                                  </button>

                                  <button
                                    className="btn btn-success btn-sm text-start"
                                    onClick={() => downloadPaymentReceipt(app._id)}
                                  >
                                    <i className="bi bi-download me-1"></i> Download Receipt
                                  </button>
                                </>
                              )}

                              {/* View Remarks if rejected */}
                              {app.rejectionReason && (
                                <small className="text-danger mt-1">
                                  <i className="bi bi-exclamation-circle me-1"></i>
                                  {app.rejectionReason}
                                </small>
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

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          fetchApplications();
        }}
        application={selectedDetailsApp}
        onOpenPreviewModal={(app) => {
          setSelectedPreviewApp(app);
          setShowPreviewModal(true);
        }}
        onOpenPaymentModal={(app) => {
          setSelectedPaymentApp(app);
          setShowPaymentModal(true);
        }}
        onOpenReceiptModal={(app) => {
          setSelectedReceiptApp(app);
          setShowReceiptModal(true);
        }}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        show={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          fetchApplications();
        }}
        application={selectedPreviewApp}
      />

      {/* Payment Modal */}
      <RazorpayPaymentModal
        show={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          fetchApplications();
        }}
        application={selectedPaymentApp}
        onPaymentSubmitted={handleAppUpdate}
        onOpenViewModal={(app) => {
          setSelectedPreviewApp(app);
          setShowPreviewModal(true);
        }}
        onOpenReceiptModal={(app) => {
          setSelectedReceiptApp(app);
          setShowReceiptModal(true);
        }}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        show={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        application={selectedReceiptApp}
      />
    </MainLayout>
  );
}

export default MyApplications;