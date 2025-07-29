import React from 'react';

const ReceptionistDoctorsPage = ({ doctors }) => (
  <div className="container">
    <h2>Receptionist: Doctor Management</h2>
    {doctors.length === 0 ? <div>No doctors available. Please contact admin.</div> : (
      <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Experience</th>
            <th>Qualification</th>
            <th>Status</th>
            <th>Available Slots</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor, idx) => (
            <tr key={doctor._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td>{doctor.fullName || 'N/A'}</td>
              <td>{doctor.specialization || 'N/A'}</td>
              <td>{doctor.experience ? `${doctor.experience} years` : 'N/A'}</td>
              <td>{doctor.qualification || 'N/A'}</td>
              <td>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  background: doctor.available ? '#dcfce7' : '#fef2f2',
                  color: doctor.available ? '#166534' : '#dc2626'
                }}>
                  {doctor.available ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td>
                {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: '#dbeafe',
                    color: '#1e40af'
                  }}>
                    {doctor.availableSlots.length} slots available
                  </span>
                ) : (
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: '#fef3c7',
                    color: '#92400e'
                  }}>
                    All slots booked
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
export default ReceptionistDoctorsPage; 