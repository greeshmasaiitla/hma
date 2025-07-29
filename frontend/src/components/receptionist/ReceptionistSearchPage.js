import React from 'react';

const ReceptionistSearchPage = ({ search }) => (
  <div className="container">
    <h2>Receptionist: Quick Search</h2>
    {Array.isArray(search) && search.length > 0 ? (
      <table style={{ width: '100%', marginBottom: 18, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(30,64,175,0.07)' }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            {search[0] && Object.keys(search[0]).map((key) => (
              <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {search.map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              {Object.values(item).map((val, i) => <td key={i}>{typeof val === 'object' ? JSON.stringify(val) : val}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    ) : <div>No search results.</div>}
  </div>
);
export default ReceptionistSearchPage; 