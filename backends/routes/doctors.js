const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { authMiddleware, requireAnyRole } = require('../utils/middleware');

// Get all doctors (authenticated users only)
router.get('/', authMiddleware, async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// Add new doctor (admin or receptionist only)
router.post('/', authMiddleware, requireAnyRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { fullName, specialization, experience, qualification, availableSlots } = req.body;
    
    // Validation
    if (!fullName || !specialization || !experience || !qualification) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
      return res.status(400).json({ error: 'At least one available slot is required' });
    }
    
    // Validate each slot
    for (let slot of availableSlots) {
      if (!slot.start || !slot.end) {
        return res.status(400).json({ error: 'Each slot must have start and end times' });
      }
      
      const startTime = new Date(slot.start);
      const endTime = new Date(slot.end);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for slots' });
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({ error: 'Start time must be before end time' });
      }
    }
    
    const doctor = new Doctor({
      fullName,
      specialization,
      experience,
      qualification,
      availableSlots: availableSlots.map(slot => ({
        start: new Date(slot.start),
        end: new Date(slot.end)
      }))
    });
    
    await doctor.save();
    res.json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

// Update doctor (admin or receptionist only)
router.put('/:id', authMiddleware, requireAnyRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const { fullName, specialization, experience, qualification, availableSlots } = req.body;
    
    // Validation
    if (!fullName || !specialization || !experience || !qualification) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!availableSlots || !Array.isArray(availableSlots) || availableSlots.length === 0) {
      return res.status(400).json({ error: 'At least one available slot is required' });
    }
    
    // Validate each slot
    for (let slot of availableSlots) {
      if (!slot.start || !slot.end) {
        return res.status(400).json({ error: 'Each slot must have start and end times' });
      }
      
      const startTime = new Date(slot.start);
      const endTime = new Date(slot.end);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for slots' });
      }
      
      if (startTime >= endTime) {
        return res.status(400).json({ error: 'Start time must be before end time' });
      }
    }
    
    const updated = await Doctor.findByIdAndUpdate(req.params.id, {
      fullName,
      specialization,
      experience,
      qualification,
      availableSlots: availableSlots.map(slot => ({
        start: new Date(slot.start),
        end: new Date(slot.end)
      }))
    }, { new: true });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// Delete doctor (admin or receptionist only)
router.delete('/:id', authMiddleware, requireAnyRole(['admin', 'receptionist']), async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Admin-only: Generate credentials for a doctor
router.post('/:id/generate-credentials', authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    // Username: use fullName (guaranteed unique)
    const username = doctor.fullName.replace(/\s+/g, '').toLowerCase();
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(409).json({ error: 'Credentials already generated for this doctor.' });
    }
    // Generate random password
    const password = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user
    user = new User({
      username,
      passwordHash,
      role: 'doctor',
      doctor: doctor._id
    });
    await user.save();
    res.json({ username, password });
  } catch (err) {
    console.error('Generate doctor credentials error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
