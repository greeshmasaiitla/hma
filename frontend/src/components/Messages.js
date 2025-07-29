import React, { useState, useRef, useEffect } from 'react';

const roles = ['Admin', 'Doctor', 'Receptionist'];

const Messages = () => {
  const [messages, setMessages] = useState([
    { sender: 'Admin', text: 'Welcome to the staff chat!', time: '09:00' },
    { sender: 'Doctor', text: 'Good morning! Any urgent cases today?', time: '09:01' },
    { sender: 'Receptionist', text: 'One new patient for Dr. Anjali Bhatt at 10:00.', time: '09:02' },
  ]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState('Admin');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = new Date();
    setMessages(msgs => [
      ...msgs,
      {
        sender: role,
        text: input,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInput('');
  };

  return (
    <div className="container">
      <h2 className="section-title">Staff Chat</h2>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#f9fafb', borderRadius: 10, padding: 18, minHeight: 320, boxShadow: '0 2px 12px rgba(30,64,175,0.06)', marginBottom: 24 }}>
        <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 12 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === role ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              <div style={{ background: msg.sender === role ? '#2563eb' : '#e5e7eb', color: msg.sender === role ? '#fff' : '#222', borderRadius: 16, padding: '8px 16px', maxWidth: 340, wordBreak: 'break-word', fontSize: 15 }}>
                <b style={{ fontWeight: 600 }}>{msg.sender}:</b> {msg.text}
              </div>
              <span style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{msg.time}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ borderRadius: 8, padding: '6px 10px', border: '1px solid #bbb' }}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, borderRadius: 8, padding: '8px 12px', border: '1px solid #bbb' }}
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default Messages; 