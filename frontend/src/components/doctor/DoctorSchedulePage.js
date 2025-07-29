import React from 'react';

const DoctorSchedulePage = ({ appointments }) => (
  <div className="container">
    <h2>Doctor: Daily Schedule</h2>
    <div style={{ color: '#888', marginBottom: 12 }}><b>View-only:</b> For changes, please contact the receptionist or admin.</div>
    {appointments.length === 0 ? <div>No appointments scheduled. Check with the receptionist for new appointments.</div> : (
      <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            {appointments[0] && Object.keys(appointments[0]).map((key) => (
              <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              {Object.values(item).map((val, i) => <td key={i}>{typeof val === 'object' ? JSON.stringify(val) : val}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
export default DoctorSchedulePage; 