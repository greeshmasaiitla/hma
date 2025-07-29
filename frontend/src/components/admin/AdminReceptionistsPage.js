import React from 'react';

const AdminReceptionistsPage = ({ users }) => {
  const receptionists = users.filter(u => u.role === 'receptionist');
  return (
    <div className="container">
      <h2>Admin: Receptionists</h2>
      {receptionists.length === 0 ? <div>No receptionists found.</div> : (
        <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {receptionists.map((u, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default AdminReceptionistsPage; 