// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import SuccessPage from './components/SuccessPage';
import PostList from './components/post/PostList';
 

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PostList />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
