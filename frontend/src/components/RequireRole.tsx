import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function normalizeRole(role: unknown): string {
  if (typeof role === 'string') {
    return role;
  }

  if (typeof role === 'number') {
    switch (role) {
      case 0:
        return 'Customer';
      case 1:
        return 'Admin';
      case 2:
        return 'InventoryManager';
      case 3:
        return 'Cashier';
      default:
        return String(role);
    }
  }

  return '';
}

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
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);
  if (!roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
