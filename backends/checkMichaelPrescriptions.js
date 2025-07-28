const mongoose = require('mongoose');
const Prescription = require('./models/Prescription');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');

mongoose.connect('mongodb://localhost:27017/hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkMichaelPrescriptions() {
  try {
    console.log('Checking Michael Chen\'s prescriptions...');
    
    // Find Michael Chen
    const michael = await Patient.findOne({ fullName: { $regex: /michael chen/i } });
    console.log('Michael Chen found:', michael);
    
    if (!michael) {
      console.log('Michael Chen not found');
      return;
    }
    
    // Get all prescriptions for Michael Chen
    const michaelPrescriptions = await Prescription.find({ patientId: michael._id })
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName');
    
    console.log(`\nMichael Chen has ${michaelPrescriptions.length} prescriptions:`);
    michaelPrescriptions.forEach((p, index) => {
      console.log(`${index + 1}. Doctor: ${p.doctorId?.fullName || 'Unknown'}`);
      console.log(`   Notes: ${p.notes?.substring(0, 50)}...`);
      console.log(`   Date: ${p.date}`);
      console.log(`   UploadedBy: ${p.uploadedBy}`);
      console.log('---');
    });
    
    // Check if there are any prescriptions for Michael Chen that are linked to Dr. Charitha
    const charithaPrescriptions = michaelPrescriptions.filter(p => 
      p.doctorId && p.doctorId.fullName && p.doctorId.fullName.includes('Charitha')
    );
    
    if (charithaPrescriptions.length > 0) {
      console.log(`\nWARNING: Found ${charithaPrescriptions.length} prescriptions for Michael Chen linked to Dr. Charitha:`);
      charithaPrescriptions.forEach(p => {
        console.log(`- ${p.notes?.substring(0, 50)}...`);
      });
    }
    
    // Check appointments for Michael Chen
    const Appointment = require('./models/Appointment');
    const michaelAppointments = await Appointment.find({ patient: michael._id })
      .populate('doctor', 'fullName')
      .populate('patient', 'fullName');
    
    console.log(`\nMichael Chen's appointments:`);
    michaelAppointments.forEach(apt => {
      console.log(`- Doctor: ${apt.doctor?.fullName || 'Unknown'}`);
      console.log(`  Date: ${apt.datetime}`);
      console.log(`  Status: ${apt.status}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

checkMichaelPrescriptions(); 