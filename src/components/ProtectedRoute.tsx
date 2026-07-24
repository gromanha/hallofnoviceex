import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminUser } from '../types';

interface ProtectedRouteProps {
  admin: AdminUser | null;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ admin, children }) => {
  if (!admin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
