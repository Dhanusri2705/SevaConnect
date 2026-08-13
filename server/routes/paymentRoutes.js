const express = require("express");
const router = express.Router();

const {
  submitPaymentVerification,
  getPendingPaymentVerifications,
  confirmOperatorPayment,
  rejectOperatorPayment,
  downloadPaymentReceipt,
} = require("../controllers/paymentController");

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Citizen Payment Submission Endpoints
router.post("/submit-verification", authenticateToken, submitPaymentVerification);
router.post("/qr-confirm", authenticateToken, submitPaymentVerification);
router.post("/demo-confirm", authenticateToken, submitPaymentVerification);
router.post("/demo", authenticateToken, submitPaymentVerification);
router.post("/create-order", authenticateToken, submitPaymentVerification);

// Operator / Admin Payment Management Endpoints
router.get(
  "/pending-verifications",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  getPendingPaymentVerifications
);

router.post(
  "/operator-confirm",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  confirmOperatorPayment
);

router.post(
  "/verify",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  confirmOperatorPayment
);

router.post(
  "/operator-reject",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  rejectOperatorPayment
);

// Payment Receipt Download Endpoints
router.get("/:applicationId/receipt", authenticateToken, downloadPaymentReceipt);
router.get("/:applicationId/receipt/download", authenticateToken, downloadPaymentReceipt);

module.exports = router;
