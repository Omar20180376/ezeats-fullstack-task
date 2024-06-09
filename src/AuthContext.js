// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import Parse from './ParseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email, password) => {
    const currentUser = await Parse.User.logIn(email, password);
    setUser(currentUser);
    localStorage.setItem('user', JSON.stringify(currentUser));
  };

  const logout = async () => {
    await Parse.User.logOut();
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (email, username, password) => {
    const user = new Parse.User();
    user.set("username", username);
    user.set("email", email);
    user.set("password", password);

    await user.signUp();

    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
