import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../socket';
import { useUser } from '../UserContext';

const PatientHistoryPage = () => {
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
      
      // Find patient by username
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
      
      // Filter for past appointments (past dates or completed status)
      const now = new Date();
      const past = patientAppointments.filter(appointment => {
        const apptDate = new Date(appointment.datetime);
        return apptDate < now || appointment.status === 'Completed';
      }).sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); // Sort by date (newest first)
      
      setAppointments(past);
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
      <h2>Patient: Appointment History</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading appointment history...</div>
      ) : appointments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <h3>No appointment history</h3>
          <p>You don't have any past appointments yet.</p>
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
                  ...getStatusColor(appointment.status)
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

export default PatientHistoryPage; 