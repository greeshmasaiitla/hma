import React from 'react';

const AdminUsersPage = ({ users }) => {
  return (
    <div className="container">
      <h2>Admin: User Management</h2>
      {users.length === 0 ? <div>No users found.</div> : (
        <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
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
export default AdminUsersPage; 