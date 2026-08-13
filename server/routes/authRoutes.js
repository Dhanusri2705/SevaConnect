const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getUsers,
  getProfile,
  changePassword,
  updateUserRole,
} = require("../controllers/authController");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/register", register);

router.post("/login", login);

router.get("/users", getUsers);

router.get("/profile", authenticateToken, getProfile);

router.put("/change-password", authenticateToken, changePassword);

// Update user role (Admin only)
router.put(
  "/users/:id/role",
  authenticateToken,
  authorizeRoles("admin"),
  updateUserRole
);

module.exports = router;