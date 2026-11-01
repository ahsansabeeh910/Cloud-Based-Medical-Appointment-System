const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  uploadPrescriptionValidation,
  getPrescriptionsByAppointment,
  downloadPrescription,
  generateDigitalPrescription,
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

/**
 * @route   POST /api/prescriptions/generate
 * @desc    Generate a digital prescription and upload to S3
 * @access  Private (Doctor only)
 */
router.post('/generate', protect, authorize('doctor'), generateDigitalPrescription);

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
