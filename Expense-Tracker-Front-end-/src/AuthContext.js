// AuthContext.js
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const login = (userId, accessToken) => {
    setIsAuthenticated(true);
    setUserId(userId);
    setAccessToken(accessToken);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
