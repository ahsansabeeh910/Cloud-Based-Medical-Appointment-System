const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { uploadToS3, getSignedUrl } = require('../utils/s3');

/**
 * Validation rules for uploading a prescription.
 */
const uploadPrescriptionValidation = [
  body('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required')
    .isMongoId()
    .withMessage('Invalid Appointment ID format'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

/**
 * @desc    Upload a prescription file for an appointment
 * @route   POST /api/prescriptions
 * @access  Private (Doctor only)
 */
const uploadPrescription = async (req, res, next) => {
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

    const { appointmentId, notes } = req.body;

    // Verify file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file (image or PDF)',
      });
    }

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId).populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: '_id',
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Verify the logged-in doctor is the one assigned to this appointment
    if (
      !appointment.doctorId ||
      !appointment.doctorId.userId ||
      appointment.doctorId.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized — you are not the doctor for this appointment',
      });
    }

    // Upload file to S3
    const { key, url } = await uploadToS3(req.file, 'prescriptions');

    // Create prescription record
    const prescription = await Prescription.create({
      appointmentId,
      doctorId: req.user._id,
      patientId: appointment.patientId,
      fileUrl: key,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully',
      data: {
        _id: prescription._id,
        appointmentId: prescription.appointmentId,
        fileName: prescription.fileName,
        fileType: prescription.fileType,
        notes: prescription.notes,
        uploadedAt: prescription.uploadedAt,
        url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all prescriptions for a specific appointment
 * @route   GET /api/prescriptions/appointment/:id
 * @access  Private
 */
const getPrescriptionsByAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId).populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: '_id',
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Verify authorization (patient or doctor of the appointment)
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
        message: 'Not authorized to view prescriptions for this appointment',
      });
    }

    const prescriptions = await Prescription.find({ appointmentId })
      .populate({
        path: 'doctorId',
        select: 'name email',
      })
      .populate({
        path: 'patientId',
        select: 'name email',
      })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download a prescription — generates a pre-signed S3 URL
 * @route   GET /api/prescriptions/:id/download
 * @access  Private
 */
const downloadPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Verify authorization (patient or doctor)
    const isPatient =
      prescription.patientId.toString() === req.user._id.toString();
    const isDoctor =
      prescription.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this prescription',
      });
    }

    // Generate a pre-signed URL valid for 1 hour
    const signedUrl = await getSignedUrl(prescription.fileUrl, 3600);

    res.status(200).json({
      success: true,
      data: {
        _id: prescription._id,
        fileName: prescription.fileName,
        fileType: prescription.fileType,
        downloadUrl: signedUrl,
        expiresIn: '1 hour',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPrescription,
  uploadPrescriptionValidation,
  getPrescriptionsByAppointment,
  downloadPrescription,
};
