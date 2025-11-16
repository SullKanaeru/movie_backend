const express = require("express");
const router = express.Router();
const upload = require("../services/uploadService");
const { authMiddleware } = require("../middleware/authMiddleware");

// Endpoint untuk upload single file (protected)
router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Tidak ada file yang diunggah",
      });
    }

    // Informasi file yang berhasil diupload
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
    };

    res.status(200).json({
      success: true,
      message: "File berhasil diunggah",
      data: fileInfo,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat mengunggah file",
      message: error.message,
    });
  }
});

// Endpoint untuk upload multiple files (protected)
router.post(
  "/upload-multiple",
  authMiddleware,
  upload.array("images", 5),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Tidak ada file yang diunggah",
        });
      }

      const filesInfo = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
        url: `/uploads/${file.filename}`,
      }));

      res.status(200).json({
        success: true,
        message: `${req.files.length} file berhasil diunggah`,
        data: filesInfo,
      });
    } catch (error) {
      console.error("Upload multiple error:", error);
      res.status(500).json({
        success: false,
        error: "Terjadi kesalahan saat mengunggah file",
        message: error.message,
      });
    }
  }
);

// Endpoint untuk menghapus file (protected)
router.delete("/upload/:filename", authMiddleware, (req, res) => {
  try {
    const fs = require("fs");
    const path = require("path");

    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename);

    // Cek apakah file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File tidak ditemukan",
      });
    }

    // Hapus file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      error: "Terjadi kesalahan saat menghapus file",
      message: error.message,
    });
  }
});

module.exports = router;
