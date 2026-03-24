import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../utils/role';

export default function RequireRole({
  roles,
  children,
}: {
  roles: string[];
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/start" replace />;
  }

  const role = normalizeRole(user.role);
  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
