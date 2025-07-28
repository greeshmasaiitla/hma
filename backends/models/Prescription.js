// backend/models/Prescription.js
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  fileUrl: { type: String }, // Made optional for manual entry
  uploadedBy: { type: String }, // email or user id of uploader
  date: { type: Date, default: Date.now },
  notes: { type: String },
});

module.exports = mongoose.model('Prescription', prescriptionSchema); 