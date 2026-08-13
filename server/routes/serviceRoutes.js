const express = require("express");
const router = express.Router();

const {
  getServices,
  createService,
  updateService,
  toggleServiceStatus,
} = require("../controllers/serviceController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Public route to view services
router.get("/", getServices);

// Admin-only management routes
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  createService
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateService
);

router.put(
  "/:id/toggle",
  authenticateToken,
  authorizeRoles("admin"),
  toggleServiceStatus
);

module.exports = router;
