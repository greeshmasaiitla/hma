import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const CARDS = [
  { key: 'schedule', label: 'Daily Schedule', icon: '📅', color: '#2563eb', route: '/doctor/schedule' },
  { key: 'patients', label: 'Assigned Patients', icon: '🧑‍🤝‍🧑', color: '#10b981', route: '/doctor/patients' },
  { key: 'completed', label: 'Completed Appointments', icon: '✅', color: '#f59e42', route: '/doctor/completed' },
  { key: 'prescriptions', label: 'Manage Prescriptions', icon: '💊', color: '#a21caf', route: '/doctor/prescriptions' },
];
const DoctorDashboard = ({ dashboardData }) => {
  const [card, setCard] = useState(null);
  const navigate = useNavigate();
  const handleCardClick = (key, route) => {
    if (route) {
      navigate(route);
    } else {
      setCard(prev => (prev === key ? null : key));
    }
  };
  if (!dashboardData) return <div>Loading...</div>;
  return (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
        {CARDS.map(c => (
          <div
            key={c.key}
            onClick={() => handleCardClick(c.key, c.route)}
            style={{
              cursor: 'pointer',
              background: c.color,
              color: '#fff',
              borderRadius: 16,
              padding: 28,
              minWidth: 200,
              minHeight: 120,
              flex: 1,
              boxShadow: card === c.key ? `0 0 0 4px ${c.color}55` : '0 1px 4px rgba(30,64,175,0.07)',
              border: card === c.key ? '3px solid #fff' : 'none',
              outline: card === c.key ? `2px solid ${c.color}` : 'none',
              transition: 'box-shadow 0.2s, outline 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DoctorDashboard; 