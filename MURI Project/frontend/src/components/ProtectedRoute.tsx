// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = ['*']
}) => {
  const { user, loading, hasAccess }: any = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess(requiredRoles)) {
    const role = (user.role || '').toLowerCase();
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (role === 'manager' || role === 'it') {
      return <Navigate to="/it-dashboard" replace />;
    } else if (role === 'voucher') {
      return <Navigate to="/voucher-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
