import React, { useState } from "react";
import { API_BASE_URL } from "../services/api";

function PaymentReceiptModal({ show, onClose, application }) {
  const [downloading, setDownloading] = useState(false);

  if (!show || !application) return null;

  const shortId = `#${application._id.toString().slice(-6).toUpperCase()}`;
  const receiptNum =
    application.payment?.receiptNumber || `SC-2026-${shortId.replace("#", "")}`;
  const paymentId = application.payment?.paymentId || `pay_sc_${application._id.slice(-8)}`;
  const orderId = application.payment?.orderId || `order_sc_${application._id.slice(-8)}`;
  const amount = application.payment?.amount || 100;
  const paidDateStr = application.payment?.paidAt
    ? new Date(application.payment.paidAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const token = localStorage.getItem("token");

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      // Trigger download using fetch buffer or auth bearer window link
      fetch(`${API_BASE_URL}/api/payment/${application._id}/receipt/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `SevaConnect-Payment-Receipt-${shortId.replace("#", "")}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        })
        .catch((err) => {
          console.error("Error downloading receipt PDF:", err);
          alert("Failed to download PDF receipt.");
        })
        .finally(() => setDownloading(false));
    } catch (e) {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-3">
          {/* Header */}
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-receipt me-2"></i>
              Official Payment Receipt
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 PrintableArea">
            <div className="text-center pb-3 mb-3 border-bottom">
              <h4 className="fw-bold text-success mb-1">
                <i className="bi bi-check-circle-fill me-2"></i> PAID
              </h4>
              <h5 className="fw-bold text-dark mb-0">SevaConnect e-Sevai Portal</h5>
              <small className="text-muted">Smart Common Service Center Management System</small>
            </div>

            {/* Receipt Table Details */}
            <div className="card border-0 bg-light p-3 mb-3">
              <div className="row g-2 small">
                <div className="col-6">
                  <span className="text-muted d-block">Receipt Number</span>
                  <strong className="font-monospace text-dark">{receiptNum}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Application ID</span>
                  <strong className="font-monospace text-primary">{shortId}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Citizen Name</span>
                  <strong className="text-dark">{application.citizenName}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Service Requested</span>
                  <span className="fw-semibold text-primary">{application.service}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Payment Date</span>
                  <span>{paidDateStr}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block">Amount Paid</span>
                  <strong className="text-success fs-6">₹{amount}</strong>
                </div>
                <div className="col-12 border-top pt-2 mt-2">
                  <span className="text-muted d-block">Transaction ID</span>
                  <small className="font-monospace text-dark d-block">{paymentId}</small>
                  <small className="font-monospace text-muted d-block">Order ID: {orderId}</small>
                </div>
              </div>
            </div>

            {/* Dispatch Status Card */}
            <div className="p-3 bg-white border rounded small">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-dark">Permanent Document Dispatch Status</strong>
                <span className="badge bg-success">DISPATCHED ✓</span>
              </div>
              <small className="text-muted d-block">
                Physical certificate copy dispatched to registered address.
              </small>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-light justify-content-between">
            <button type="button" className="btn btn-secondary px-3" onClick={onClose}>
              Close
            </button>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={handlePrint}
              >
                <i className="bi bi-printer me-1"></i> Print
              </button>
              <button
                type="button"
                className="btn btn-success px-3 fw-semibold"
                onClick={handleDownloadPdf}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-pdf me-1"></i> Download Receipt PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReceiptModal;
