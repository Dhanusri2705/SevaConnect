import React from "react";

function DocumentPreviewModal({ show, onClose, application }) {
  if (!show || !application) return null;

  const serviceName = application.service || "Government Service";
  const shortId = `#${application._id.toString().slice(-6).toUpperCase()}`;
  const formattedDate = new Date(application.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getWatermarkText = () => {
    const s = serviceName.toLowerCase();
    if (s.includes("aadhaar")) return "SAMPLE / PROVISIONAL DOCUMENT – NOT A GOVERNMENT-ISSUED AADHAAR";
    if (s.includes("pan")) return "SAMPLE / PROVISIONAL DOCUMENT – NOT AN OFFICIAL PAN CARD";
    if (s.includes("birth")) return "SAMPLE / PROVISIONAL DOCUMENT – NOT AN OFFICIAL BIRTH CERTIFICATE";
    return "SAMPLE / PROVISIONAL DOCUMENT – NOT A GOVERNMENT-ISSUED DOCUMENT";
  };

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
              <i className="bi bi-file-earmark-pdf-fill me-2"></i>
              Document Preview - {serviceName}
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
            {/* Application Summary Bar */}
            <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-3 rounded border">
              <div>
                <small className="text-muted d-block">Application ID</small>
                <span className="font-monospace fw-bold text-dark">{shortId}</span>
              </div>
              <div>
                <small className="text-muted d-block">Service</small>
                <span className="fw-semibold text-primary">{serviceName}</span>
              </div>
              <div>
                <small className="text-muted d-block">Status</small>
                <span className="badge bg-success">{application.status || "Document Ready"}</span>
              </div>
            </div>

            {/* Document Card Preview Container */}
            <div
              className="card border-2 border-primary shadow-sm p-4 position-relative overflow-hidden mb-3"
              style={{ backgroundColor: "#fafcff" }}
            >
              {/* Background Watermark Text Overlay */}
              <div
                className="position-absolute top-50 start-50 translate-middle text-center text-danger fw-bold opacity-25 pointer-events-none"
                style={{
                  transform: "translate(-50%, -50%) rotate(-25deg)",
                  fontSize: "22px",
                  lineHeight: "1.4",
                  letterSpacing: "1px",
                  width: "90%",
                  zIndex: 0,
                  userSelect: "none",
                }}
              >
                {getWatermarkText()}
              </div>

              {/* Document Inner Content */}
              <div className="position-relative" style={{ zIndex: 1 }}>
                {/* Header Banner */}
                <div className="border-bottom pb-3 mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="fw-bold text-primary mb-0">
                      <i className="bi bi-building me-2"></i>
                      SevaConnect e-Sevai Portal
                    </h4>
                    <small className="text-muted">Smart Common Service Center Management Platform</small>
                  </div>
                  <span className="badge bg-danger px-2 py-1 text-uppercase" style={{ fontSize: "10px" }}>
                    PROVISIONAL SLIP
                  </span>
                </div>

                {/* Banner Warning Box */}
                <div className="alert alert-warning border-warning p-2 mb-3 text-center small fw-bold text-dark">
                  <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                  {getWatermarkText()}
                </div>

                {/* Details Table */}
                <div className="row g-3 my-2">
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Citizen Full Name</small>
                    <span className="fw-bold fs-6 text-dark">{application.citizenName}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Application / System ID</small>
                    <span className="font-monospace fw-semibold">{shortId} ({application._id})</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Registered Email</small>
                    <span>{application.email}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Registered Phone</small>
                    <span>{application.phone || "N/A"}</span>
                  </div>

                  {/* Specific Demo Fields */}
                  {serviceName.toLowerCase().includes("aadhaar") && (
                    <>
                      <div className="col-sm-6">
                        <small className="text-muted d-block">Virtual ID (Demo)</small>
                        <span className="font-monospace fw-bold text-primary">
                          9876 - 5432 - {application._id.slice(-4)} - 1098
                        </span>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted d-block">Date of Birth</small>
                        <span>XX / XX / XXXX (Verified via Hospital Proof)</span>
                      </div>
                    </>
                  )}

                  {serviceName.toLowerCase().includes("pan") && (
                    <div className="col-sm-6">
                      <small className="text-muted d-block">PAN Ref Number (Demo)</small>
                      <span className="font-monospace fw-bold text-primary">
                        PAN-SC-2026-{application._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="col-sm-6">
                    <small className="text-muted d-block">Application Issue Date</small>
                    <span>{formattedDate}</span>
                  </div>
                  <div className="col-sm-6">
                    <small className="text-muted d-block">Verification Status</small>
                    <span className="text-success fw-bold">✓ Documents Accepted & Verified</span>
                  </div>
                </div>

                {/* Permanent Document Notice */}
                <div className="mt-3 p-3 bg-light rounded border text-muted small">
                  <strong className="text-dark d-block mb-1">
                    <i className="bi bi-truck me-1 text-primary"></i> Permanent Document Dispatch Status:
                  </strong>
                  {application.paymentStatus === "Paid" ? (
                    <span className="text-success fw-bold">
                      ✓ Permanent Document Dispatched to your registered delivery address on {formattedDate}.
                    </span>
                  ) : (
                    <span>
                      Temporary Document: <strong>Ready</strong> | Permanent Physical Document:{" "}
                      <strong>Will be dispatched after fee payment completion.</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Only Close Button as required by rule #2 */}
          <div className="modal-footer bg-light justify-content-end">
            <button type="button" className="btn btn-secondary px-4" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModal;
