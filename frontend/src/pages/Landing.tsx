import React from 'react';
import { alpha } from '@mui/material/styles';
import { Box, Button, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();

  const blue = theme.palette.info.light;
  const orange = theme.palette.warning.light;
  const pink = theme.palette.secondary.light;
  const surface = theme.palette.background.paper;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        py: { xs: 4, md: 10 },
        px: { xs: 2, md: 4 },
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(circle at 15% 20%, ${alpha(blue, 0.55)} 0%, transparent 55%),` +
            `radial-gradient(circle at 85% 25%, ${alpha(pink, 0.45)} 0%, transparent 60%),` +
            `radial-gradient(circle at 55% 90%, ${alpha(orange, 0.35)} 0%, transparent 60%),` +
            `linear-gradient(135deg, ${alpha(blue, 0.18)} 0%, ${alpha(pink, 0.12)} 45%, ${alpha(
              orange,
              0.14,
            )} 100%)`,
          filter: 'saturate(1.15)',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: -200,
          opacity: 0.55,
          background:
            `conic-gradient(from 180deg at 50% 50%, ${alpha(
              blue,
              0.18,
            )} 0deg, ${alpha(pink, 0.18)} 120deg, ${alpha(orange, 0.18)} 240deg, ${alpha(
              blue,
              0.18,
            )} 360deg)`,
          transform: 'rotate(-12deg)',
          filter: 'blur(24px)',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.14,
          background:
            `repeating-linear-gradient(135deg, ${alpha(
              theme.palette.common.white,
              0.9,
            )} 0px, ${alpha(theme.palette.common.white, 0.9)} 1px, transparent 1px, transparent 14px)`,
          mixBlendMode: 'soft-light',
        }}
      />

      <Card
        sx={{
          width: '100%',
          maxWidth: 940,
          borderRadius: 4,
          boxShadow: 10,
          bgcolor: alpha(surface, 0.78),
          border: `1px solid ${alpha(theme.palette.common.white, 0.5)}`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Online Supermarket Management System
              </Typography>
              <Typography color="text.secondary">
                Customers can shop online. Admin/staff can manage inventory.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.common.white, 0.6),
                  borderColor: alpha(theme.palette.common.white, 0.7),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={700}>
                      Customer
                    </Typography>
                    <Typography color="text.secondary">
                      Browse products, add items to cart, checkout, and track orders.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button variant="contained" onClick={() => navigate('/register')}>
                        Sign Up
                      </Button>
                      <Button variant="outlined" onClick={() => navigate('/login')}>
                        Login
                      </Button>
                      <Button variant="text" onClick={() => navigate('/shop')}>
                        Browse
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.common.white, 0.6),
                  borderColor: alpha(theme.palette.common.white, 0.7),
                  backdropFilter: 'blur(10px)',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={700}>
                      Admin / Staff
                    </Typography>
                    <Typography color="text.secondary">
                      Inventory management (product CRUD). Staff accounts are created via promotion/invite.
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button variant="contained" color="secondary" onClick={() => navigate('/admin/login')}>
                        Admin Login
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={() => navigate('/admin/register')}>
                        Admin Sign Up
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
