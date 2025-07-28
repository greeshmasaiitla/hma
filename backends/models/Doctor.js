// backend/models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true, unique: true },
  specialization: String,
  experience: Number,
  qualification: { type: String, required: true },
  availableSlots: [{
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  }]
});

module.exports = mongoose.model('Doctor', doctorSchema);
