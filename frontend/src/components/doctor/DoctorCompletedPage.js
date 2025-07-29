import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../socket';

const DoctorCompletedPage = ({ completedAppointments }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/appointments');
      const now = new Date();
      const completed = res.data.filter(appointment => {
        const apptDate = new Date(appointment.datetime);
        return appointment.status === 'Completed' || apptDate < now;
      }).sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); // Sort by date (newest first)
      setAppointments(completed);
    } catch (err) {
      console.error('Failed to fetch completed appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedAppointments();
    
    // Listen for real-time updates
    socket.on('appointmentUpdated', (appointment) => {
      if (appointment.status === 'Completed') {
        fetchCompletedAppointments();
      }
    });
    
    socket.on('dashboardUpdate', (update) => {
      if (update.type === 'appointment') {
        fetchCompletedAppointments();
      }
    });

    return () => {
      socket.off('appointmentUpdated');
      socket.off('dashboardUpdate');
    };
  }, []);

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleString();
  };

  return (
  <div className="container">
    <h2>Doctor: Completed Appointments</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading completed appointments...</div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <h3>No completed appointments</h3>
          <p>Completed appointments will appear here after you mark them as completed.</p>
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
                  {appointment.patient?.name || 'Unknown Patient'}
                </h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  background: '#dcfce7',
                  color: '#166534'
                }}>
                  Completed
                </span>
              </div>
              
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                <strong>Date & Time:</strong> {formatDateTime(appointment.datetime)}
              </div>
              
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                <strong>Patient Age:</strong> {appointment.patient?.age || 'N/A'} | 
                <strong> Gender:</strong> {appointment.patient?.gender || 'N/A'}
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

export default DoctorCompletedPage; 