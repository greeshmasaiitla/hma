import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  // Clear form on component mount
  useEffect(() => {
    clearForm();
  }, []);

  const clearForm = () => {
    setUsernameOrEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      setUser({ email: data.user.email, role: data.user.role, username: data.user.username });
      clearForm(); // Clear form after successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      // Clear password on error for security
      setPassword('');
    }
  };

  return (
    <div className="container">
      <h2 className="section-title">Login</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 340, margin: '0 auto', background: '#f9fafb', borderRadius: 10, padding: 24, boxShadow: '0 2px 12px rgba(30,64,175,0.06)' }}>
        <label className="form-label" htmlFor="login-username">Username or Email</label>
        <input
          id="login-username"
          type="text"
          value={usernameOrEmail}
          onChange={e => setUsernameOrEmail(e.target.value)}
          placeholder="Enter your username or email"
          autoComplete="off"
          style={{ width: '100%', marginBottom: 16, borderRadius: 8, padding: '8px 12px', border: '1px solid #bbb' }}
        />
        <label className="form-label" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="new-password"
          style={{ width: '100%', marginBottom: 24, borderRadius: 8, padding: '8px 12px', border: '1px solid #bbb' }}
        />
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16 }}>Login</button>
      </form>
    </div>
  );
};

export default Login; 