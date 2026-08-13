import React from "react";

function ApplicationDetailsModal({
  show,
  onClose,
  application,
  onOpenPreviewModal,
  onOpenPaymentModal,
  onOpenReceiptModal,
}) {
  if (!show || !application) return null;

  const shortId = `#${application._id.toString().slice(-6).toUpperCase()}`;
  const formattedDate = new Date(application.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
      case "QR Payment Confirmed":
        return <span className="badge bg-info text-dark">QR Confirmed</span>;
      case "Payment Pending":
        return <span className="badge bg-warning text-dark">Payment Required</span>;
      case "Paid":
        return <span className="badge bg-info text-dark">Paid</span>;
      case "Completed":
        return <span className="badge bg-success">Completed ✓</span>;
      case "Rejected":
      case "Documents Rejected":
        return <span className="badge bg-danger">{status}</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

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

  const isApprovedAndVerified = areAllRequiredDocumentsApproved(application);
  const isDocReady = isApprovedAndVerified;
  const isPaid = application.paymentStatus === "Paid" || application.status === "Completed";
  const isPaymentPending = isApprovedAndVerified && !isPaid;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-file-earmark-text-fill me-2"></i>
              Application Details - {application.service}
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
            {/* Overview Card */}
            <div className="card bg-light border-0 p-3 mb-4">
              <div className="row g-3">
                <div className="col-sm-6 col-md-3">
                  <small className="text-muted d-block">Application ID</small>
                  <strong className="font-monospace text-dark fs-6">{shortId}</strong>
                </div>
                <div className="col-sm-6 col-md-3">
                  <small className="text-muted d-block">Citizen Full Name</small>
                  <strong className="text-dark">{application.citizenName}</strong>
                </div>
                <div className="col-sm-6 col-md-3">
                  <small className="text-muted d-block">Service Name</small>
                  <strong className="text-primary">{application.service}</strong>
                </div>
                <div className="col-sm-6 col-md-3">
                  <small className="text-muted d-block">Submission Date</small>
                  <span className="small text-muted">{formattedDate}</span>
                </div>
                <div className="col-sm-6 col-md-6">
                  <small className="text-muted d-block">Current Status</small>
                  <div>{getStatusBadge(application.status)}</div>
                </div>
                <div className="col-sm-6 col-md-6">
                  <small className="text-muted d-block">Contact Info</small>
                  <span className="small text-dark">
                    <i className="bi bi-envelope me-1"></i>{application.email}
                    {application.phone && ` | ${application.phone}`}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: CITIZEN-UPLOADED DOCUMENTS */}
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
                <i className="bi bi-cloud-upload text-primary me-2"></i>
                1. Uploaded Verification Documents
              </h5>

              {application.documents && application.documents.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle border mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Document Type</th>
                        <th>Uploaded File</th>
                        <th>Verification Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.documents.map((doc, idx) => (
                        <tr key={doc._id || idx}>
                          <td className="fw-semibold text-dark">{doc.documentType}</td>
                          <td>
                            <small className="text-muted font-monospace">{doc.fileName}</small>
                          </td>
                          <td>
                            {doc.status === "Accepted" ? (
                              <span className="badge bg-success">Accepted ✓</span>
                            ) : doc.status === "Rejected" ? (
                              <div>
                                <span className="badge bg-danger mb-1">Rejected ❌</span>
                                {doc.rejectionReason && (
                                  <small className="d-block text-danger" style={{ fontSize: "11px" }}>
                                    Reason: {doc.rejectionReason}
                                  </small>
                                )}
                              </div>
                            ) : (
                              <span className="badge bg-warning text-dark">Pending Review</span>
                            )}
                          </td>
                          <td>
                            <a
                              href={`http://localhost:5000/${doc.filePath}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-box-arrow-up-right me-1"></i> View File
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-light border text-muted small">
                  No verification documents were attached to this application submission.
                </div>
              )}
            </div>

            {/* SECTION 2: SYSTEM-GENERATED SERVICE DOCUMENT */}
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
                <i className="bi bi-file-earmark-check text-primary me-2"></i>
                2. System-Generated Service Document
              </h5>

              {isDocReady ? (
                <div className="p-3 border rounded bg-white shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                  <div>
                    <span className="badge bg-success mb-1">Document Ready ✓</span>
                    <strong className="d-block text-dark">
                      Provisional {application.service} Document
                    </strong>
                    <small className="text-muted">
                      Generated on{" "}
                      {application.documentGeneratedAt
                        ? new Date(application.documentGeneratedAt).toLocaleDateString()
                        : formattedDate}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm px-3"
                      onClick={() => {
                        onClose();
                        if (onOpenPreviewModal) onOpenPreviewModal(application);
                      }}
                    >
                      <i className="bi bi-eye me-1"></i> View / Download Document
                    </button>
                  </div>
                </div>
              ) : (
                <div className="alert alert-secondary mb-0 small">
                  <i className="bi bi-clock-history me-2"></i>
                  Document will be automatically generated upon operator document verification and approval.
                </div>
              )}
            </div>

            {/* SECTION 3: SERVICE FEE PAYMENT */}
            <div className="mb-4">
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
                <i className="bi bi-credit-card text-primary me-2"></i>
                3. Service Fee & Payment Status
              </h5>

              <div className="p-3 border rounded bg-white shadow-sm d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div>
                  <small className="text-muted d-block">Service Fee Amount</small>
                  <strong className="text-success fs-5">
                    ₹{application.payment?.amount || 100}
                  </strong>
                  <span className="ms-3">
                    {isPaid ? (
                      <span className="badge bg-success">Payment Paid ✓</span>
                    ) : isPaymentPending ? (
                      <span className="badge bg-warning text-dark">Payment Required</span>
                    ) : (
                      <span className="badge bg-secondary">Awaiting Document Approval</span>
                    )}
                  </span>
                </div>

                <div>
                  {isPaid ? (
                    <button
                      className="btn btn-outline-success btn-sm px-3"
                      onClick={() => {
                        onClose();
                        if (onOpenReceiptModal) onOpenReceiptModal(application);
                      }}
                    >
                      <i className="bi bi-receipt me-1"></i> View Receipt
                    </button>
                  ) : isPaymentPending ? (
                    <button
                      className="btn btn-success btn-sm px-4 fw-bold"
                      onClick={() => {
                        onClose();
                        if (onOpenPaymentModal) onOpenPaymentModal(application);
                      }}
                    >
                      <i className="bi bi-credit-card-fill me-1"></i> Pay Now
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* SECTION 4: PERMANENT DOCUMENT DISPATCH */}
            <div>
              <h5 className="fw-bold text-dark mb-3 border-bottom pb-2">
                <i className="bi bi-truck text-primary me-2"></i>
                4. Permanent Document Dispatch Status
              </h5>

              <div className="p-3 border rounded bg-light">
                {isPaid ? (
                  <div>
                    <span className="badge bg-success mb-1">Dispatched ✓</span>
                    <p className="small text-dark mb-1 fw-bold">
                      Your permanent physical certificate/document has been processed and dispatched.
                    </p>
                    <small className="text-muted d-block">
                      Delivery Address: {application.deliveryAddress || `${application.citizenName}, Registered Address, India`}
                    </small>
                  </div>
                ) : (
                  <small className="text-muted">
                    Permanent document physical dispatch will be initiated automatically following successful fee payment.
                  </small>
                )}
              </div>
            </div>
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

export default ApplicationDetailsModal;
