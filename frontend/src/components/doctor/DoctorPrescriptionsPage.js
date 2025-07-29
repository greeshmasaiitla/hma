import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../UserContext';

const PrescriptionModal = ({ patient, onClose, onPrescriptionAdded }) => {
  const [notes, setNotes] = useState('');
  const [healthSummary, setHealthSummary] = useState(patient.healthSummary || '');
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/patients/${patient._id}/prescriptions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPrescriptions(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [patient._id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/patients/${patient._id}/prescriptions`, {
        notes,
        healthSummary: healthSummary.trim() || undefined
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPrescriptions([res.data, ...prescriptions]);
      setNotes('');
      toast.success('Prescription added successfully!');
      if (onPrescriptionAdded) onPrescriptionAdded();
    } catch (err) {
      toast.error('Failed to add prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 500, maxWidth: 700, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 2px 16px rgba(30,64,175,0.18)' }}>
        <h3 style={{ marginBottom: 20 }}>Manage Patient: {patient.fullName}</h3>
        
        <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Health Summary:</label>
            <textarea
              value={healthSummary}
              onChange={e => setHealthSummary(e.target.value)}
              placeholder="Enter patient's health summary, medical history, allergies..."
              rows={3}
              style={{ width: '100%', borderRadius: 8, padding: 12, border: '1px solid #bbb', fontSize: 14 }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>New Prescription:</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Enter prescription details, medications, dosage, instructions..."
              rows={4}
              style={{ width: '100%', borderRadius: 8, padding: 12, border: '1px solid #bbb', fontSize: 14 }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              type="submit" 
              disabled={submitting || !notes.trim()} 
              style={{ padding: '10px 20px', borderRadius: 8, background: '#2563eb', color: 'white', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer' }}
            >
              {submitting ? 'Adding...' : 'Add Prescription'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 8, background: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </form>

        <div>
          <h4 style={{ marginBottom: 16 }}>Prescription History:</h4>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>Loading prescriptions...</div>
          ) : error ? (
            <div style={{ color: 'red', padding: 20 }}>{error}</div>
          ) : prescriptions.length === 0 ? (
            <div style={{ color: '#888', padding: 20, textAlign: 'center' }}>No prescriptions for this patient.</div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {prescriptions.map((p, idx) => (
                <div key={p._id || idx} style={{ 
                  marginBottom: 16, 
                  padding: 16, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8, 
                  background: '#f9fafb' 
                }}>
                  <div style={{ fontSize: 15, marginBottom: 8, fontWeight: 500 }}>{p.notes}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    By: {p.uploadedBy || 'N/A'} | {new Date(p.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DoctorPrescriptionsPage = ({ prescriptions }) => {
  const [patients, setPatients] = useState([]);
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalPatient, setModalPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const { user } = useUser();

  // Fetch ALL patients for the main list/search
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/patients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPatients(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Fetch ASSIGNED patients for the dropdown
  useEffect(() => {
    const fetchAssignedPatients = async () => {
      if (!user || !user.username) {
        setAssignedPatients([]);
        return;
      }
      
      try {
        // Get doctor's ID from backend using username
        const token = localStorage.getItem('token');
        const doctorsRes = await axios.get('http://localhost:5000/doctors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Try different matching strategies
        let doctor = doctorsRes.data.find(d => d.fullName.toLowerCase().replace(/\s+/g, '') === user.username);
        if (!doctor) {
          // Try matching without spaces
          doctor = doctorsRes.data.find(d => d.fullName.toLowerCase().replace(/\s+/g, '') === user.username.toLowerCase().replace(/\s+/g, ''));
        }
        if (!doctor) {
          // Try exact match
          doctor = doctorsRes.data.find(d => d.fullName === user.username);
        }
        
        if (!doctor) {
          setAssignedPatients([]);
          return;
        }

        // Fetch appointments for this doctor
        const appointmentsRes = await axios.get('http://localhost:5000/appointments', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fix: Handle both populated and unpopulated doctor data
        const doctorAppointments = appointmentsRes.data.filter(apt => {
          if (apt.doctor && typeof apt.doctor === 'object' && apt.doctor._id) {
            // If doctor is populated object, compare _id
            return apt.doctor._id === doctor._id;
          } else {
            // If doctor is just an ID string
            return apt.doctor === doctor._id;
          }
        });

        // Get unique patient IDs from doctor's appointments
        const patientIds = [...new Set(doctorAppointments.map(apt => {
          if (apt.patient && typeof apt.patient === 'object' && apt.patient._id) {
            // If patient is populated object, get _id
            return apt.patient._id;
          } else {
            // If patient is just an ID string
            return apt.patient;
          }
        }))];
        
        // Get assigned patients
        const patientsRes = await axios.get('http://localhost:5000/patients', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const assigned = patientsRes.data.filter(patient => patientIds.includes(patient._id));
        
        setAssignedPatients(assigned);
      } catch (err) {
        console.error('Error fetching assigned patients:', err);
        setAssignedPatients([]);
      }
    };
    fetchAssignedPatients();
  }, [user, patients]);

  // Listen for real-time updates
  useEffect(() => {
    const handlePrescriptionUpdate = () => {
      // Refresh patients list when prescriptions are updated
      const fetchPatients = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/patients', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setPatients(res.data);
        } catch (err) {
          console.error('Failed to refresh patients:', err);
        }
      };
      fetchPatients();
    };

    // Listen for socket events
    const socket = window.socket;
    if (socket) {
      socket.on('prescriptionAdded', handlePrescriptionUpdate);
      socket.on('prescriptionUpdated', handlePrescriptionUpdate);
      socket.on('dashboardUpdate', (update) => {
        if (update.type === 'prescription') {
          handlePrescriptionUpdate();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('prescriptionAdded', handlePrescriptionUpdate);
        socket.off('prescriptionUpdated', handlePrescriptionUpdate);
        socket.off('dashboardUpdate');
      }
    };
  }, []);

  const handlePatientSelect = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    if (patient) {
      setModalPatient(patient);
      setSelectedPatient(''); // Clear selected patient from dropdown
    }
  };

  const filteredPatients = assignedPatients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrescriptionAdded = () => {
    // Prescription added successfully
  };

  if (loading) return <div className="container">Loading patients...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <h2>Doctor: Prescription Management</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Add and manage prescriptions for your assigned patients. Select a patient to view their prescription history and add new prescriptions.
      </p>

      {/* Quick Patient Selection */}
      <div style={{ marginBottom: 20, padding: 20, background: '#f8fafc', borderRadius: 8 }}>
        <h4 style={{ marginBottom: 12 }}>Quick Patient Selection:</h4>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 6, 
              border: '1px solid #d1d5db',
              fontSize: 14,
              minWidth: 200
            }}
          >
            <option value="">Select a patient...</option>
            {assignedPatients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.fullName} ({patient.age} years, {patient.gender})
              </option>
            ))}
          </select>
          <button
            onClick={() => handlePatientSelect(selectedPatient)}
            disabled={!selectedPatient}
            style={{ 
              padding: '8px 16px', 
              background: selectedPatient ? '#2563eb' : '#9ca3af', 
              color: 'white', 
              border: 'none', 
              borderRadius: 6,
              cursor: selectedPatient ? 'pointer' : 'not-allowed',
              fontSize: 14
            }}
          >
            Manage Patient
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search your assigned patients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px 16px', 
            borderRadius: 8, 
            border: '1px solid #d1d5db',
            fontSize: 16
          }}
        />
      </div>

      {modalPatient && (
        <PrescriptionModal 
          patient={modalPatient} 
          onClose={() => setModalPatient(null)}
          onPrescriptionAdded={handlePrescriptionAdded}
        />
      )}

      {filteredPatients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filteredPatients.map((patient) => (
            <div 
              key={patient._id} 
              style={{ 
                padding: 20, 
                border: '1px solid #e5e7eb', 
                borderRadius: 12, 
                background: '#fff',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                ':hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
              }}
              onClick={() => setModalPatient(patient)}
            >
              <h3 style={{ marginBottom: 8, color: '#1f2937' }}>{patient.fullName}</h3>
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>
                Age: {patient.age} | Gender: {patient.gender}
              </div>
              {patient.healthSummary && (
                <div style={{ 
                  fontSize: 12, 
                  color: '#6b7280', 
                  marginBottom: 12,
                  padding: 8,
                  background: '#f3f4f6',
                  borderRadius: 4
                }}>
                  <strong>Health Summary:</strong> {patient.healthSummary.substring(0, 100)}
                  {patient.healthSummary.length > 100 && '...'}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <button 
                  style={{ 
                    padding: '8px 16px', 
                    background: '#2563eb', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  Manage Prescriptions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionsPage; 