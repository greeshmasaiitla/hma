import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const CARDS = [
  { key: 'today', label: "Today's Appointments", icon: '📅', color: '#2563eb', route: '/receptionist/today' },
  { key: 'search', label: 'Quick Search', icon: '🔍', color: '#0ea5e9', route: '/receptionist/search' },
  { key: 'conflicts', label: 'Conflict Warnings', icon: '⚠️', color: '#f43f5e', route: '/receptionist/conflicts' },
  { key: 'patients', label: 'View Patients', icon: '🧑‍🤝‍🧑', color: '#10b981', route: '/receptionist/patients' },
  { key: 'managePatients', label: 'Manage Patients', icon: '📝', color: '#0ea5e9', route: '/receptionist/manage-patients' },
  { key: 'doctors', label: 'Doctor Management', icon: '🩺', color: '#f59e42', route: '/receptionist/doctors' },
  { key: 'manageAppointments', label: 'Manage Appointments', icon: '🗂️', color: '#a21caf', route: '/receptionist/manage-appointments' },
];
const ReceptionistDashboard = ({ dashboardData }) => {
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
export default ReceptionistDashboard; 