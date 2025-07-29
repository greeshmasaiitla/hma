import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) {
    return <div className="container"><h2 className="section-title">Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }
  return children;
};

export default ProtectedRoute; 