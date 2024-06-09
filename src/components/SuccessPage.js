// SuccessPage.js
import React from 'react';
import { useAuth } from '../AuthContext';
import {Navigate, useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const {user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) {
    return <Navigate to="/" />;
  }
  const handleLogout = async () => {
    await logout();
    // Redirect to login page after logout
    navigate('/');
  };

  return (
    <div>
      <h2>Success</h2>
      <p>Congratulations! You have successfully logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default SuccessPage;
