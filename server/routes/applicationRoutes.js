const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const {
  createApplication,
  getApplications,
  getUserApplications,
  uploadDocument,
  verifyDocument,
  updateApplicationStatus,
  downloadGeneratedDocument,
} = require("../controllers/applicationController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");


// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});


// ==========================================
// FILE TYPE VALIDATION
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and PDF files are allowed."
      ),
      false
    );
  }
};


// ==========================================
// MULTER CONFIGURATION
// ==========================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// ==========================================
// APPLICATION ROUTES
// ==========================================


// Create new application
router.post(
  "/",
  createApplication
);


// Get all applications
router.get(
  "/",
  getApplications
);


// Get applications of a particular citizen
router.get(
  "/user/:email",
  getUserApplications
);


// Upload document
router.post(
  "/:id/documents",
  upload.single("document"),
  uploadDocument
);


// Accept / Reject document (Restricted to Operator and Admin)
router.put(
  "/:id/documents/verify",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  verifyDocument
);

router.post(
  "/:id/documents/verify",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  verifyDocument
);

router.put(
  "/:id/documents/:documentId/approve",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  verifyDocument
);

router.post(
  "/:id/documents/:documentId/approve",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  verifyDocument
);


// Update application status & remarks (Restricted to Operator and Admin)
router.put(
  "/:id/status",
  authenticateToken,
  authorizeRoles("operator", "admin"),
  updateApplicationStatus
);


// Download generated document (Protected - POST & GET)
router.post(
  "/:id/download-document",
  authenticateToken,
  downloadGeneratedDocument
);

router.get(
  "/:id/document/download",
  authenticateToken,
  downloadGeneratedDocument
);

router.get(
  "/:id/document/stream",
  authenticateToken,
  downloadGeneratedDocument
);


module.exports = router;