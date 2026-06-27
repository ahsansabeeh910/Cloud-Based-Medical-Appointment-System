const express = require('express');
const router = express.Router();
const {
  createAppointment,
  createAppointmentValidation,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAppointmentHistory,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment (Patient books)
 * @access  Private (Patient only)
 */
router.post(
  '/',
  protect,
  authorize('patient'),
  createAppointmentValidation,
  createAppointment
);

/**
 * @route   GET /api/appointments
 * @desc    Get appointments for the logged-in user
 * @access  Private
 */
router.get('/', protect, getAppointments);

/**
 * @route   GET /api/appointments/history
 * @desc    Get completed/past appointments for the logged-in user
 * @access  Private
 */
router.get('/history', protect, getAppointmentHistory);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get a single appointment by ID
 * @access  Private
 */
router.get('/:id', protect, getAppointmentById);

/**
 * @route   PATCH /api/appointments/:id
 * @desc    Update appointment status (approve/reject/cancel/complete)
 * @access  Private
 */
router.patch('/:id', protect, updateAppointmentStatus);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel / delete an appointment
 * @access  Private
 */
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
