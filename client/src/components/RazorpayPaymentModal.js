import React, { useState, useEffect } from "react";
import axios from "axios";

// Static Demo QR Image Data URL (Preserves aspect ratio, fits container, white background, zero blank boxes)
const DEMO_STATIC_QR_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="220" height="220"><rect width="256" height="256" fill="%23ffffff"/><rect x="6" y="6" width="244" height="244" fill="none" stroke="%23e0e0e0" stroke-width="2" rx="16"/><rect x="16" y="16" width="64" height="64" fill="%23000000" rx="8"/><rect x="26" y="26" width="44" height="44" fill="%23ffffff" rx="4"/><rect x="34" y="34" width="28" height="28" fill="%23000000" rx="2"/><rect x="176" y="16" width="64" height="64" fill="%23000000" rx="8"/><rect x="186" y="26" width="44" height="44" fill="%23ffffff" rx="4"/><rect x="194" y="34" width="28" height="28" fill="%23000000" rx="2"/><rect x="16" y="176" width="64" height="64" fill="%23000000" rx="8"/><rect x="26" y="186" width="44" height="44" fill="%23ffffff" rx="4"/><rect x="34" y="194" width="28" height="28" fill="%23000000" rx="2"/><rect x="92" y="16" width="12" height="12" fill="%23000000"/><rect x="116" y="16" width="12" height="12" fill="%23000000"/><rect x="140" y="16" width="12" height="12" fill="%23000000"/><rect x="92" y="32" width="12" height="12" fill="%23000000"/><rect x="128" y="32" width="12" height="12" fill="%23000000"/><rect x="152" y="32" width="12" height="12" fill="%23000000"/><rect x="104" y="48" width="12" height="12" fill="%23000000"/><rect x="140" y="48" width="12" height="12" fill="%23000000"/><rect x="16" y="92" width="12" height="12" fill="%23000000"/><rect x="40" y="92" width="12" height="12" fill="%23000000"/><rect x="64" y="92" width="12" height="12" fill="%23000000"/><rect x="176" y="92" width="12" height="12" fill="%23000000"/><rect x="200" y="92" width="12" height="12" fill="%23000000"/><rect x="228" y="92" width="12" height="12" fill="%23000000"/><rect x="28" y="108" width="12" height="12" fill="%23000000"/><rect x="52" y="108" width="12" height="12" fill="%23000000"/><rect x="188" y="108" width="12" height="12" fill="%23000000"/><rect x="216" y="108" width="12" height="12" fill="%23000000"/><circle cx="128" cy="128" r="34" fill="%23ffffff" stroke="%23d5d5d5" stroke-width="2"/><path d="M 112 124 C 112 118, 120 114, 128 114 C 134 114, 140 117, 144 122 L 138 127 C 135 124, 132 122, 128 122 C 122 122, 118 125, 118 129 C 118 133, 122 136, 129 137 C 137 139, 144 142, 144 149 C 144 156, 137 160, 128 160 C 120 160, 113 156, 109 149 L 115 144 C 118 149, 123 152, 128 152 C 138 152, 138 149, 138 145 C 138 141, 133 139, 126 137 C 117 135, 112 131, 112 124 Z" fill="%234285F4"/><circle cx="124" cy="120" r="5" fill="%23EA4335"/><circle cx="132" cy="136" r="5" fill="%23FBBC05"/><circle cx="122" cy="136" r="5" fill="%2334A853"/><rect x="16" y="148" width="12" height="12" fill="%23000000"/><rect x="40" y="148" width="12" height="12" fill="%23000000"/><rect x="176" y="148" width="12" height="12" fill="%23000000"/><rect x="200" y="148" width="12" height="12" fill="%23000000"/><rect x="228" y="148" width="12" height="12" fill="%23000000"/><rect x="92" y="176" width="12" height="12" fill="%23000000"/><rect x="116" y="176" width="12" height="12" fill="%23000000"/><rect x="140" y="176" width="12" height="12" fill="%23000000"/><rect x="104" y="192" width="12" height="12" fill="%23000000"/><rect x="128" y="192" width="12" height="12" fill="%23000000"/><rect x="152" y="192" width="12" height="12" fill="%23000000"/><rect x="184" y="184" width="36" height="36" fill="%23000000" rx="4"/><rect x="192" y="192" width="20" height="20" fill="%23ffffff" rx="2"/><rect x="198" y="198" width="8" height="8" fill="%23000000"/></svg>`;

function RazorpayPaymentModal({ show, onClose, application, onPaymentSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    if (show && application) {
      setSubmittedSuccess(false);
      setErrorMsg(null);

      if (
        application.paymentStatus === "Verification Pending" ||
        application.status === "Payment Verification Pending"
      ) {
        setSubmittedSuccess(true);
      }
    }
  }, [show, application]);

  if (!show || !application) return null;

  // Citizen Submits Payment For Verification (Clicks "I've Completed Payment")
  const handleSubmitVerification = async () => {
    const appIdStr = application._id ? application._id.toString() : application.id || "";

    setSubmitting(true);
    setErrorMsg(null);

    try {
      console.log("Submitting QR Payment Verification for Application:", appIdStr);

      const res = await axios.post(
        "http://localhost:5000/api/payment/submit-verification",
        { applicationId: appIdStr },
        authConfig
      );

      console.log("SUBMIT VERIFICATION RESPONSE:", res.data);
      setSubmittedSuccess(true);
      const updatedApp = res.data.application || application;

      if (onPaymentSubmitted) {
        onPaymentSubmitted(updatedApp);
      }
    } catch (err) {
      console.error("Error submitting payment for verification:", err);
      const msg = err.response?.data?.message;
      setErrorMsg(msg || "Failed to submit payment for verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const shortId = `#${application._id.toString().slice(-6).toUpperCase()}`;
  const feeAmount = application.payment?.amount || 100;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-credit-card-2-front-fill me-2"></i>
              SERVICE FEE PAYMENT
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
              disabled={submitting}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {errorMsg && (
              <div className="alert alert-danger mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errorMsg}
              </div>
            )}

            {/* CASE A: PAYMENT SUBMITTED FOR VERIFICATION */}
            {submittedSuccess ? (
              <div className="text-center py-3">
                <div className="mb-3">
                  <div
                    className="rounded-circle bg-warning text-dark d-inline-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: "70px", height: "70px", fontSize: "36px" }}
                  >
                    <i className="bi bi-clock-history"></i>
                  </div>
                </div>

                <h4 className="fw-bold text-success mb-2">✓ PAYMENT SUBMITTED</h4>
                <p className="text-dark small mb-3">
                  Your payment has been submitted for verification.
                </p>

                <div className="card bg-light border-0 p-3 text-start mb-3">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="text-muted d-block">Application ID</span>
                      <strong className="font-monospace text-dark">{shortId}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Service Amount</span>
                      <strong className="text-success fs-6">₹{feeAmount}</strong>
                    </div>
                    <div className="col-12 mt-2">
                      <span className="text-muted d-block">Payment Status</span>
                      <span className="badge bg-warning text-dark px-2 py-1 fs-6">
                        Payment Verification Pending
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-muted small mb-4">
                  Please wait for the service operator to confirm your payment.
                </p>

                <div className="d-grid">
                  <button className="btn btn-secondary py-2 fw-bold" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* CASE B: INITIAL QR PAYMENT DISPLAY SCREEN */
              <div>
                {/* Summary Card */}
                <div className="card bg-light border-0 p-3 mb-3">
                  <div className="row g-2 small">
                    <div className="col-6">
                      <span className="text-muted d-block">Application ID</span>
                      <strong className="font-monospace text-dark">{shortId}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-muted d-block">Service</span>
                      <span className="fw-semibold text-primary">{application.service}</span>
                    </div>
                    <div className="col-12 border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                      <span className="fw-semibold text-muted">Required Service Fee:</span>
                      <strong className="text-success fs-5">₹{feeAmount}</strong>
                    </div>
                  </div>
                </div>

                {/* EXACT STATIC DEMO QR CODE IMAGE DISPLAY */}
                <div className="text-center p-3 border rounded bg-white mb-3 shadow-sm">
                  <span className="badge bg-danger text-uppercase mb-2 px-3 py-1" style={{ fontSize: "10px" }}>
                    DEMO / TEST PAYMENT QR
                  </span>

                  <div className="my-2 d-flex justify-content-center align-items-center">
                    <img
                      src="/assets/payment-qr.png"
                      alt="SevaConnect Payment QR"
                      className="img-fluid rounded border p-2 bg-white shadow-sm"
                      style={{ width: "220px", height: "220px", objectFit: "contain", backgroundColor: "#ffffff" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEMO_STATIC_QR_IMAGE;
                      }}
                    />
                  </div>

                  <small className="text-muted d-block fw-semibold mt-1">
                    Scan using your supported payment application.
                  </small>

                  <div className="mt-2 text-muted small fw-semibold">
                    Payment Status: <span className="text-warning text-dark fw-bold">Waiting for Payment</span>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-success py-2 fs-6 fw-bold"
                    onClick={handleSubmitVerification}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting Payment...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        ✓ I've Completed Payment
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RazorpayPaymentModal;
