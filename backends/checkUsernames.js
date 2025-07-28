const mongoose = require('mongoose');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');

mongoose.connect('mongodb://localhost:27017/hospital', { useNewUrlParser: true, useUnifiedTopology: true });

async function checkUsernames() {
  try {
    console.log('=== CHECKING USERNAMES AND FULL NAMES ===');
    
    // Check all users
    const users = await User.find();
    console.log('\n--- ALL USERS ---');
    users.forEach(user => {
      console.log(`Username: "${user.username}", Email: "${user.email}", Role: ${user.role}`);
    });
    
    // Check all patients
    const patients = await Patient.find();
    console.log('\n--- ALL PATIENTS ---');
    patients.forEach(patient => {
      console.log(`FullName: "${patient.fullName}", Age: ${patient.age}, Gender: ${patient.gender}`);
    });
    
    // Check all doctors
    const doctors = await Doctor.find();
    console.log('\n--- ALL DOCTORS ---');
    doctors.forEach(doctor => {
      console.log(`FullName: "${doctor.fullName}", Email: "${doctor.email}", Specialization: ${doctor.specialization}`);
    });
    
    // Test regex matching
    console.log('\n--- TESTING REGEX MATCHING ---');
    const testUsernames = ['michaelchen', 'itlagreeshmasai', 'drporeddysricharithareddy'];
    
    testUsernames.forEach(username => {
      console.log(`\nTesting username: "${username}"`);
      
      // Test patient matching
      const patientMatch = patients.find(p => {
        const cleanFullName = p.fullName.toLowerCase().replace(/\s+/g, '');
        const cleanUsername = username.toLowerCase();
        return cleanFullName === cleanUsername;
      });
      
      if (patientMatch) {
        console.log(`✓ Patient match: "${patientMatch.fullName}"`);
      } else {
        console.log(`✗ No patient match found`);
      }
      
      // Test doctor matching
      const doctorMatch = doctors.find(d => {
        const cleanFullName = d.fullName.toLowerCase().replace(/\s+/g, '');
        const cleanUsername = username.toLowerCase();
        return cleanFullName === cleanUsername;
      });
      
      if (doctorMatch) {
        console.log(`✓ Doctor match: "${doctorMatch.fullName}"`);
      } else {
        console.log(`✗ No doctor match found`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.connection.close();
  }
}

checkUsernames(); 