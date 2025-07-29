import React from 'react';

const AdminAppointmentsPage = ({ appointments }) => (
  <div className="container">
    <h2>Admin: Appointments</h2>
    {appointments.length === 0 ? <div>No appointments available. Add your first appointment!</div> : (
      <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date & Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, idx) => (
            <tr key={appointment._id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td>{appointment.patient?.fullName || 'Unknown Patient'}</td>
              <td>{appointment.doctor?.fullName || 'Unknown Doctor'}</td>
              <td>{new Date(appointment.datetime).toLocaleString()}</td>
              <td>{appointment.status || 'Scheduled'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
export default AdminAppointmentsPage; 