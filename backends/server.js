// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://hospital-backend-z38m.onrender.com', 'http://localhost:3000'] 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/auth', authRoutes);

// MongoDB Connection with environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';

mongoose.connect(MONGODB_URI);

mongoose.connection.once('open', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/patients', patientsRouter);
app.use('/doctors', doctorsRouter);
app.use('/appointments', appointmentsRouter);
app.use('/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from the React app build directory
// Commented out since frontend is deployed separately to Vercel
/*
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}
*/

// Socket.io setup
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://hospital-backend-z38m.onrender.com', 'http://localhost:3000']
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  } 
});

// Make io available to routes
app.set('io', io);

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});