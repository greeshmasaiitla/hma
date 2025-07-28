const express = require('express');
const { requireAnyRole, authMiddleware } = require('../utils/middleware');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');

// Patient dashboard - fetch real data
router.get('/patient', authMiddleware, requireAnyRole(['patient']), async (req, res) => {
  try {
  const now = new Date();
    
    // Get patient data by username (since patients might not have email)
    const username = req.user.username || req.user.email;
    
    // Get all patients and find the one that matches
    const allPatients = await Patient.find();
    const patient = allPatients.find(p => {
      const cleanFullName = p.fullName.toLowerCase().replace(/\s+/g, '');
      const cleanUsername = username.toLowerCase();
      return cleanFullName === cleanUsername;
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get appointments for this patient
    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'fullName specialization')
      .populate('patient', 'fullName age gender')
      .sort({ datetime: 1 });

    // Filter appointments by date
    const upcomingAppointments = appointments.filter(a => new Date(a.datetime) >= now && a.status === 'Scheduled');
    const pastAppointments = appointments.filter(a => new Date(a.datetime) < now || a.status === 'Completed');

    // Get prescriptions for this patient
    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate('patientId', 'fullName age gender')
      .populate('doctorId', 'fullName specialization')
      .sort({ date: -1 });

    res.json({ 
      patient, 
      upcomingAppointments, 
      pastAppointments, 
      prescriptions 
    });
  } catch (err) {
    console.error('Error fetching patient dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch patient dashboard' });
  }
});

// Doctor dashboard - fetch real data
router.get('/doctor', authMiddleware, requireAnyRole(['doctor']), async (req, res) => {
  try {
  const now = new Date();
    
    // Get doctor data by username (since doctors might not have email)
    const allDoctors = await Doctor.find();
    const doctor = allDoctors.find(d => {
      const cleanFullName = d.fullName.toLowerCase().replace(/\s+/g, '');
      const cleanUsername = req.user.username.toLowerCase();
      return cleanFullName === cleanUsername;
    });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialization')
      .sort({ datetime: 1 });

    // Filter appointments
    const todayAppointments = appointments.filter(a => {
      const apptDate = new Date(a.datetime);
      return apptDate.toDateString() === now.toDateString() && a.status === 'Scheduled';
    });

    const upcomingAppointments = appointments.filter(a => {
      const apptDate = new Date(a.datetime);
      return apptDate > now && a.status === 'Scheduled';
    });

    const completedAppointments = appointments.filter(a => a.status === 'Completed');

    // Get assigned patients (patients who have appointments with this doctor)
    const assignedPatients = await Patient.find({
      _id: { $in: appointments.map(a => a.patient) }
    }).distinct('_id');

    const patientsData = await Patient.find({ _id: { $in: assignedPatients } });

    // Get prescriptions written by this doctor
    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate('patientId', 'fullName age gender')
      .sort({ date: -1 });

    res.json({ 
      doctor, 
      appointments: todayAppointments,
      upcomingAppointments,
      completedAppointments,
      assignedPatients: patientsData,
      prescriptions
    });
  } catch (err) {
    console.error('Error fetching doctor dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch doctor dashboard' });
  }
});

// Receptionist dashboard - fetch real data
router.get('/receptionist', authMiddleware, requireAnyRole(['receptionist']), async (req, res) => {
  try {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
    
    // Get today's appointments
    const todayAppointments = await Appointment.find({
      datetime: {
        $gte: new Date(todayStr),
        $lt: new Date(new Date(todayStr).getTime() + 24 * 60 * 60 * 1000)
      }
    })
    .populate('patient', 'fullName age')
    .populate('doctor', 'fullName specialization')
    .sort({ datetime: 1 });

    // Get all doctors
    const doctors = await Doctor.find().select('fullName specialization experience qualification available availableSlots');

    // Get all patients
    const patients = await Patient.find().select('fullName age gender healthSummary');

    // Check for scheduling conflicts
    const conflictWarnings = [];
    const timeSlots = {};
    
    todayAppointments.forEach(appointment => {
      const time = new Date(appointment.datetime).toTimeString().slice(0, 5);
      const doctorId = appointment.doctor._id.toString();
      
      if (!timeSlots[time]) timeSlots[time] = {};
      if (!timeSlots[time][doctorId]) timeSlots[time][doctorId] = [];
      
      timeSlots[time][doctorId].push(appointment);
      
      if (timeSlots[time][doctorId].length > 1) {
        conflictWarnings.push({
          time: time,
          doctor: appointment.doctor.fullName,
          message: 'Multiple patients booked for same slot.'
        });
      }
    });

    res.json({ 
      appointments: todayAppointments, 
      doctors, 
      patients, 
      conflictWarnings 
    });
  } catch (err) {
    console.error('Error fetching receptionist dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch receptionist dashboard' });
  }
});

// Admin dashboard - fetch real data
router.get('/admin', authMiddleware, requireAnyRole(['admin']), async (req, res) => {
  try {
  const totalAppointments = await Appointment.countDocuments();
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();
  const activeReceptionists = await User.countDocuments({ role: 'receptionist' });

  const metrics = {
    totalAppointments,
    totalPatients,
    totalDoctors,
    activeReceptionists,
    };

    // Fetch recent data for tables
    const appointments = await Appointment.find()
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialization')
      .sort({ datetime: -1 })
      .limit(20);

    const patients = await Patient.find().select('fullName age gender healthSummary').sort({ createdAt: -1 }).limit(20);
    const doctors = await Doctor.find().select('fullName email specialization experience qualification available').sort({ createdAt: -1 }).limit(20);
    const users = await User.find().sort({ createdAt: -1 }).limit(20);

    res.json({ 
      metrics, 
      users, 
      logs: [], 
      config: {}, 
      appointments, 
      patients, 
      doctors 
    });
  } catch (err) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch admin dashboard' });
  }
});

module.exports = router; 