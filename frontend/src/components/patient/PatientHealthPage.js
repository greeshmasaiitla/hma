import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../UserContext';

const PatientHealthPage = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/patients/my-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.data && res.data.length > 0) {
        setPatient(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  if (loading) {
    return <div className="container">Loading health summary...</div>;
  }

  return (
    <div className="container">
      <h2>Patient: Health Summary</h2>
      {patient && patient.healthSummary ? (
        <div style={{ 
          background: '#f8fafc', 
          padding: 24, 
          borderRadius: 12, 
          border: '1px solid #e2e8f0',
          marginTop: 16
        }}>
          <h3 style={{ marginBottom: 16, color: '#1e293b' }}>Health Summary</h3>
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6, 
            color: '#475569',
            fontSize: 16
          }}>
            {patient.healthSummary}
          </div>
          <div style={{ 
            marginTop: 16, 
            fontSize: 14, 
            color: '#64748b',
            fontStyle: 'italic'
          }}>
            Last updated: {new Date(patient.updatedAt || patient.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: 40, 
          color: '#64748b',
          background: '#f8fafc',
          borderRadius: 12,
          marginTop: 16
        }}>
          <h3>No Health Summary Available</h3>
          <p>Your doctor hasn't added any health summary yet. This will be updated when your doctor adds notes during appointments.</p>
        </div>
      )}
    </div>
  );
};

export default PatientHealthPage; 