const mongoose = require("mongoose");
const Application = require("../models/Application");
const Service = require("../models/Service");
const Payment = require("../models/Payment");
const { areAllRequiredDocumentsApproved } = require("./applicationController");
const { generateReceiptPdf } = require("../utils/receiptGenerator");

// Robust Application Lookup Helper (Handles 24-char ObjectId AND short display IDs like #FB6358)
const findApplicationByIdOrQuery = async (applicationId) => {
  if (!applicationId) return null;

  const cleanId = applicationId.toString().replace("#", "").trim();

  // 1. Check if valid 24-hex ObjectId
  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    const app = await Application.findById(cleanId);
    if (app) return app;
  }

  // 2. Fallback search by suffix match on _id
  const allApps = await Application.find();
  const matched = allApps.find(
    (a) =>
      a._id.toString().toUpperCase().endsWith(cleanId.toUpperCase()) ||
      a._id.toString().toLowerCase() === cleanId.toLowerCase()
  );

  return matched || null;
};

// 1. CITIZEN: SUBMIT PAYMENT FOR VERIFICATION (POST /api/payment/submit-verification)
exports.submitPaymentVerification = async (req, res) => {
  console.log("====================================");
  console.log("SUBMIT PAYMENT VERIFICATION HIT");
  console.log("Request Body:", req.body);
  console.log("Authenticated User Email:", req.user?.email);
  console.log("====================================");

  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    const application = await findApplicationByIdOrQuery(applicationId);
    if (!application) {
      return res.status(404).json({ message: `Application '${applicationId}' not found in database.` });
    }

    // Verify ownership
    if (
      req.user.role === "citizen" &&
      req.user.email.toLowerCase() !== application.email.toLowerCase()
    ) {
      return res.status(403).json({ message: "Unauthorized access to this application." });
    }

    // Security check: Document approval required
    if (!areAllRequiredDocumentsApproved(application)) {
      return res.status(403).json({
        message: "Payment is not available until all required uploaded documents have been verified and accepted by the operator.",
      });
    }

    // Dynamic service fee lookup
    let feeRupees = 100;
    const dbService = await Service.findOne({
      name: new RegExp(`^${application.service}$`, "i"),
    });

    if (dbService && dbService.fee !== undefined) {
      feeRupees = dbService.fee;
    } else {
      const lower = (application.service || "").toLowerCase();
      if (lower.includes("passport") || lower.includes("driving")) feeRupees = 150;
      else if (lower.includes("scheme")) feeRupees = 50;
      else feeRupees = 100;
    }

    const submittedAt = new Date();

    let payment = await Payment.findOne({ application: application._id });
    if (!payment) {
      payment = await Payment.create({
        application: application._id,
        citizen: application.email,
        service: application.service,
        amount: feeRupees,
        currency: "INR",
        paymentMethod: "UPI / QR",
        status: "Verification Pending",
        submittedAt: submittedAt,
      });
    } else {
      payment.status = "Verification Pending";
      payment.submittedAt = submittedAt;
      payment.amount = feeRupees;
      payment.paymentMethod = "UPI / QR";
      await payment.save();
    }

    application.paymentStatus = "Verification Pending";
    application.status = "Payment Verification Pending";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Payment submitted for verification",
      paymentStatus: "VERIFICATION_PENDING",
      application: application,
    });
  } catch (error) {
    console.error("Error submitting payment verification:", error);
    res.status(500).json({ message: error.message || "Failed to submit payment verification." });
  }
};

// 2. OPERATOR: GET PENDING PAYMENT VERIFICATIONS (GET /api/payment/pending-verifications)
exports.getPendingPaymentVerifications = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({
      status: "Verification Pending",
    }).populate("application");

    res.status(200).json(pendingPayments);
  } catch (error) {
    console.error("Error fetching pending payment verifications:", error);
    res.status(500).json({ message: "Failed to fetch pending payments." });
  }
};

// 3. OPERATOR: CONFIRM PAYMENT (POST /api/payment/operator-confirm)
exports.confirmOperatorPayment = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    const application = await findApplicationByIdOrQuery(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    let payment = await Payment.findOne({ application: application._id });
    const paidAt = new Date();
    const dateStr = paidAt.toISOString().slice(0, 10).replace(/-/g, "");
    const shortId = application._id.toString().slice(-4).toUpperCase();
    const receiptNum = `SC-${dateStr}-${shortId}`;

    if (!payment) {
      payment = await Payment.create({
        application: application._id,
        citizen: application.email,
        service: application.service,
        amount: application.payment?.amount || 100,
        currency: "INR",
        paymentMethod: "UPI / QR",
        status: "Paid",
        receiptNumber: receiptNum,
        confirmedAt: paidAt,
        paymentDate: paidAt,
        confirmedBy: req.user.name || req.user.email,
      });
    } else {
      payment.status = "Paid";
      payment.receiptNumber = receiptNum;
      payment.confirmedAt = paidAt;
      payment.paymentDate = paidAt;
      payment.confirmedBy = req.user.name || req.user.email;
      await payment.save();
    }

    application.paymentStatus = "Paid";
    application.status = "Completed";
    application.payment = {
      amount: payment.amount,
      receiptNumber: receiptNum,
      paidAt: paidAt,
    };
    application.permanentDocumentStatus = "Dispatched";
    application.dispatchDate = paidAt;
    application.deliveryAddress = `${application.citizenName}, ${application.phone || "Registered Contact"}, Registered Delivery Address, India`;

    await application.save();

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      receiptNumber: receiptNum,
      application: application,
    });
  } catch (error) {
    console.error("Error confirming operator payment:", error);
    res.status(500).json({ message: "Failed to confirm payment." });
  }
};

// 4. OPERATOR: REJECT PAYMENT (POST /api/payment/operator-reject)
exports.rejectOperatorPayment = async (req, res) => {
  try {
    const { applicationId, rejectionReason } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    const application = await findApplicationByIdOrQuery(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    const reason = rejectionReason || "Payment could not be verified.";

    let payment = await Payment.findOne({ application: application._id });
    if (payment) {
      payment.status = "Rejected";
      payment.rejectionReason = reason;
      payment.rejectedAt = new Date();
      await payment.save();
    }

    application.paymentStatus = "Rejected";
    application.status = "Payment Rejected";
    application.rejectionReason = reason;
    await application.save();

    res.status(200).json({
      success: true,
      message: "Payment verification rejected",
      application: application,
    });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: "Failed to reject payment verification." });
  }
};

// 5. DOWNLOAD PAYMENT RECEIPT PDF
exports.downloadPaymentReceipt = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const application = await findApplicationByIdOrQuery(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Verify ownership or authority
    if (
      req.user.role === "citizen" &&
      req.user.email.toLowerCase() !== application.email.toLowerCase()
    ) {
      return res.status(403).json({ message: "Unauthorized access to receipt." });
    }

    const payment = await Payment.findOne({ application: application._id });
    const paidAtStr = application.payment?.paidAt
      ? new Date(application.payment.paidAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const shortId = application._id.toString().slice(-6).toUpperCase();
    const receiptNum =
      payment?.receiptNumber || application.payment?.receiptNumber || `SC-2026-${shortId}`;

    const pdfBuffer = generateReceiptPdf({
      receiptNumber: receiptNum,
      applicationId: application._id,
      citizenName: application.citizenName,
      service: application.service,
      amount: payment?.amount || application.payment?.amount || 100,
      paymentDate: paidAtStr,
      paymentId: payment?._id ? `PAY-${payment._id.toString().slice(-6).toUpperCase()}` : `PAY-SC-${shortId}`,
      orderId: `ORDER-SC-${shortId}`,
      permanentStatus: application.permanentDocumentStatus || "DISPATCHED",
      confirmedBy: payment?.confirmedBy || "SevaConnect Service Officer",
    });

    const filename = `SevaConnect-Payment-Receipt-${shortId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading payment receipt:", error);
    res.status(500).json({ message: "Failed to download payment receipt PDF." });
  }
};

// Aliases for compatibility
exports.processDemoPayment = exports.submitPaymentVerification;
exports.createRazorpayOrder = exports.submitPaymentVerification;
exports.qrConfirmPayment = exports.submitPaymentVerification;
exports.demoConfirmPayment = exports.submitPaymentVerification;
exports.verifyPayment = exports.confirmOperatorPayment;
exports.verifyRazorpayPayment = exports.confirmOperatorPayment;
