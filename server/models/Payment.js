const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    citizen: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      default: "UPI / QR",
    },
    status: {
      type: String,
      enum: ["Pending", "Verification Pending", "QR Confirmed", "Paid", "Rejected", "Failed"],
      default: "Pending",
    },
    submittedAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    confirmedBy: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    receiptNumber: {
      type: String,
      default: "",
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
