// frontend/src/App.js
import React, { useEffect, useState, useCallback } from 'react';
// src/App.js
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Appointments from './components/Appointments';
import Doctors from './components/Doctors';
import Patients from './components/Patients';
import Notifications from './components/Notifications';
import AuditLog from './components/AuditLog';
import Messages from './components/Messages';
import './HospitalStyles.css';
//import './App.css';
import { UserProvider, useUser } from './components/UserContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminAppointmentsPage from './components/admin/AdminAppointmentsPage';
import AdminPatientsPage from './components/admin/AdminPatientsPage';
import AdminDoctorsPage from './components/admin/AdminDoctorsPage';
import AdminReceptionistsPage from './components/admin/AdminReceptionistsPage';
import AdminUsersPage from './components/admin/AdminUsersPage';
import AdminLogsPage from './components/admin/AdminLogsPage';
import AdminConfigPage from './components/admin/AdminConfigPage';
import AdminManageDoctorsPage from './components/admin/AdminManageDoctorsPage';
import DoctorSchedulePage from './components/doctor/DoctorSchedulePage';
import DoctorPatientsPage from './components/doctor/DoctorPatientsPage';
import DoctorCompletedPage from './components/doctor/DoctorCompletedPage';
import DoctorPrescriptionsPage from './components/doctor/DoctorPrescriptionsPage';
import PatientUpcomingPage from './components/patient/PatientUpcomingPage';
import PatientPrescriptionsPage from './components/patient/PatientPrescriptionsPage';
import PatientHistoryPage from './components/patient/PatientHistoryPage';
import PatientHealthPage from './components/patient/PatientHealthPage';
import ReceptionistTodayPage from './components/receptionist/ReceptionistTodayPage';
import ReceptionistSearchPage from './components/receptionist/ReceptionistSearchPage';
import ReceptionistConflictsPage from './components/receptionist/ReceptionistConflictsPage';
import ReceptionistPatientsPage from './components/receptionist/ReceptionistPatientsPage';
import ReceptionistDoctorsPage from './components/receptionist/ReceptionistDoctorsPage';
import ReceptionistManageAppointmentsPage from './components/receptionist/ReceptionistManageAppointmentsPage';
import ReceptionistManagePatientsPage from './components/receptionist/ReceptionistManagePatientsPage';
import socket from './socket';

// Make socket available globally
window.socket = socket;

function AppInner() {
  const location = useLocation();
  const isLinkActive = (path) => location.pathname === path;
  const { user } = useUser();

  // Demo notifications state
  const [notifications, setNotifications] = React.useState([
    { message: 'Appointment scheduled for Amith Shah on 2025-07-24 at 10:00', time: 'Just now', read: false },
    { message: 'Patient record updated: John Doe', time: '5 min ago', read: false },
    { message: 'Doctor added: Dr. Anjali Bhatt', time: '10 min ago', read: true },
  ]);
  const handleMarkAllRead = () => {
    setNotifications(n => n.map(notif => ({ ...notif, read: true })));
  };
  const unreadCount = notifications.filter(n => !n.read).length;

  // Demo audit log state
  const [auditLog] = React.useState([
    { action: 'Create', entity: 'Appointment', details: 'Amith Shah with Dr. Anjali Bhatt on 2025-07-24 at 10:00', time: 'Just now' },
    { action: 'Update', entity: 'Patient', details: 'John Doe age updated to 45', time: '5 min ago' },
    { action: 'Create', entity: 'Doctor', details: 'Dr. Anjali Bhatt (Cardiology)', time: '10 min ago' },
    { action: 'Delete', entity: 'Appointment', details: 'Jane Smith with Dr. Patel on 2025-07-20', time: '1 day ago' },
  ]);

  // Role-based dashboard fetch with real-time updates
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      let url = `/dashboard/${user.role}`;
      try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${url}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
      console.error('Failed to fetch dashboard:', err);
        setDashboardData({ error: 'Failed to fetch dashboard' });
      }
  }, [user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Listen for real-time dashboard updates
  useEffect(() => {
    if (!user) return;

    const handleDashboardUpdate = () => {
      // Refresh dashboard data when relevant updates occur
      fetchDashboard();
    };

    socket.on('dashboardUpdate', handleDashboardUpdate);
    socket.on('appointmentCreated', handleDashboardUpdate);
    socket.on('appointmentUpdated', handleDashboardUpdate);
    socket.on('appointmentDeleted', handleDashboardUpdate);
    socket.on('prescriptionAdded', handleDashboardUpdate);
    socket.on('prescriptionUpdated', handleDashboardUpdate);
    socket.on('prescriptionDeleted', handleDashboardUpdate);
    socket.on('patientCreated', handleDashboardUpdate);
    socket.on('patientUpdated', handleDashboardUpdate);
    socket.on('patientDeleted', handleDashboardUpdate);

    return () => {
      socket.off('dashboardUpdate', handleDashboardUpdate);
      socket.off('appointmentCreated', handleDashboardUpdate);
      socket.off('appointmentUpdated', handleDashboardUpdate);
      socket.off('appointmentDeleted', handleDashboardUpdate);
      socket.off('prescriptionAdded', handleDashboardUpdate);
      socket.off('prescriptionUpdated', handleDashboardUpdate);
      socket.off('prescriptionDeleted', handleDashboardUpdate);
      socket.off('patientCreated', handleDashboardUpdate);
      socket.off('patientUpdated', handleDashboardUpdate);
      socket.off('patientDeleted', handleDashboardUpdate);
    };
  }, [user, fetchDashboard]);

  if (!user && location.pathname !== '/login') {
    window.location.href = '/login';
    return null;
  }

  // Role-based navbar links (strict)
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', roles: ['Admin'] },
    { to: '/appointments', label: 'Appointments', roles: ['Admin', 'Receptionist', 'Doctor', 'Patient'] },
    { to: '/patients', label: 'Patients', roles: ['Admin', 'Receptionist'] },
    { to: '/doctors', label: 'Doctors', roles: ['Admin', 'Receptionist'] },
    { to: '/messages', label: 'Messages', roles: ['Admin', 'Receptionist', 'Doctor'] },
    { to: '/notifications', label: 'Notifications', roles: ['Admin'] },
    { to: '/audit-log', label: 'Audit Log', roles: ['Admin'] },
  ];

  return (
    <div className="container">
      <h1 className="app-title">Hospital Management App</h1>
      <ToastContainer position="top-right" autoClose={3000} />
      <nav className="navbar">
        <ul>
          {user && navLinks.filter(link => link.roles.includes(user.role)).map(link => (
            <li key={link.to} className={isLinkActive(link.to) ? 'active' : ''} style={{marginLeft: 12}}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
        {user && (
          <span>
            User: {user.email} ({user.role})
          </span>
        )}
        {user && user.role === 'Admin' && (
          <Link to="/notifications" style={{ marginLeft: 24, position: 'relative', display: 'inline-block' }} aria-label="Notifications">
            <span style={{ fontSize: 24, verticalAlign: 'middle' }}>🔔</span>
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -8, background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
            )}
          </Link>
        )}
      </nav>
      <Routes>
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'patient']}>
            {user && dashboardData ? (
              <div className="container">
                <h2 className="section-title">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</h2>
                {user.role === 'patient' && <PatientDashboard dashboardData={dashboardData} />}
                {user.role === 'doctor' && <DoctorDashboard dashboardData={dashboardData} />}
                {user.role === 'receptionist' && <ReceptionistDashboard dashboardData={dashboardData} />}
                {user.role === 'admin' && <AdminDashboard dashboardData={dashboardData} />}
              </div>
            ) : (
              <div className="container">Loading dashboard...</div>
            )}
          </ProtectedRoute>
        } />
        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'patient']}>
            <Appointments />
          </ProtectedRoute>
        } />
        <Route path="/doctors" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
            <Doctors />
          </ProtectedRoute>
        } />
        <Route path="/patients" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
            <Patients />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Notifications notifications={notifications} onMarkAllRead={handleMarkAllRead} />
          </ProtectedRoute>
        } />
        <Route path="/audit-log" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLog log={auditLog} />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor']}>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={dashboardData ? <AdminAppointmentsPage appointments={dashboardData.appointments || []} /> : <div>Loading...</div>} />
        <Route path="/admin/patients" element={dashboardData ? <AdminPatientsPage patients={dashboardData.patients || []} /> : <div>Loading...</div>} />
        <Route path="/admin/doctors" element={dashboardData ? <AdminDoctorsPage doctors={dashboardData.doctors || []} /> : <div>Loading...</div>} />
        <Route path="/admin/receptionists" element={dashboardData ? <AdminReceptionistsPage users={dashboardData.users || []} /> : <div>Loading...</div>} />
        <Route path="/admin/users" element={dashboardData ? <AdminUsersPage users={dashboardData.users || []} /> : <div>Loading...</div>} />
        <Route path="/admin/logs" element={dashboardData ? <AdminLogsPage logs={dashboardData.logs || []} /> : <div>Loading...</div>} />
        <Route path="/admin/config" element={dashboardData ? <AdminConfigPage config={dashboardData.config || {}} /> : <div>Loading...</div>} />
        <Route path="/admin/manage-doctors" element={dashboardData ? <AdminManageDoctorsPage doctors={dashboardData.doctors || []} /> : <div>Loading...</div>} />
        <Route path="/doctor/schedule" element={dashboardData ? <DoctorSchedulePage appointments={dashboardData.appointments || []} /> : <div>Loading...</div>} />
        <Route path="/doctor/patients" element={dashboardData ? <DoctorPatientsPage patients={dashboardData.assignedPatients || []} /> : <div>Loading...</div>} />
        <Route path="/doctor/completed" element={dashboardData ? <DoctorCompletedPage appointments={dashboardData.completedAppointments || []} /> : <div>Loading...</div>} />
        <Route path="/doctor/prescriptions" element={dashboardData ? <DoctorPrescriptionsPage prescriptions={dashboardData.prescriptions || []} /> : <div>Loading...</div>} />
        <Route path="/patient/upcoming" element={<ProtectedRoute allowedRoles={['patient']}><PatientUpcomingPage /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><PatientPrescriptionsPage /></ProtectedRoute>} />
        <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><PatientHistoryPage /></ProtectedRoute>} />
        <Route path="/patient/health" element={<ProtectedRoute allowedRoles={['patient']}><PatientHealthPage /></ProtectedRoute>} />
        <Route path="/receptionist/today" element={dashboardData ? <ReceptionistTodayPage appointments={dashboardData.appointments || []} /> : <div>Loading...</div>} />
        <Route path="/receptionist/search" element={dashboardData ? <ReceptionistSearchPage search={dashboardData.quickSearch || []} /> : <div>Loading...</div>} />
        <Route path="/receptionist/conflicts" element={dashboardData ? <ReceptionistConflictsPage conflicts={dashboardData.conflictWarnings || []} /> : <div>Loading...</div>} />
        <Route path="/receptionist/patients" element={dashboardData ? <ReceptionistPatientsPage patients={dashboardData.patients || []} /> : <div>Loading...</div>} />
        <Route path="/receptionist/doctors" element={dashboardData ? <ReceptionistDoctorsPage doctors={dashboardData.doctors || []} /> : <div>Loading...</div>} />
        <Route path="/receptionist/manage-appointments" element={dashboardData ? <ReceptionistManageAppointmentsPage appointments={dashboardData.appointments || []} /> : <div>Loading...</div>} />
        <Route path="/receptionist/manage-patients" element={dashboardData ? <ReceptionistManagePatientsPage patients={dashboardData.patients || []} /> : <div>Loading...</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Appointments />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppInner />
      </Router>
    </UserProvider>
  );
}

export default App;
