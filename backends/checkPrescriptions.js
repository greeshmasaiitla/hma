const mongoose = require('mongoose');
const Prescription = require('./models/Prescription');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');

mongoose.connect('mongodb://localhost:27017/hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkPrescriptions() {
  try {
    console.log('Checking prescriptions...');
    
    // Get all prescriptions
    const prescriptions = await Prescription.find()
      .populate('patientId', 'fullName')
      .populate('doctorId', 'fullName');
    
    console.log('\nAll Prescriptions:');
    prescriptions.forEach(p => {
      console.log(`- Patient: ${p.patientId?.fullName || 'Unknown'}`);
      console.log(`  Doctor: ${p.doctorId?.fullName || 'Unknown'}`);
      console.log(`  Notes: ${p.notes?.substring(0, 50)}...`);
      console.log(`  Date: ${p.date}`);
      console.log(`  UploadedBy: ${p.uploadedBy}`);
      console.log('---');
    });
    
    // Check for prescriptions without doctorId
    const prescriptionsWithoutDoctor = prescriptions.filter(p => !p.doctorId);
    if (prescriptionsWithoutDoctor.length > 0) {
      console.log(`\nFound ${prescriptionsWithoutDoctor.length} prescriptions without doctorId:`);
      prescriptionsWithoutDoctor.forEach(p => {
        console.log(`- Patient: ${p.patientId?.fullName || 'Unknown'}`);
        console.log(`  UploadedBy: ${p.uploadedBy}`);
      });
    }
    
    // Get all doctors
    const doctors = await Doctor.find().select('fullName email');
    console.log('\nAll Doctors:');
    doctors.forEach(d => {
      console.log(`- ${d.fullName} (${d.email})`);
    });
    
    // Get all patients
    const patients = await Patient.find().select('fullName');
    console.log('\nAll Patients:');
    patients.forEach(p => {
      console.log(`- ${p.fullName}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

checkPrescriptions(); 