// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { authMiddleware, requireAnyRole } = require('../utils/middleware');

// Get all appointments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialization')
      .sort({ datetime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Add new appointment (prevent double booking)
router.post('/', authMiddleware, requireAnyRole(['admin', 'receptionist']), async (req, res) => {
  const { patient, doctor, datetime, status } = req.body;
  try {
    // Validate that patient exists in database
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(400).json({ error: 'Patient not found in database. Please add patient first.' });
    }

    // Validate that doctor exists in database
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(400).json({ error: 'Doctor not found in database. Please add doctor first.' });
    }

    // Check for existing appointment at same time for same doctor
    const existingAppointment = await Appointment.findOne({
      doctor,
      datetime: new Date(datetime),
      status: { $in: ['Scheduled', 'Completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Doctor is already booked for this time slot' });
    }

    const appointment = new Appointment({ patient, doctor, datetime, status });
    await appointment.save();
    
    // Populate the appointment for socket emission
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialization');

    // Emit real-time events to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('appointmentCreated', populatedAppointment);
      io.emit('dashboardUpdate', { type: 'appointment', action: 'created', data: populatedAppointment });
    }

    res.json(populatedAppointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment status
router.put('/:id', authMiddleware, requireAnyRole(['admin', 'receptionist', 'doctor']), async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialization');

    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.emit('appointmentUpdated', updated);
      io.emit('dashboardUpdate', { type: 'appointment', action: 'updated', data: updated });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete appointment
router.delete('/:id', authMiddleware, requireAnyRole(['admin', 'receptionist']), async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    
    // Emit real-time events
    const io = req.app.get('io');
    if (io) {
      io.emit('appointmentDeleted', { id: req.params.id });
      io.emit('dashboardUpdate', { type: 'appointment', action: 'deleted', data: { id: req.params.id } });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

module.exports = router;
 