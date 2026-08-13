const Application = require("../models/Application");
const { generateServiceDocument } = require("../utils/documentGenerator");

// ==========================================
// CREATE NEW APPLICATION
// ==========================================

exports.createApplication = async (req, res) => {
  console.log("Application Data:", req.body);

  try {
    const application = await Application.create(req.body);

    res.status(201).json({
      message: "Application Submitted Successfully",
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ==========================================
// GET ALL APPLICATIONS
// ==========================================

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ==========================================
// GET APPLICATIONS OF A USER
// ==========================================

exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      email: req.params.email,
    }).sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};


// ==========================================
// UPLOAD DOCUMENT
// ==========================================

exports.uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;

    // Check file
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a document.",
      });
    }

    // Check document type
    if (!documentType) {
      return res.status(400).json({
        message: "Document type is required.",
      });
    }

    // Find application
    const application = await Application.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Add document
    application.documents.push({
      documentType: documentType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      status: "Pending",
      rejectionReason: "",
    });

    // Update application status
    application.status = "Document Verification";

    await application.save();

    res.status(200).json({
      message: "Document uploaded successfully.",
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Document upload failed.",
    });
  }
};


// ==========================================
// HELPER: ARE ALL REQUIRED DOCUMENTS APPROVED?
// ==========================================

const areAllRequiredDocumentsApproved = (application) => {
  if (!application) return false;
  const unapprovedStatuses = [
    "Pending",
    "Document Verification",
    "Documents Rejected",
    "Rejected",
  ];
  if (unapprovedStatuses.includes(application.status)) return false;

  if (!application.documents || application.documents.length === 0) return false;

  const allAccepted = application.documents.every((doc) => {
    if (!doc || !doc.status) return false;
    const s = doc.status.toLowerCase();
    return s === "accepted" || s === "approved";
  });

  return allAccepted;
};

exports.areAllRequiredDocumentsApproved = areAllRequiredDocumentsApproved;

// ==========================================
// VERIFY DOCUMENT (Restricted to Operator / Admin)
// ==========================================

exports.verifyDocument = async (req, res) => {
  try {
    const targetDocId = req.body.documentId || req.params.documentId;
    const inputStatus = (req.body.status || "Accepted").toString();
    const rejectionReason = req.body.rejectionReason || "";
    const appId = req.params.id || req.params.applicationId;

    if (!targetDocId) {
      return res.status(400).json({
        message: "Document ID is required.",
      });
    }

    const application = await Application.findById(appId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const document =
      application.documents.id(targetDocId) ||
      application.documents.find(
        (d) => d._id && d._id.toString() === targetDocId.toString()
      );

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    const isApprove = !inputStatus.toLowerCase().includes("reject");
    const newStatus = isApprove ? "Accepted" : "Rejected";

    document.status = newStatus;

    if (!isApprove) {
      document.rejectionReason =
        rejectionReason || "Document rejected. Please upload a clearer document.";
    } else {
      document.rejectionReason = "";
    }

    const isDocOk = (d) =>
      d.status &&
      (d.status.toLowerCase() === "accepted" || d.status.toLowerCase() === "approved");
    const isDocRejected = (d) =>
      d.status && d.status.toLowerCase().includes("reject");

    const allAccepted =
      application.documents.length > 0 &&
      application.documents.every(isDocOk);

    const anyRejected = application.documents.some(isDocRejected);

    if (anyRejected) {
      application.status = "Documents Rejected";
      application.documentStatus = "Pending";
      application.generatedDocument = "";
    } else if (allAccepted) {
      // Set status to Approved when all documents accepted
      application.status = "Approved";
      application.documentStatus = "Generated";

      if (!application.generatedDocument) {
        const docPath = await generateServiceDocument(application);
        application.generatedDocument = docPath;
        application.documentGeneratedAt = new Date();
      }
      application.permanentDocumentStatus = "Processing";
    } else {
      application.status = "Document Verification";
      application.documentStatus = "Pending";
      application.generatedDocument = "";
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: isApprove
        ? "Document approved successfully."
        : "Document rejected successfully.",
      application,
    });
  } catch (error) {
    console.error("Document verification error:", error);

    res.status(500).json({
      message: error.message || "Document verification failed.",
    });
  }
};


// ==========================================
// UPDATE APPLICATION STATUS & REMARKS
// ==========================================

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    if (rejectionReason !== undefined) {
      application.rejectionReason = rejectionReason;
    }

    const allAccepted =
      application.documents.length > 0 &&
      application.documents.every(
        (doc) => doc.status === "Accepted"
      );

    // Strictly enforce: Document generation allowed ONLY when all accepted AND status is Approved / Document Ready
    if ((status === "Approved" || status === "Document Ready") && allAccepted) {
      application.status = "Document Ready";
      application.documentStatus = "Generated";

      if (!application.generatedDocument) {
        const docPath = await generateServiceDocument(application);
        application.generatedDocument = docPath;
        application.documentGeneratedAt = new Date();
      }

      if (!application.permanentDocumentStatus || application.permanentDocumentStatus === "Not Applicable") {
        application.permanentDocumentStatus = "Processing";
      }
    } else {
      // If status updated to Rejected or if docs not all accepted, do not allow document ready
      if (status) {
        application.status = status;
      }
      if (!allAccepted && (status === "Approved" || status === "Document Ready")) {
        return res.status(400).json({
          message: "Cannot approve application until all uploaded verification documents are accepted.",
        });
      }
    }

    await application.save();

    res.status(200).json({
      message: `Application status updated to ${application.status}`,
      application,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update application status.",
    });
  }
};


// ==========================================
// DOWNLOAD GENERATED SERVICE DOCUMENT (PDF Stream)
// ==========================================

const fs = require("fs");
const path = require("path");

exports.downloadGeneratedDocument = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Verify ownership or authority
    if (
      req.user.role === "citizen" &&
      req.user.email.toLowerCase() !== application.email.toLowerCase()
    ) {
      return res.status(403).json({
        message: "Unauthorized access to document.",
      });
    }

    // STRICT SECURITY: Reject document download if required documents are not all approved or payment is unpaid (Step 6)
    if (!areAllRequiredDocumentsApproved(application)) {
      return res.status(403).json({
        message: "Document is available only after application approval, document verification and successful payment.",
      });
    }

    if (application.paymentStatus !== "Paid" && application.status !== "Completed") {
      return res.status(403).json({
        message: "Document is available only after application approval, document verification and successful payment.",
      });
    }

    // Auto-generate if file missing
    let docRelativePath = application.generatedDocument;
    let fullFilePath = docRelativePath ? path.join(__dirname, "..", docRelativePath) : "";

    if (!docRelativePath || !fs.existsSync(fullFilePath)) {
      docRelativePath = await generateServiceDocument(application);
      application.generatedDocument = docRelativePath;
      application.documentStatus = "Generated";
      application.documentGeneratedAt = new Date();
      fullFilePath = path.join(__dirname, "..", docRelativePath);
    }

    application.documentStatus = "Downloaded";
    if (application.paymentStatus !== "Paid") {
      application.status = "Payment Pending";
    }

    await application.save();

    const shortId = application._id.toString().slice(-6).toUpperCase();
    const cleanServiceName = (application.service || "Document").replace(/[^a-zA-Z0-9]/g, "-");
    const downloadFilename = `SevaConnect-${cleanServiceName}-Provisional-${shortId}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${downloadFilename}"`);

    const fileStream = fs.createReadStream(fullFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Failed to download generated PDF document:", error);
    res.status(500).json({
      message: "Failed to download PDF document.",
    });
  }
};