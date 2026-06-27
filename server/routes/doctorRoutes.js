const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
  updateDoctorProfile,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors with optional filters and pagination
 * @access  Public
 */
router.get('/', getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get a single doctor by ID
 * @access  Public
 */
router.get('/:id', getDoctorById);

/**
 * @route   GET /api/doctors/:id/slots
 * @desc    Get available slots for a doctor on a given date
 * @access  Public
 */
router.get('/:id/slots', getAvailableSlots);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor-specific profile fields
 * @access  Private (Doctor only)
 */
router.put('/:id', protect, authorize('doctor'), updateDoctorProfile);

module.exports = router;
