// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardPathForRole } from '../utils/roles';
import MuriLoader from './common/MuriLoader';

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
    return <MuriLoader label="Checking your session…" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess(requiredRoles)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
