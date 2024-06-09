// src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link, Navigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      setError('');
      // Redirect to SuccessPage upon successful login
      return <Navigate to="/" />;
    } catch (e) {
      setError('Login failed: ' + e.message);
    }
  };

  // Redirect to SuccessPage if user is already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
