const AuthService = require("../services/authService");

const authMiddleware = async (req, res, next) => {
  try {
    // Cek header authorization untuk session ID
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Session ID required",
      });
    }

    // Format: bisa langsung session ID atau "Bearer <sessionId>"
    let sessionId = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      sessionId = authHeader.substring(7); // Remove "Bearer " prefix
    }

    // Verify session
    const user = await AuthService.verifySession(sessionId);

    // Tambahkan user data ke request object
    req.user = {
      userId: user.id_user,
      email: user.email,
      username: user.username,
    };

    console.log(`✅ Authenticated user: ${user.email}`);
    next(); // Lanjut ke controller
  } catch (error) {
    console.error("🔐 Authentication error:", error.message);

    if (
      error.message.includes("Invalid session") ||
      error.message.includes("Session expired") ||
      error.message.includes("Invalid session ID")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = {
  authMiddleware,
};
