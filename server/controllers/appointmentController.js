const { body, param, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

/**
 * Validation rules for creating an appointment.
 */
const createAppointmentValidation = [
  body('doctorId')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid Doctor ID format'),
  body('date')
    .notEmpty()
    .withMessage('Appointment date is required')
    .isISO8601()
    .withMessage('Date must be in a valid format (YYYY-MM-DD)'),
  body('timeSlot')
    .trim()
    .notEmpty()
    .withMessage('Time slot is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for appointment is required')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

/**
 * @desc    Create a new appointment (Patient books)
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
const createAppointment = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { doctorId, date, timeSlot, reason, notes } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check if the time slot is already booked
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ['pending', 'approved'] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different slot.',
      });
    }

    // Check if the patient already has an appointment at the same time
    const patientConflict = await Appointment.findOne({
      patientId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ['pending', 'approved'] },
    });

    if (patientConflict) {
      return res.status(400).json({
        success: false,
        message: 'You already have an appointment at this time slot.',
      });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      notes: notes || '',
      status: 'pending',
    });

    // Populate references before returning
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email phone',
        },
      })
      .populate({
        path: 'patientId',
        select: 'name email phone',
      });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get appointments for the logged-in user.
 *          Patients see their bookings; doctors see appointments assigned to them.
 *          Supports filtering by status.
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Filter based on user role
    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Find the doctor profile for this user
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found',
        });
      }
      filter.doctorId = doctorProfile._id;
    }

    // Filter by status if provided
    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture',
        },
      })
      .populate({
        path: 'patientId',
        select: 'name email phone profilePicture',
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalAppointments: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single appointment by ID with populated doctor and patient info
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture',
        },
      })
      .populate({
        path: 'patientId',
        select: 'name email phone profilePicture',
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Ensure the user is the patient or the doctor of this appointment
    const isPatient =
      appointment.patientId._id.toString() === req.user._id.toString();

    let isDoctor = false;
    if (appointment.doctorId && appointment.doctorId.userId) {
      isDoctor =
        appointment.doctorId.userId._id.toString() === req.user._id.toString();
    }

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment status.
 *          Doctor can approve/reject/complete. Patient can cancel.
 * @route   PATCH /api/appointments/:id
 * @access  Private
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const isPatient =
      appointment.patientId.toString() === req.user._id.toString();

    let isDoctor = false;
    if (appointment.doctorId && appointment.doctorId.userId) {
      isDoctor =
        appointment.doctorId.userId._id.toString() === req.user._id.toString();
    }

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Validate allowed status transitions
    if (isPatient) {
      // Patients can only cancel
      if (status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Patients can only cancel appointments',
        });
      }
      if (['completed', 'cancelled', 'rejected'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an appointment that is already ${appointment.status}`,
        });
      }
    }

    if (isDoctor) {
      // Doctors can approve, reject, or complete
      const allowedStatuses = ['approved', 'rejected', 'completed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Doctors can only set status to: ${allowedStatuses.join(', ')}`,
        });
      }
      if (['completed', 'cancelled'].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot update an appointment that is already ${appointment.status}`,
        });
      }
    }

    // Update status and optional notes
    appointment.status = status;
    if (notes !== undefined) {
      appointment.notes = notes;
    }

    const updatedAppointment = await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: updatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get completed / past appointments for the logged-in user
 * @route   GET /api/appointments/history
 * @access  Private
 */
const getAppointmentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = {
      status: { $in: ['completed', 'cancelled', 'rejected'] },
    };

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user._id });
      if (!doctorProfile) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found',
        });
      }
      filter.doctorId = doctorProfile._id;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const appointments = await Appointment.find(filter)
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture',
        },
      })
      .populate({
        path: 'patientId',
        select: 'name email phone profilePicture',
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalAppointments: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete (cancel) an appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private
 */
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Only the patient who booked it can delete
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this appointment',
      });
    }

    if (['completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a completed appointment',
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  createAppointmentValidation,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAppointmentHistory,
  deleteAppointment,
};
