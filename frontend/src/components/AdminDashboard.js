import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const CARDS = [
  { key: 'appointments', label: 'Appointments', color: '#2563eb', icon: '📅', route: '/admin/appointments' },
  { key: 'patients', label: 'Patients', color: '#10b981', icon: '🧑‍🤝‍🧑', route: '/admin/patients' },
  { key: 'doctors', label: 'Doctors', color: '#f59e42', icon: '🩺', route: '/admin/doctors' },
  { key: 'receptionists', label: 'Receptionists', color: '#6366f1', icon: '👩‍💼', route: '/admin/receptionists' },
  { key: 'users', label: 'User Management', color: '#0ea5e9', icon: '👤', route: '/admin/users' },
  { key: 'logs', label: 'Logs & Audit Trail', color: '#f43f5e', icon: '📝', route: '/admin/logs' },
  { key: 'config', label: 'System Config', color: '#a21caf', icon: '⚙️', route: '/admin/config' },
  { key: 'manageDoctors', label: 'Manage Doctors', color: '#a21caf', icon: '🗂️', route: '/admin/manage-doctors' },
];
const AdminDashboard = ({ dashboardData }) => {
  const [card, setCard] = useState(null); // Start with no card selected
  const navigate = useNavigate();

  React.useEffect(() => {
    // No detail state needed
  }, [card, dashboardData]);

  // Defensive check for metrics (after hooks)
  if (!dashboardData || !dashboardData.metrics) return <div>Loading...</div>;
  const { metrics } = dashboardData;

  const handleCardClick = (key, route) => {
    if (route) {
      navigate(route);
    } else {
      setCard(prev => (prev === key ? null : key));
    }
  };
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
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {(() => {
                if (c.key === 'appointments') return metrics.totalAppointments;
                if (c.key === 'patients') return metrics.totalPatients;
                if (c.key === 'doctors') return metrics.totalDoctors;
                if (c.key === 'receptionists') return metrics.activeReceptionists;
                return '';
              })()}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminDashboard; 