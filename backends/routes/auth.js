const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Remove authMiddleware from here (moved to utils/middleware.js)

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Register (admin only)
router.post('/register', require('../utils/middleware').authMiddleware, requireRole('admin'), async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
  if (!['patient', 'doctor', 'receptionist', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ email, passwordHash, role });
  await user.save();
  res.json({ message: 'User registered', user: { email, role } });
});

// Login
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) return res.status(400).json({ error: 'Missing fields' });
  let user;
  if (usernameOrEmail.includes('@')) {
    user = await User.findOne({ email: usernameOrEmail });
  } else {
    user = await User.findOne({ username: usernameOrEmail });
  }
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { email: user.email, role: user.role, username: user.username } });
});

// Admin-only: Get all doctor user accounts for credential status
router.get('/generated-doctor-usernames', require('../utils/middleware').authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({});
    const users = await require('../models/User').find({ role: 'doctor' });
    const map = {};
    users.forEach(u => { if (u.doctor) map[u.doctor.toString()] = true; });
    res.json(map);
  } catch {
    res.json({});
  }
});

// Receptionist/Admin: Get all patient user accounts for credential status
router.get('/generated-patient-usernames', require('../utils/middleware').authMiddleware, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'receptionist' && req.user.role !== 'admin')) return res.status(403).json({});
    const users = await require('../models/User').find({ role: 'patient' });
    const map = {};
    users.forEach(u => { if (u.patient) map[u.patient.toString()] = true; });
    res.json(map);
  } catch {
    res.json({});
  }
});

module.exports = router; 