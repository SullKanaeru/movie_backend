const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const cors = require("cors");
const express = require("express");
const fs = require("fs");
const multer = require("multer"); // Tambahkan ini untuk error handling

const contentRoutes = require("./routes/contentRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// Buat folder uploads jika belum exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Folder uploads created");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const whitelistOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (whitelistOrigins.indexOf(origin) === -1) {
        return callback(new Error("Not allowed by CORS"), false);
      }

      callback(null, true);
    },
    credentials: true,
  })
);

// Serve static files dari folder uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api", uploadRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎬 Movie Database API is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "POST /api/auth/logout": "Logout user (protected)",
      },
      content: {
        "GET /api/content": "Get all content or search with query parameters",
        "GET /api/content/:id": "Get content by ID",
        "POST /api/content/series": "Create new series (protected)",
        "POST /api/content/movies": "Create new movie (protected)",
        "PUT /api/content/:id": "Update content (protected)",
        "DELETE /api/content/:id": "Delete content (protected)",
      },
      episodes: {
        "POST /api/content/episodes": "Create new episode (protected)",
        "GET /api/content/series/:seriesId/episodes":
          "Get episodes by series ID",
        "PUT /api/content/episodes/:id": "Update episode (protected)",
        "DELETE /api/content/episodes/:id": "Delete episode (protected)",
      },
      upload: {
        "POST /api/upload": "Upload single image (protected)",
        "POST /api/upload-multiple": "Upload multiple images (protected)",
        "DELETE /api/upload/:filename": "Delete uploaded file (protected)",
      },
    },
    query_parameters: {
      type: "Filter by content type: 'movie' or 'series'",
      search: "Search content by title or description",
    },
    note: "Endpoints marked as 'protected' require Authorization header with Bearer token",
  });
});

// Error handling untuk Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File terlalu besar. Maksimal 5MB",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Terlalu banyak file. Maksimal 5 file",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error:
          'Field name tidak sesuai. Gunakan "image" untuk single upload atau "images" untuk multiple upload',
      });
    }
  }

  // Handle custom error dari fileFilter
  if (err.message && err.message.includes("Hanya file gambar yang diizinkan")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  next(err);
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err.stack);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: "CORS policy violation - Origin not allowed",
    });
  }

  // Database errors
  if (err.code === "ER_NO_SUCH_TABLE") {
    return res.status(500).json({
      success: false,
      error: "Database table not found. Please run migrations first.",
    });
  }

  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    return res.status(500).json({
      success: false,
      error: "Database access denied. Check your credentials.",
    });
  }

  if (err.code === "ER_BAD_DB_ERROR") {
    return res.status(500).json({
      success: false,
      error: "Database not found. Please create the database first.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.details,
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎬 Movie Database Server started successfully!`);
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔐 Authentication: Enabled`);
  console.log(`📁 Upload folder: ${uploadsDir}`);
});
