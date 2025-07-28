// backend/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true, unique: true },
  age: Number,
  gender: String,
  healthSummary: { type: String, default: '' }, // Added for doctor notes
});

module.exports = mongoose.model('Patient', patientSchema);
