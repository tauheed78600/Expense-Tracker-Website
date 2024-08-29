// PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children, userId }) => {
  // console.log('PrivateRoute is rendering with userId:', userId);
  const { isAuthenticated } = useContext(AuthContext);
  // console.log("isAuthenticated", isAuthenticated)

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
