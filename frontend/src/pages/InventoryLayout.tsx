import React, { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, CardContent, Stack, Tab, Tabs, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

const inventoryTabs = [
  { label: 'Dashboard', path: '/inventory/dashboard' },
  { label: 'Inventory', path: '/inventory/products' },
  { label: 'Suppliers', path: '/inventory/suppliers' },
  { label: 'Stock Purchase', path: '/inventory/purchases' },
  { label: 'Low Stock', path: '/inventory/low-stock' },
] as const;

export default function InventoryLayout() {
  const location = useLocation();
  const theme = useTheme();

  const activeTab = useMemo(() => {
    const match = inventoryTabs.find((tab) => location.pathname.startsWith(tab.path));
    return match?.path ?? '/inventory/dashboard';
  }, [location.pathname]);

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 5,
          overflow: 'hidden',
          background:
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(
              theme.palette.secondary.main,
              0.12,
            )} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '0.2em', fontWeight: 700 }}>
                Operations Workspace
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                Inventory Management
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
                Manage suppliers, stock purchases, product availability, and low-stock monitoring
                from one responsive control panel.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 0.75,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.common.white, 0.74),
                border: `1px solid ${alpha(theme.palette.common.white, 0.88)}`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <Tabs
                value={activeTab}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 52,
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {inventoryTabs.map((tab) => (
                  <Tab
                    key={tab.path}
                    value={tab.path}
                    label={tab.label}
                    component={RouterLink}
                    to={tab.path}
                    sx={{
                      minHeight: 44,
                      borderRadius: 999,
                      textTransform: 'none',
                      fontWeight: 700,
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: theme.palette.common.white,
                        bgcolor: theme.palette.primary.main,
                        boxShadow: '0 12px 24px rgba(25, 118, 210, 0.22)',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Outlet />
    </Stack>
  );
}
