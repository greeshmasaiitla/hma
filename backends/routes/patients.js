// backend/routes/patients.js
const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authMiddleware, requireAnyRole } = require('../utils/middleware');
const Doctor = require('../models/Doctor'); // Added Doctor model import

// Get all patients
router.get('/', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
    const patients = await Patient.find().sort({ fullName: 1 });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient's own data (for patients) - NEW ROUTE
router.get('/my-data', authMiddleware, requireAnyRole(['patient']), async (req, res) => {
  const username = req.user.username || req.user.email;
  if (!username) {
    return res.status(404).json({ error: 'Patient not found - no username' });
  }
  
  const allPatients = await Patient.find();
  const patient = allPatients.find(p => {
    const cleanFullName = p.fullName.toLowerCase().replace(/\s+/g, '');
    const cleanUsername = username.toLowerCase();
    return cleanFullName === cleanUsername;
  });
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  res.json([patient]); // Return as array to match the expected format
});

// Get patient by ID
router.get('/:id', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Add new patient
router.post('/', authMiddleware, requireAnyRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { fullName, age, gender, email, healthSummary } = req.body;
    const patient = new Patient({ fullName, age, gender, email, healthSummary });
  await patient.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('patientCreated', patient);
      io.emit('dashboardUpdate', { type: 'patient', action: 'created', data: patient });
    }
    
    res.json(patient);
  } catch (err) {
    console.error('Error creating patient:', err);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('patientUpdated', updated);
      io.emit('dashboardUpdate', { type: 'patient', action: 'updated', data: updated });
    }
    
  res.json(updated);
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient
router.delete('/:id', authMiddleware, requireAnyRole(['admin']), async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    
    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('patientDeleted', { id: req.params.id });
      io.emit('dashboardUpdate', { type: 'patient', action: 'deleted', data: { id: req.params.id } });
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Get prescriptions for a patient
router.get('/:id/prescriptions', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor', 'patient']), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.id })
      .populate('patientId', 'fullName age gender')
      .populate('doctorId', 'fullName specialization')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Add prescription for a patient
router.post('/:id/prescriptions', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
    const { notes, healthSummary } = req.body;
    
    // Find doctor by username
    let doctorId = null;
    if (req.user.role === 'doctor') {
      const allDoctors = await Doctor.find();
      const doctor = allDoctors.find(d => {
        const cleanFullName = d.fullName.toLowerCase().replace(/\s+/g, '');
        const cleanUsername = req.user.username.toLowerCase();
        return cleanFullName === cleanUsername;
      });
      if (doctor) {
        doctorId = doctor._id;
      }
    }
    
    // If no doctor found and user is a doctor, try to find by email
    if (!doctorId && req.user.role === 'doctor' && req.user.email) {
      const doctor = await Doctor.findOne({ email: req.user.email });
      if (doctor) {
        doctorId = doctor._id;
      }
    }
    
    // If still no doctor found, try to find by username in a different way
    if (!doctorId && req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ 
        fullName: { $regex: new RegExp(req.user.username, 'i') }
      });
      if (doctor) {
        doctorId = doctor._id;
      }
    }
    
    const prescription = new Prescription({
      patientId: req.params.id,
      doctorId: doctorId,
      notes,
      uploadedBy: req.user.email || req.user.username,
      date: new Date()
    });
    
    await prescription.save();
    
    // Update patient's health summary if provided
    if (healthSummary) {
      await Patient.findByIdAndUpdate(req.params.id, { healthSummary });
    }
    
    // Populate the prescription for socket emission
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patientId', 'fullName age gender')
      .populate('doctorId', 'fullName specialization');
    
    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.emit('prescriptionAdded', populatedPrescription);
      io.emit('dashboardUpdate', { type: 'prescription', action: 'created', data: populatedPrescription });
    }
    
    res.json(populatedPrescription);
  } catch (err) {
    console.error('Error adding prescription:', err);
    res.status(500).json({ error: 'Failed to add prescription' });
  }
});

// Update prescription
router.put('/prescriptions/:id', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patientId', 'fullName age gender')
      .populate('doctorId', 'fullName specialization');
    
    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.emit('prescriptionUpdated', updated);
      io.emit('dashboardUpdate', { type: 'prescription', action: 'updated', data: updated });
    }
    
    res.json(updated);
  } catch (err) {
    console.error('Error updating prescription:', err);
    res.status(500).json({ error: 'Failed to update prescription' });
  }
});

// Delete prescription
router.delete('/prescriptions/:id', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
    await Prescription.findByIdAndDelete(req.params.id);
    
    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.emit('prescriptionDeleted', { id: req.params.id });
      io.emit('dashboardUpdate', { type: 'prescription', action: 'deleted', data: { id: req.params.id } });
    }
    
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('Error deleting prescription:', err);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

// Receptionist/Admin: Generate credentials for a patient
router.post('/:id/generate-credentials', authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'receptionist' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Forbidden: Receptionists or Admins only' });
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    // Username: use fullName (guaranteed unique)
    const username = patient.fullName.replace(/\s+/g, '').toLowerCase();
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(409).json({ error: 'Credentials already generated for this patient.' });
    }
    // Generate random password
    const password = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user
    user = new User({
      username,
      passwordHash,
      role: 'patient',
      patient: patient._id
      // Don't include email field to avoid duplicate key error
    });
    await user.save();
    res.json({ username, password });
  } catch (err) {
    console.error('Generate patient credentials error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
