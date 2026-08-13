const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    citizenName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    service: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // Uploaded documents
    documents: [
      {
        documentType: {
          type: String,
          required: true,
        },

        fileName: {
          type: String,
          required: true,
        },

        filePath: {
          type: String,
          required: true,
        },

        status: {
          type: String,
          default: "Pending",
        },

        rejectionReason: {
          type: String,
          default: "",
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Kept for compatibility with old applications
    document: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    certificate: {
      type: String,
      default: "",
    },

    // Post-approval document & payment workflow fields
    documentStatus: {
      type: String,
      default: "Pending", // Pending, Generated, Downloaded
    },

    generatedDocument: {
      type: String,
      default: "",
    },

    documentGeneratedAt: {
      type: Date,
    },

    paymentStatus: {
      type: String,
      default: "Pending", // Pending, Paid, Failed
    },

    payment: {
      amount: { type: Number, default: 0 },
      orderId: { type: String, default: "" },
      paymentId: { type: String, default: "" },
      paidAt: { type: Date },
    },

    permanentDocumentStatus: {
      type: String,
      default: "Not Applicable", // Not Applicable, Processing, Dispatched
    },

    dispatchDate: {
      type: Date,
    },

    deliveryAddress: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Application",
  applicationSchema
);