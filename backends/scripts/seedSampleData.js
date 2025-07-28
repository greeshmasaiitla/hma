const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await User.deleteMany({});

    // Create sample doctors
    const doctor1 = new Doctor({
      name: 'Dr. Anjali Bhatt',
      email: 'anjali@hospital.com',
      specialization: 'Cardiology',
      experience: 10,
      qualification: 'MBBS, MD',
      available: true,
      availableSlots: [
        { start: new Date(Date.now() + 24 * 60 * 60 * 1000), end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000) }, // Tomorrow 9:00-9:30
        { start: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 90 * 60 * 1000) }, // Tomorrow 10:00-10:30
        { start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000) }, // Day after tomorrow 9:00-9:30
      ]
    });
    await doctor1.save();

    const doctor2 = new Doctor({
      name: 'Dr. Patel',
      email: 'patel@hospital.com',
      specialization: 'Orthopedics',
      experience: 8,
      qualification: 'MBBS, MS',
      available: true,
      availableSlots: [
        { start: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 + 30 * 60 * 1000) }, // Tomorrow 11:00-11:30
        { start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000) }, // Day after tomorrow 10:00-10:30
      ]
    });
    await doctor2.save();

    // Create sample patients
    const patient1 = new Patient({
      name: 'John Doe',
      email: 'john@example.com',
      age: 32,
      gender: 'Male',
      healthSummary: 'No known allergies. Previous history of mild hypertension.'
    });
    await patient1.save();

    const patient2 = new Patient({
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 28,
      gender: 'Female',
      healthSummary: 'Allergic to penicillin. No other known conditions.'
    });
    await patient2.save();

    const patient3 = new Patient({
      name: 'Amith Shah',
      email: 'amith@example.com',
      age: 45,
      gender: 'Male',
      healthSummary: 'Diabetes type 2. Takes metformin daily.'
    });
    await patient3.save();

    // Create sample appointments
    const appointment1 = new Appointment({
      patient: patient1._id,
      doctor: doctor1._id,
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'Scheduled'
    });
    await appointment1.save();

    const appointment2 = new Appointment({
      patient: patient2._id,
      doctor: doctor2._id,
      datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      status: 'Scheduled'
    });
    await appointment2.save();

    const appointment3 = new Appointment({
      patient: patient3._id,
      doctor: doctor1._id,
      datetime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (completed)
      status: 'Completed'
    });
    await appointment3.save();

    // Create sample prescriptions
    const prescription1 = new Prescription({
      patientId: patient3._id,
      notes: 'Metformin 500mg twice daily. Monitor blood sugar levels. Follow up in 3 months.',
      uploadedBy: 'anjali@hospital.com',
      date: new Date()
    });
    await prescription1.save();

    const prescription2 = new Prescription({
      patientId: patient1._id,
      notes: 'Lisinopril 10mg once daily for blood pressure control. Regular monitoring required.',
      uploadedBy: 'anjali@hospital.com',
      date: new Date()
    });
    await prescription2.save();

    // Create sample users
    const adminUser = new User({
      email: 'admin@hospital.com',
      passwordHash: '$2a$10$example.hash.for.admin',
      role: 'admin'
    });
    await adminUser.save();

    const receptionistUser = new User({
      email: 'receptionist@hospital.com',
      passwordHash: '$2a$10$example.hash.for.receptionist',
      role: 'receptionist'
    });
    await receptionistUser.save();

    const doctorUser = new User({
      email: 'anjali@hospital.com',
      passwordHash: '$2a$10$example.hash.for.doctor',
      role: 'doctor'
    });
    await doctorUser.save();

    const patientUser = new User({
      email: 'john@example.com',
      passwordHash: '$2a$10$example.hash.for.patient',
      role: 'patient'
    });
    await patientUser.save();

    console.log('Sample data seeded successfully!');
    console.log('Created:');
    console.log('- 2 doctors');
    console.log('- 3 patients');
    console.log('- 3 appointments');
    console.log('- 2 prescriptions');
    console.log('- 4 users (admin, receptionist, doctor, patient)');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData(); 