import React from 'react';

const Notifications = ({ notifications, onMarkAllRead }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container">
      <h2 className="section-title">Notifications {unreadCount > 0 && <span style={{color:'#ef4444', fontSize:18}}>({unreadCount} unread)</span>}</h2>
      {notifications.length === 0 ? (
        <div style={{ color: '#888', padding: 12 }}>No notifications</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: 600 }}>
          {notifications.map((n, idx) => (
            <li key={idx} style={{ padding: 14, background: n.read ? 'transparent' : '#f1f5f9', borderRadius: 8, marginBottom: 10, boxShadow: n.read ? 'none' : '0 1px 4px rgba(30,64,175,0.07)' }}>
              <div style={{ fontWeight: n.read ? 400 : 700 }}>{n.message}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{n.time}</div>
            </li>
          ))}
        </ul>
      )}
      {unreadCount > 0 && (
        <button onClick={onMarkAllRead} style={{ marginTop: 18, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 15 }}>Mark all as read</button>
      )}
    </div>
  );
};

export default Notifications; 