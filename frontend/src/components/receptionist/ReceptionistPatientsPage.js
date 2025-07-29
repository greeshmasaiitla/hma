import React from 'react';

const ReceptionistPatientsPage = ({ patients }) => {
  return (
    <div className="container">
      <h2>Receptionist: Patient Management</h2>
      {patients.length === 0 ? <div>No patients available. Register your first patient!</div> : (
        <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Health Summary</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, idx) => (
              <tr key={patient._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td>{patient.fullName || 'N/A'}</td>
                <td>{patient.age || 'N/A'}</td>
                <td>{patient.gender || 'N/A'}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {patient.healthSummary ? 
                    (patient.healthSummary.length > 50 ? 
                      `${patient.healthSummary.substring(0, 50)}...` : 
                      patient.healthSummary
                    ) : 
                    'No health summary available'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ReceptionistPatientsPage; 