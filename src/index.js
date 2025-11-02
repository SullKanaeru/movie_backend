const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const cors = require("cors");
const express = require("express");

const contentRoutes = require("./routes/contentRoutes");

const app = express();

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

app.use("/api/content", contentRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎬 Movie Database API is running!",
    timestamp: new Date().toISOString(),
    endpoints: {
      content: {
        "GET /api/content": "Get all content or search with query parameters",
        "GET /api/content/:id": "Get content by ID",
        "POST /api/content/series": "Create new series",
        "POST /api/content/movies": "Create new movie",
        "PUT /api/content/:id": "Update content",
        "DELETE /api/content/:id": "Delete content",
      },
      episodes: {
        "POST /api/content/episodes": "Create new episode",
        "GET /api/content/series/:seriesId/episodes":
          "Get episodes by series ID",
        "PUT /api/content/episodes/:id": "Update episode",
        "DELETE /api/content/episodes/:id": "Delete episode",
      },
    },
    query_parameters: {
      type: "Filter by content type: 'movie' or 'series'",
      search: "Search content by title or description",
    },
  });
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
});
