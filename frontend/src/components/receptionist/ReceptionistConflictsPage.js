import React from 'react';

const ReceptionistConflictsPage = ({ conflicts }) => (
  <div className="container">
    <h2>Receptionist: Conflict Warnings</h2>
    {conflicts.length === 0 ? <div>No conflicts.</div> : (
      <ul>
        {conflicts.map((c, idx) => (
          <li key={idx} style={{ color: 'red' }}>{c.time} - {c.doctor}: {c.message}</li>
        ))}
      </ul>
    )}
  </div>
);
export default ReceptionistConflictsPage; 