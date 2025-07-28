const mongoose = require('mongoose');
const Prescription = require('./models/Prescription');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');

mongoose.connect('mongodb://localhost:27017/hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixPrescriptions() {
  try {
    console.log('Fixing prescriptions without doctorId...');
    
    // Get all prescriptions without doctorId
    const prescriptionsWithoutDoctor = await Prescription.find({ doctorId: { $exists: false } });
    
    console.log(`Found ${prescriptionsWithoutDoctor.length} prescriptions without doctorId`);
    
    for (const prescription of prescriptionsWithoutDoctor) {
      console.log(`\nFixing prescription for patient: ${prescription.patientId}`);
      
      // Try to find the doctor based on the patient's appointments
      const patient = await Patient.findById(prescription.patientId);
      if (!patient) {
        console.log('Patient not found, skipping...');
        continue;
      }
      
      // Find appointments for this patient
      const Appointment = require('./models/Appointment');
      const appointments = await Appointment.find({ patient: prescription.patientId })
        .populate('doctor', 'fullName');
      
      if (appointments.length > 0) {
        // Use the doctor from the most recent appointment
        const mostRecentAppointment = appointments.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];
        const doctorId = mostRecentAppointment.doctor._id;
        
        console.log(`Linking to doctor: ${mostRecentAppointment.doctor.fullName}`);
        
        // Update the prescription
        await Prescription.findByIdAndUpdate(prescription._id, { doctorId });
        
        console.log('Prescription updated successfully');
      } else {
        console.log('No appointments found for this patient');
      }
    }
    
    console.log('\nVerifying fixes...');
    const allPrescriptions = await Prescription.find()
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName');
    
    console.log('\nAll Prescriptions after fix:');
    allPrescriptions.forEach(p => {
      console.log(`- Patient: ${p.patientId?.fullName || 'Unknown'}`);
      console.log(`  Doctor: ${p.doctorId?.fullName || 'Unknown'}`);
      console.log(`  Notes: ${p.notes?.substring(0, 50)}...`);
      console.log('---');
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

fixPrescriptions(); 