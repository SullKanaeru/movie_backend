const AuthService = require("../services/authService");
const User = require("../models/userModel");

class AuthController {
  static async register(req, res) {
    try {
      const { fullname, username, email, password } = req.body;

      // Validation
      if (!fullname || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are required: fullname, username, email, password",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      const user = await AuthService.register({
        fullname,
        username,
        email,
        password,
      });

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email for verification.",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async logout(req, res) {
    try {
      const userId = req.user.userId;

      await AuthService.logout(userId);

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
      }

      const user = await AuthService.verifyEmail(token);

      res.json({
        success: true,
        message: "Email verified successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const result = await AuthService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: "Verification email sent successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove sensitive data
      const { password, verification_token, ...userProfile } = user;

      res.json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get profile",
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { fullname, username } = req.body;

      // Validation
      if (!fullname && !username) {
        return res.status(400).json({
          success: false,
          message: "At least one field is required: fullname or username",
        });
      }

      const updateData = {};
      if (fullname) updateData.fullname = fullname;
      if (username) {
        // Check if username already taken by other user
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id_user !== userId) {
          return res.status(400).json({
            success: false,
            message: "Username already taken",
          });
        }
        updateData.username = username;
      }

      await User.updateProfile(userId, updateData);

      const updatedUser = await User.findById(userId);
      const { password, verification_token, ...userProfile } = updatedUser;

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: "Session ID is required",
        });
      }

      const result = await AuthService.refreshToken(sessionId);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AuthController;
