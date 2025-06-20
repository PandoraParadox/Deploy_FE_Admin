import React, { createContext, useContext, useState } from 'react';
import { setToken, getToken, removeToken } from '../service/AuthService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(getToken());

  const login = (token) => {
    const { sub } = jwtDecode(token);
    setToken(token);
    setAuthToken(token);
    localStorage.setItem("emailAdmin", sub); 
  };

  const logout = () => {
    removeToken();
    setAuthToken(null);
    localStorage.removeItem("emailAdmin")
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
