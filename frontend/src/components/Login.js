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
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-wrapper">
          <h2 className="login-title">Hospital Management System</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <label className="form-label" htmlFor="login-username">Username or Email</label>
            <input
              id="login-username"
              type="text"
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              placeholder="Enter your username or email"
              autoComplete="off"
              className="login-input"
            />
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="new-password"
              className="login-input"
            />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 