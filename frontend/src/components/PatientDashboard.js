import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const CARDS = [
  { key: 'health', label: 'Health Summary', icon: '💡', color: '#10b981', route: '/patient/health' },
  { key: 'upcoming', label: 'Upcoming Appointments', icon: '📅', color: '#2563eb', route: '/patient/upcoming' },
  { key: 'history', label: 'Appointment History', icon: '📖', color: '#f59e42', route: '/patient/history' },
  { key: 'prescriptions', label: 'Prescription History', icon: '💊', color: '#a21caf', route: '/patient/prescriptions' },
];

const SimpleProfileMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 200, boxShadow: '0 2px 12px rgba(30,64,175,0.13)', borderRadius: 32, background: '#fff', padding: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <img
          src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'P') + '&background=2563eb&color=fff&size=64'}
          alt="Profile"
          style={{ width: 44, height: 44, borderRadius: '50%', marginRight: 8, border: '2px solid #2563eb', objectFit: 'cover', background: '#f1f5f9' }}
        />
        <span style={{ fontWeight: 600, color: '#2563eb', marginRight: 8 }}>{user?.username}</span>
        <span style={{ fontSize: 20, color: '#2563eb', fontWeight: 700 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 54, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(30,64,175,0.13)', minWidth: 200, padding: 18, marginTop: 8 }}>
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>{user?.username}</div>
          <button 
            onClick={onLogout}
            style={{ 
              width: '100%', 
              padding: '10px 16px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const PatientDashboard = ({ dashboardData }) => {
  const [card, setCard] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  const handleCardClick = (key, route) => {
    if (route) {
      navigate(route);
    } else {
      setCard(prev => (prev === key ? null : key));
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };
  
  if (!dashboardData) return <div>Loading...</div>;
  
  return (
    <div style={{ position: 'relative' }}>
      <SimpleProfileMenu user={user} onLogout={handleLogout} />
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

export default PatientDashboard; 