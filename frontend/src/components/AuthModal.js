import React, { useState } from 'react';
import axios from 'axios';
import './AuthModal.css';

const API = 'http://localhost:8080/api/user-auth';

const AuthModal = ({ action, onClose, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API}/login`, { email, password });
        // Expecting token in response body (adjust if needed)
        const token = res.data.token || (typeof res.data === 'string' && res.data.match(/Token: (.+)$/)?.[1]);
        if (token) {
          localStorage.setItem('jwt', token);
          onAuth();
        } else {
          setError('Login succeeded but no token received.');
        }
      } else {
        await axios.post(`${API}/register`, { fullName, email, password });
        setIsLogin(true);
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{isLogin ? 'Login' : 'Sign Up'} to {action}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="auth-submit-btn" type="submit" disabled={loading}>{loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}</button>
        </form>
        {error && <div className="auth-error">{error}</div>}
        <div className="auth-toggle">
          {isLogin ? (
            <span>Don't have an account? <button type="button" onClick={() => { setIsLogin(false); setError(''); }}>Sign Up</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={() => { setIsLogin(true); setError(''); }}>Login</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 