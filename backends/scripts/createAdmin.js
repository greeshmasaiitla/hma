const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const users = [
  { email: 'patient1@hms.com', password: 'patient123', role: 'patient' },
  { email: 'doctor1@hms.com', password: 'doctor123', role: 'doctor' },
  { email: 'reception1@hms.com', password: 'reception123', role: 'receptionist' },
  { email: 'admin2@hms.com', password: 'admin123', role: 'admin' },
];

async function createUsers() {
  await mongoose.connect('mongodb://localhost:27017/hospital'); // Update if your DB URL is different
  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ email: u.email, passwordHash, role: u.role });
      console.log(`Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }
  await mongoose.disconnect();
}

createUsers(); 