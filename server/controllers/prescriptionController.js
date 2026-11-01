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

/**
 * @desc    Generate a digital prescription HTML/document and upload it to S3
 * @route   POST /api/prescriptions/generate
 * @access  Private (Doctor only)
 */
const generateDigitalPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, medicines, notes } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and Diagnosis are required',
      });
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' },
      })
      .populate({
        path: 'patientId',
        select: 'name email phone medicalHistory',
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

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

    const docName = appointment.doctorId.userId.name || 'Doctor';
    const docSpec = appointment.doctorId.specialization || 'General Medicine';
    const docQual = appointment.doctorId.qualification || 'MBBS';
    const docHosp = appointment.doctorId.hospital || 'MediConnect Cloud Hospital';
    const patName = appointment.patientId?.name || 'Patient';
    const patEmail = appointment.patientId?.email || '';
    const medHist = appointment.patientId?.medicalHistory || {};
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const medRows = Array.isArray(medicines) && medicines.length > 0
      ? medicines
          .map(
            (m, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${m.name || '—'}</strong></td>
            <td>${m.dosage || '—'}</td>
            <td>${m.frequency || '—'}</td>
            <td>${m.duration || '—'}</td>
          </tr>`
          )
          .join('')
      : '<tr><td colspan="5">No specific medications listed</td></tr>';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MediConnect Digital Prescription - ${patName}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #1e293b; }
    .rx-container { max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-top: 6px solid #0ea5e9; }
    .rx-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { color: #0ea5e9; font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .doc-info h2 { margin: 0 0 4px 0; font-size: 20px; color: #0f172a; }
    .doc-info p { margin: 2px 0; font-size: 13px; color: #64748b; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; font-size: 14px; }
    .meta-grid div { margin: 4px 0; }
    .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0ea5e9; margin: 20px 0 10px 0; }
    .diagnosis-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; font-size: 15px; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 14px; }
    th { background: #0f172a; color: #ffffff; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    .notes-box { background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 4px; font-size: 14px; white-space: pre-wrap; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b; }
    .print-btn { background: #0ea5e9; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-bottom: 16px; }
    @media print { .print-btn { display: none; } body { background: #fff; padding: 0; } .rx-container { box-shadow: none; } }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="rx-container">
    <div class="rx-header">
      <div>
        <div class="brand">➕ MediConnect Cloud Healthcare</div>
        <p style="margin:0;font-size:13px;color:#64748b;">Verified Digital E-Prescription</p>
      </div>
      <div class="doc-info" style="text-align:right;">
        <h2>${docName}</h2>
        <p><strong>${docSpec}</strong> | ${docQual}</p>
        <p>${docHosp}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div><strong>Patient Name:</strong> ${patName}</div>
        <div><strong>Email:</strong> ${patEmail}</div>
        <div><strong>Blood Group:</strong> ${medHist.bloodGroup || 'N/A'} | <strong>Weight:</strong> ${medHist.weight || 'N/A'}</div>
      </div>
      <div>
        <div><strong>Date Issued:</strong> ${dateStr}</div>
        <div><strong>Appointment Slot:</strong> ${appointment.timeSlot || ''}</div>
        <div><strong>Known Allergies:</strong> ${medHist.allergies || 'None reported'}</div>
      </div>
    </div>

    <div class="section-title">Clinical Diagnosis</div>
    <div class="diagnosis-box">${diagnosis}</div>

    <div class="section-title">℞ Prescribed Medications</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Medicine Name</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        ${medRows}
      </tbody>
    </table>

    ${
      notes
        ? `<div class="section-title">Doctor's Advice & Instructions</div>
           <div class="notes-box">${notes}</div>`
        : ''
    }

    <div class="footer">
      <div>Digitally signed by <strong>${docName}</strong> via MediConnect AWS S3 Cloud Storage</div>
      <div>Prescription ID: ${appointment._id}</div>
    </div>
  </div>
</body>
</html>`;

    const fileBuffer = Buffer.from(htmlContent, 'utf-8');
    const fileObj = {
      buffer: fileBuffer,
      originalname: `Digital-Prescription-${patName.replace(/\s+/g, '-')}.html`,
      mimetype: 'text/html',
    };

    const { key, url } = await uploadToS3(fileObj, 'prescriptions');

    const prescription = await Prescription.create({
      appointmentId,
      doctorId: req.user._id,
      patientId: appointment.patientId._id,
      fileUrl: key,
      fileName: fileObj.originalname,
      fileType: 'text/html',
      diagnosis,
      medicines: Array.isArray(medicines) ? medicines : [],
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Digital prescription generated and stored on AWS S3!',
      data: {
        _id: prescription._id,
        appointmentId: prescription.appointmentId,
        fileName: prescription.fileName,
        fileType: prescription.fileType,
        diagnosis: prescription.diagnosis,
        medicines: prescription.medicines,
        notes: prescription.notes,
        uploadedAt: prescription.uploadedAt,
        url,
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
  generateDigitalPrescription,
};
