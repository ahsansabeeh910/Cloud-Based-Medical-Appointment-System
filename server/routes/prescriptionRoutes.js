const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  uploadPrescriptionValidation,
  getPrescriptionsByAppointment,
  downloadPrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

/**
 * @route   POST /api/prescriptions
 * @desc    Upload a prescription file for an appointment
 * @access  Private (Doctor only)
 */
router.post(
  '/',
  protect,
  authorize('doctor'),
  upload.single('file'),
  uploadPrescriptionValidation,
  uploadPrescription
);

/**
 * @route   GET /api/prescriptions/appointment/:id
 * @desc    Get all prescriptions for a specific appointment
 * @access  Private
 */
router.get('/appointment/:id', protect, getPrescriptionsByAppointment);

/**
 * @route   GET /api/prescriptions/:id/download
 * @desc    Download a prescription (get pre-signed S3 URL)
 * @access  Private
 */
router.get('/:id/download', protect, downloadPrescription);

module.exports = router;
