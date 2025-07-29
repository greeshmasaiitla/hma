import React from 'react';

const AdminConfigPage = ({ config }) => {
  return (
    <div className="container">
      <h2>Admin: System Configuration</h2>
      {Object.keys(config).length === 0 ? <div>No config found.</div> : (
        <ul style={{ background: '#f1f5f9', borderRadius: 10, padding: 20, maxWidth: 400 }}>
          {Object.entries(config).map(([key, value]) => (
            <li key={key}><b>{key}:</b> {Array.isArray(value) ? value.join(', ') : value.toString()}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default AdminConfigPage; 