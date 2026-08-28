// src/components/GuestRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const dashboardPathForRole = (role: string) => {
  if (role === 'admin') return '/admin-dashboard';
  if (role === 'manager' || role === 'it') return '/it-dashboard';
  if (role === 'voucher') return '/voucher-dashboard';
  return '/user-dashboard';
};

/**
 * Inverse of ProtectedRoute: keeps an already-logged-in user off the login
 * page (direct visit, typed URL, or browser back/forward) by bouncing them
 * to their dashboard instead.
 */
const GuestRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading }: any = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    const role = (user.role || '').toLowerCase();
    return <Navigate to={dashboardPathForRole(role)} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
