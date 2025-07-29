import React from 'react';

const AuditLog = ({ log }) => (
  <div className="container">
    <h2 className="section-title">Audit Log</h2>
    {log.length === 0 ? (
      <div style={{ color: '#888', padding: 12 }}>No audit log entries</div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 900 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ textAlign: 'left', padding: 10 }}>Action</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Entity</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Details</th>
            <th style={{ textAlign: 'left', padding: 10 }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {log.map((entry, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 10 }}>{entry.action}</td>
              <td style={{ padding: 10 }}>{entry.entity}</td>
              <td style={{ padding: 10 }}>{entry.details}</td>
              <td style={{ padding: 10, color: '#888', fontSize: 13 }}>{entry.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default AuditLog; 