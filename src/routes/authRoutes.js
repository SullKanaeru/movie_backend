const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerificationEmail);

// Protected routes
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/profile", authMiddleware, AuthController.getProfile);
router.put("/profile", authMiddleware, AuthController.updateProfile);

module.exports = router;
