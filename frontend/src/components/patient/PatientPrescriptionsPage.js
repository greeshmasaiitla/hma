import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../../socket';
import { useUser } from '../UserContext';

const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // Get all prescriptions and filter for current patient
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/patients/my-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Find patient by username instead of email
      const patient = res.data[0]; // Get the first (and only) patient
      
      if (!patient) {
        setPrescriptions([]);
        return;
      }
      
      const prescriptionsRes = await axios.get(`http://localhost:5000/patients/${patient._id}/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPrescriptions(prescriptionsRes.data);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    
    // Listen for real-time updates
    socket.on('prescriptionAdded', (prescription) => {
      // Refresh prescriptions when any prescription is added
      fetchPrescriptions();
    });
    
    socket.on('prescriptionUpdated', (prescription) => {
      // Refresh prescriptions when any prescription is updated
      fetchPrescriptions();
    });
    
    socket.on('prescriptionDeleted', (data) => {
      fetchPrescriptions();
    });
    
    socket.on('dashboardUpdate', (update) => {
      if (update.type === 'prescription') {
        fetchPrescriptions();
      }
    });

    return () => {
      socket.off('prescriptionAdded');
      socket.off('prescriptionUpdated');
      socket.off('prescriptionDeleted');
      socket.off('dashboardUpdate');
    };
  }, [user.username]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="container">
      <h2>Patient: Prescription History</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <h3>No prescriptions found</h3>
          <p>You don't have any prescriptions yet. Prescriptions will appear here after your doctor visits.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {prescriptions.map((prescription, idx) => (
            <div 
              key={prescription._id || idx}
              style={{
                padding: 20,
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>Prescription</h3>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                  background: '#fef3c7',
                  color: '#92400e'
                }}>
                  {formatDate(prescription.date)}
                </span>
              </div>
              
              <div style={{ 
                color: '#374151', 
                fontSize: 14, 
                marginBottom: 12,
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {prescription.notes}
              </div>
              
              <div style={{ 
                color: '#6b7280', 
                fontSize: 12,
                borderTop: '1px solid #e5e7eb',
                paddingTop: 8
              }}>
                <strong>Prescribed by:</strong> {prescription.doctorId?.fullName || prescription.uploadedBy || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptionsPage; 