import React, { useMemo } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
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

  const activeTab = useMemo(() => {
    const match = inventoryTabs.find((tab) => location.pathname.startsWith(tab.path));
    return match?.path ?? '/inventory/dashboard';
  }, [location.pathname]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Inventory Management
        </Typography>
        <Typography color="text.secondary">
          Manage suppliers, stock purchases, and low-stock monitoring.
        </Typography>
      </Box>

      <Tabs value={activeTab} variant="scrollable" scrollButtons="auto" sx={{ mb: 3 }}>
        {inventoryTabs.map((tab) => (
          <Tab key={tab.path} value={tab.path} label={tab.label} component={RouterLink} to={tab.path} />
        ))}
      </Tabs>

      <Outlet />
    </Box>
  );
}
