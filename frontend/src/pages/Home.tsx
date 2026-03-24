import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Paper, Typography, useTheme } from '@mui/material';

export default function Home() {
  const theme = useTheme();

  const c1 = theme.palette.primary.main;
  const c2 = theme.palette.secondary.main;
  const c3 = theme.palette.info.main;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        px: { xs: 3, md: 7 },
        py: { xs: 4, md: 8 },
        minHeight: { xs: 360, md: 420 },
        background: `linear-gradient(135deg, ${alpha(c1, 0.95)} 0%, ${alpha(
          c3,
          0.85,
        )} 45%, ${alpha(c2, 0.9)} 100%)`,
        color: theme.palette.common.white,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.35,
          background:
            `radial-gradient(circle at 20% 25%, ${alpha(
              theme.palette.common.white,
              0.8,
            )} 0, ${alpha(theme.palette.common.white, 0)} 45%),` +
            `radial-gradient(circle at 78% 30%, ${alpha(
              theme.palette.common.white,
              0.7,
            )} 0, ${alpha(theme.palette.common.white, 0)} 50%),` +
            `radial-gradient(circle at 62% 85%, ${alpha(
              theme.palette.common.white,
              0.6,
            )} 0, ${alpha(theme.palette.common.white, 0)} 55%)`,
        }}
      />

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          maxWidth: 760,
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          bgcolor: alpha(theme.palette.common.white, 0.14),
          border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Typography variant="h3" fontWeight={900} gutterBottom>
          Online Supermarket Management System
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95 }}>
          Customer shopping + staff inventory management.
        </Typography>
        <Typography sx={{ mt: 2, opacity: 0.9, maxWidth: 640 }}>
          Browse products, manage carts and orders, and securely manage inventory with role-based access.
        </Typography>
      </Paper>
    </Box>
  );
}
