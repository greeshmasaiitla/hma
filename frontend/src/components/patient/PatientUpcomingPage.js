import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../socket';
import { useUser } from '../UserContext';

const PatientUpcomingPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Get appointments for the current patient
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Find patient by username instead of email
      const patientsRes = await axios.get('http://localhost:5000/patients/my-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const patient = patientsRes.data[0]; // Get the first (and only) patient
      
      if (!patient) {
        setAppointments([]);
        return;
      }
      
      const patientAppointments = res.data.filter(appointment =>
        appointment.patient && (
          (typeof appointment.patient === 'object' && appointment.patient._id === patient._id) ||
          (typeof appointment.patient === 'string' && appointment.patient === patient._id)
        )
      );
      
      // Filter for upcoming appointments (future dates and scheduled status)
      const now = new Date();
      const upcoming = patientAppointments.filter(appointment => {
        const apptDate = new Date(appointment.datetime);
        return apptDate >= now && appointment.status === 'Scheduled';
      }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)); // Sort by date (earliest first)
      
      setAppointments(upcoming);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    
    // Listen for real-time updates
    socket.on('appointmentCreated', (appointment) => {
      // Refresh appointments when any appointment is created
      fetchAppointments();
    });
    
    socket.on('appointmentUpdated', (appointment) => {
      // Refresh appointments when any appointment is updated
      fetchAppointments();
    });
    
    socket.on('appointmentDeleted', (data) => {
      fetchAppointments();
    });
    
    socket.on('dashboardUpdate', (update) => {
      if (update.type === 'appointment') {
        fetchAppointments();
      }
    });

    return () => {
      socket.off('appointmentCreated');
      socket.off('appointmentUpdated');
      socket.off('appointmentDeleted');
      socket.off('dashboardUpdate');
    };
  }, [user.username]);

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  return (
    <div className="container">
      <h2>Patient: Upcoming Appointments</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <h3>No upcoming appointments</h3>
          <p>You don't have any scheduled appointments. Contact reception to book an appointment!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {appointments.map((appointment, idx) => (
            <div 
              key={appointment._id || idx}
              style={{
                padding: 20,
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>
                  Dr. {appointment.doctor?.fullName || 'Unknown Doctor'}
                </h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  background: '#dbeafe',
                  color: '#1d4ed8'
                }}>
                  {appointment.status}
                </span>
              </div>
              
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                <strong>Date & Time:</strong> {formatDateTime(appointment.datetime)}
              </div>
              
              {appointment.doctor?.specialization && (
                <div style={{ color: '#6b7280', fontSize: 14 }}>
                  <strong>Specialization:</strong> {appointment.doctor.specialization}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientUpcomingPage; 