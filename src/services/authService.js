const User = require("../models/userModel");
const EmailService = require("./emailService");
const jwt = require("jsonwebtoken");

class AuthService {
  static async register(userData) {
    const { email, username } = userData;

    console.log("🔍 Starting registration process...");

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      console.log("❌ Email already exists:", email);
      throw new Error("Email already registered");
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      console.log("❌ Username already exists:", username);
      throw new Error("Username already taken");
    }

    console.log("✅ No duplicates found, creating user...");

    // Create new user
    const user = await User.create(userData);

    console.log("✅ User created with ID:", user.id_user);

    try {
      // Generate verification token
      console.log("🔄 Generating verification token...");
      const verificationToken = await User.generateVerificationToken(
        user.id_user
      );

      console.log("✅ Verification token generated");

      // Send verification email
      console.log("📧 Sending verification email...");
      await EmailService.sendVerificationEmail(user, verificationToken);

      console.log("✅ Verification email sent");
    } catch (emailError) {
      console.error("❌ Email process failed:", emailError.message);
      // Continue even if email fails - user can request resend later
    }

    // Remove sensitive data from response
    const { password, verification_token, ...userWithoutSensitive } = user;

    console.log("🎉 Registration completed successfully");
    return userWithoutSensitive;
  }

  static async verifyEmail(token) {
    console.log("🔍 Verifying email with token...");

    const user = await User.verifyEmail(token);

    console.log("✅ Email verified for user:", user.email);

    // Remove sensitive data
    const { password, verification_token, ...userWithoutSensitive } = user;

    return userWithoutSensitive;
  }

  static async resendVerificationEmail(email) {
    console.log("🔍 Resending verification email to:", email);

    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_verified) {
      throw new Error("Email is already verified");
    }

    // Generate new verification token
    const verificationToken = await User.generateVerificationToken(
      user.id_user
    );

    // Send verification email
    await EmailService.sendVerificationEmail(user, verificationToken);

    console.log("✅ Verification email resent");

    return { message: "Verification email sent successfully" };
  }

  static async login(email, password) {
    console.log("🔍 Attempting login for:", email);

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      console.log("❌ User not found:", email);
      throw new Error("Invalid email or password");
    }

    console.log("✅ User found, verifying password...");

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password for user:", email);
      throw new Error("Invalid email or password");
    }

    // Check if user is verified
    if (!user.is_verified) {
      console.log("❌ User not verified:", email);
      throw new Error("Please verify your email first");
    }

    console.log("✅ Password valid, generating session ID...");

    // Generate session ID menggunakan JWT
    const sessionId = this.generateSessionId(user);

    // Update session ID in database
    await User.updateSessionId(user.id_user, sessionId);

    // Remove sensitive data
    const { password: pwd, verification_token, ...userWithoutPassword } = user;

    console.log("✅ Login successful for:", email);

    return {
      user: userWithoutPassword,
      sessionId: sessionId,
    };
  }

  static generateSessionId(user) {
    const payload = {
      userId: user.id_user,
      email: user.email,
      username: user.username, // Tambahkan username
      type: "session",
    };

    const sessionId = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    return sessionId;
  }

  static verifySessionId(sessionId) {
    try {
      // Verify JWT session ID
      const decoded = jwt.verify(sessionId, process.env.JWT_SECRET);

      // Cek jika ini session token
      if (decoded.type !== "session") {
        throw new Error("Invalid session token type");
      }

      return decoded;
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid session ID");
      }
      if (error.name === "TokenExpiredError") {
        throw new Error("Session expired");
      }
      throw error;
    }
  }

  static async logout(userId) {
    console.log("🔍 Logging out user:", userId);

    // Remove session ID from database
    await User.updateSessionId(userId, null);

    console.log("✅ Logout successful");
  }

  static async verifySession(sessionId) {
    console.log("🔍 Verifying session...");

    if (!sessionId) {
      throw new Error("Session ID required");
    }

    // Verify JWT session ID
    const decoded = this.verifySessionId(sessionId);

    // Find user by session ID di database
    const user = await User.findBySessionId(sessionId);
    if (!user) {
      console.log("❌ Session ID not found in database");
      throw new Error("Invalid session");
    }

    // Verify user ID matches
    if (user.id_user !== decoded.userId) {
      console.log("❌ User ID mismatch");
      throw new Error("Session user mismatch");
    }

    console.log("✅ Session verified for user:", user.email);

    // Remove sensitive data
    const { password, verification_token, ...userWithoutSensitive } = user;

    return userWithoutSensitive;
  }

  // Tambahkan method untuk refresh token (jika diperlukan)
  static async refreshToken(oldSessionId) {
    try {
      // Verify old session
      const decoded = this.verifySessionId(oldSessionId);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate new session ID
      const newSessionId = this.generateSessionId(user);

      // Update session ID in database
      await User.updateSessionId(user.id_user, newSessionId);

      return {
        sessionId: newSessionId,
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }
}

module.exports = AuthService;
