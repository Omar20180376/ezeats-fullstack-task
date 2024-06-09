// src/components/Register.js
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link,Navigate } from 'react-router-dom';
import Parse from '../ParseConfig';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { user, register } = useAuth();
  if (user) {
    return <Navigate to="/" />;
  }
  const handleRegister = async (e) => {
    e.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordPattern.test(password)) {
      setError('Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a number');
      return;
    }

    try {
      await register(email, username, password);
      setError('');
      return <Navigate to="/" />;

    } catch (e) {
      if (e.code === Parse.Error.CONNECTION_FAILED) {
        setError('Network issue, please try again later');
      } else {
        setError('Registration failed: ' + e.message);
      }
    }

  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
};

export default Register;
