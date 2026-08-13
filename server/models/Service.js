const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General Services",
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    processingTime: {
      type: String,
      default: "3-5 Days",
    },
    icon: {
      type: String,
      default: "📄",
    },
    documents: [
      {
        type: String,
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);
