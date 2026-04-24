import React, { useMemo } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

const cashierTabs = [
  { label: 'POS Dashboard', path: '/cashier/pos' },
] as const;

export default function CashierLayout() {
  const location = useLocation();

  const activeTab = useMemo(() => {
    const match = cashierTabs.find((tab) => location.pathname.startsWith(tab.path));
    return match?.path ?? '/cashier/pos';
  }, [location.pathname]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Cashier Point of Sale
        </Typography>
        <Typography color="text.secondary">
          Search products quickly and keep checkout work focused in one place.
        </Typography>
      </Box>

      <Tabs value={activeTab} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        {cashierTabs.map((tab) => (
          <Tab key={tab.path} value={tab.path} label={tab.label} component={RouterLink} to={tab.path} />
        ))}
      </Tabs>

      <Outlet />
    </Box>
  );
}
