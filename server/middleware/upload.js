const multer = require('multer');

/**
 * Allowed MIME types for file uploads.
 * Supports images (JPEG, PNG, GIF, WebP) and PDF documents.
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

/**
 * Maximum file size: 10 MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Multer configuration using memory storage.
 * Files are stored in memory as Buffer objects so they can be
 * uploaded to S3 in the controller layer.
 */
const storage = multer.memoryStorage();

/**
 * File filter to restrict uploads to allowed types.
 * @param {import('express').Request} req
 * @param {Express.Multer.File} file
 * @param {multer.FileFilterCallback} cb
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, GIF, WebP, PDF.`
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

/**
 * Configured multer instance.
 * - Uses memory storage (for S3 upload in controllers)
 * - Filters for images and PDFs only
 * - Max file size: 10 MB
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = upload;
