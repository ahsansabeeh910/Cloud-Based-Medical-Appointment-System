const { param, query, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

/**
 * @desc    Get all doctors with optional filters, search, and pagination
 * @route   GET /api/doctors
 * @access  Public
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const {
      specialization,
      experience,
      search,
      page = 1,
      limit = 10,
      sortBy = 'rating',
      order = 'desc',
    } = req.query;

    // Build filter query
    const filter = {};

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    if (experience) {
      filter.experience = { $gte: parseInt(experience, 10) };
    }

    // Build the aggregation / query
    let doctorQuery = Doctor.find(filter).populate({
      path: 'userId',
      select: 'name email phone profilePicture',
    });

    // If searching by name, we need to filter after populate
    // So we'll use a different approach
    if (search) {
      // First find users matching the search term
      const User = require('../models/User');
      const matchingUsers = await User.find({
        name: { $regex: search, $options: 'i' },
        role: 'doctor',
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      filter.userId = { $in: userIds };

      // Rebuild query with updated filter
      doctorQuery = Doctor.find(filter).populate({
        path: 'userId',
        select: 'name email phone profilePicture',
      });
    }

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    doctorQuery = doctorQuery.sort(sortOptions);

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    doctorQuery = doctorQuery.skip(skip).limit(limitNum);

    // Execute query
    const doctors = await doctorQuery;

    // Get total count for pagination metadata
    const total = await Doctor.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalDoctors: total,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single doctor by ID with user info
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'userId',
      select: 'name email phone profilePicture',
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get available slots for a doctor on a given date.
 *          Compares the doctor's weekly schedule against existing appointments.
 * @route   GET /api/doctors/:id/slots
 * @access  Public
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date query parameter (YYYY-MM-DD)',
      });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Determine the day of the week for the requested date
    const requestedDate = new Date(date);
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayName = days[requestedDate.getUTCDay()];

    // Get doctor's schedule for that day
    const daySlots = doctor.availableSlots.filter(
      (slot) => slot.day === dayName
    );

    if (daySlots.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          date,
          day: dayName,
          availableSlots: [],
          message: `Doctor is not available on ${dayName}`,
        },
      });
    }

    // Generate individual time slots (30-minute intervals)
    const allSlots = [];
    for (const slot of daySlots) {
      const startParts = slot.startTime.split(':').map(Number);
      const endParts = slot.endTime.split(':').map(Number);
      let startMinutes = startParts[0] * 60 + startParts[1];
      const endMinutes = endParts[0] * 60 + endParts[1];

      while (startMinutes + 30 <= endMinutes) {
        const slotStart = `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}`;
        const slotEnd = `${String(Math.floor((startMinutes + 30) / 60)).padStart(2, '0')}:${String((startMinutes + 30) % 60).padStart(2, '0')}`;
        allSlots.push(`${slotStart}-${slotEnd}`);
        startMinutes += 30;
      }
    }

    // Find existing appointments for this doctor on this date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'approved'] },
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    res.status(200).json({
      success: true,
      data: {
        date,
        day: dayName,
        totalSlots: allSlots.length,
        bookedSlots: bookedSlots.length,
        availableSlots,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor-specific profile fields
 * @route   PUT /api/doctors/:id
 * @access  Private (Doctor only)
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Ensure the logged-in user owns this doctor profile
    if (doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile',
      });
    }

    // Update allowed fields
    const allowedFields = [
      'specialization',
      'experience',
      'qualification',
      'consultationFee',
      'availableSlots',
      'hospital',
      'bio',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    }

    const updatedDoctor = await doctor.save();

    // Populate user info before returning
    await updatedDoctor.populate({
      path: 'userId',
      select: 'name email phone profilePicture',
    });

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getAvailableSlots,
  updateDoctorProfile,
};
