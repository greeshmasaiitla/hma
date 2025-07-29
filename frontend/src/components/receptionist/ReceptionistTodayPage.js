import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../socket';

const ReceptionistTodayPage = ({ appointments }) => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/appointments');
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayAppts = res.data.filter(appointment => {
        const apptDate = new Date(appointment.datetime);
        return apptDate >= today && apptDate < tomorrow;
      }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime)); // Sort by time
      
      setTodayAppointments(todayAppts);
    } catch (err) {
      console.error('Failed to fetch today\'s appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    
    // Listen for real-time updates
    socket.on('appointmentCreated', () => {
      fetchTodayAppointments();
    });
    
    socket.on('appointmentUpdated', () => {
      fetchTodayAppointments();
    });
    
    socket.on('appointmentDeleted', () => {
      fetchTodayAppointments();
    });
    
    socket.on('dashboardUpdate', (update) => {
      if (update.type === 'appointment') {
        fetchTodayAppointments();
      }
    });

    return () => {
      socket.off('appointmentCreated');
      socket.off('appointmentUpdated');
      socket.off('appointmentDeleted');
      socket.off('dashboardUpdate');
    };
  }, []);

  const formatTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return { background: '#dbeafe', color: '#1d4ed8' };
      case 'Completed':
        return { background: '#dcfce7', color: '#166534' };
      case 'Cancelled':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
  <div className="container">
    <h2>Receptionist: Today's Appointments</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading today's appointments...</div>
      ) : todayAppointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <h3>No appointments today</h3>
          <p>There are no appointments scheduled for today.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {todayAppointments.map((appointment, idx) => (
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
                <div>
                  <h3 style={{ margin: 0, color: '#1f2937', marginBottom: 4 }}>
                    {appointment.patient?.name || 'Unknown Patient'}
                  </h3>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>
                    Dr. {appointment.doctor?.name || 'Unknown Doctor'}
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  ...getStatusColor(appointment.status)
                }}>
                  {appointment.status}
                </span>
              </div>
              
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                <strong>Time:</strong> {formatTime(appointment.datetime)}
              </div>
              
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                <strong>Patient:</strong> {appointment.patient?.age || 'N/A'} years, {appointment.patient?.gender || 'N/A'}
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

export default ReceptionistTodayPage; 