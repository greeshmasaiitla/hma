const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'receptionist', 'admin'], required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  // email is optional for patients/doctors if using username
  email: { type: String, sparse: true }, // sparse: true means unique only for non-null values
});

module.exports = mongoose.model('User', userSchema); 