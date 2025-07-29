import React from 'react';

const AdminDoctorsPage = ({ doctors }) => (
  <div className="container">
    <h2>Admin: Doctors</h2>
    {doctors.length === 0 ? <div>No doctors available. Add your first doctor!</div> : (
      <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Experience</th>
            <th>Qualification</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor, idx) => (
            <tr key={doctor._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td>{doctor.fullName || 'N/A'}</td>
              <td>{doctor.email || 'N/A'}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
export default AdminDoctorsPage; 