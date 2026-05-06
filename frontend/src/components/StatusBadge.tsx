import React from 'react';
import { Chip, useTheme, alpha } from '@mui/material';

interface StatusBadgeProps {
  status: string;
  type?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  const theme = useTheme();

  let color: 'success' | 'warning' | 'error' | 'info' | 'default' = type || 'default';

  if (!type) {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('active') || lowerStatus.includes('delivered') || lowerStatus.includes('paid') || lowerStatus.includes('completed') || lowerStatus.includes('received')) {
      color = 'success';
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('processing') || lowerStatus.includes('low') || lowerStatus.includes('shipped')) {
      color = 'warning';
    } else if (lowerStatus.includes('inactive') || lowerStatus.includes('cancelled') || lowerStatus.includes('failed') || lowerStatus.includes('out of stock')) {
      color = 'error';
    } else {
      color = 'info';
    }
  }

  const getColors = () => {
    switch (color) {
      case 'success':
        return {
          bg: alpha(theme.palette.success.main, 0.1),
          text: theme.palette.success.dark,
          border: alpha(theme.palette.success.main, 0.2),
        };
      case 'warning':
        return {
          bg: alpha(theme.palette.warning.main, 0.1),
          text: theme.palette.warning.dark,
          border: alpha(theme.palette.warning.main, 0.2),
        };
      case 'error':
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          text: theme.palette.error.dark,
          border: alpha(theme.palette.error.main, 0.2),
        };
      case 'info':
        return {
          bg: alpha(theme.palette.primary.main, 0.1),
          text: theme.palette.primary.dark,
          border: alpha(theme.palette.primary.main, 0.2),
        };
      default:
        return {
          bg: theme.palette.grey[100],
          text: theme.palette.grey[800],
          border: theme.palette.grey[300],
        };
    }
  };

  const colors = getColors();

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        px: 1,
      }}
    />
  );
};

export default StatusBadge;
