import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography, Skeleton
} from '@mui/material';
import {
  ArrowForwardRounded, AttachMoneyRounded, Inventory2Rounded, LocalShippingRounded, ShoppingBagRounded, WarningAmberRounded, WarehouseRounded, Timeline
} from '@mui/icons-material';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import inventoryApi, { InventoryDashboardSummary } from '../services/inventoryApi';
import { toast } from 'react-toastify';

const emptySummary: InventoryDashboardSummary = {
  totalProducts: 0, totalSuppliers: 0, lowStockProducts: 0, totalStockUnits: 0, totalInventoryValue: 0, purchasesInLast30Days: 0,
};

const mockChartData = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

export default function InventoryDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [summary, setSummary] = useState<InventoryDashboardSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setIsLoading(true);
        const data = await inventoryApi.getDashboard();
        if (!ignore) setSummary(data);
      } catch (err: any) {
        if (!ignore) toast.error('Failed to load dashboard overview');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    void load();
    return () => { ignore = true; };
  }, []);

  if (isLoading) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const welcomeName = user?.name?.trim() || 'Admin';
  
  const cards = [
    { label: 'Products in Catalog', value: summary.totalProducts, icon: <Inventory2Rounded />, accent: theme.palette.primary.main, prefix: '' },
    { label: 'Supplier Network', value: summary.totalSuppliers, icon: <LocalShippingRounded />, accent: theme.palette.secondary.main, prefix: '' },
    { label: 'Low Stock Alerts', value: summary.lowStockProducts, icon: <WarningAmberRounded />, accent: theme.palette.warning.main, prefix: '' },
    { label: 'Stock Units', value: summary.totalStockUnits, icon: <WarehouseRounded />, accent: theme.palette.info.main, prefix: '' },
    { label: 'Inventory Value', value: summary.totalInventoryValue, icon: <AttachMoneyRounded />, accent: theme.palette.success.main, prefix: '$', decimals: 2 },
    { label: 'Recent Purchases', value: summary.purchasesInLast30Days, icon: <ShoppingBagRounded />, accent: theme.palette.primary.dark, prefix: '' },
  ];

  return (
    <Box p={3}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card sx={{
          mb: 4, borderRadius: 4, color: 'white',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme.shadows[6]
        }}>
          <CardContent sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 2, fontWeight: 700, opacity: 0.8 }}>DASHBOARD OVERVIEW</Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>Welcome back, {welcomeName}</Typography>
              <Typography sx={{ mt: 1, opacity: 0.9, maxWidth: 600 }}>Here is a snapshot of your supermarket operations. Monitor inventory, track sales trends, and manage alerts.</Typography>
            </Box>
            <Button
              component={RouterLink} to="/inventory/products" variant="contained"
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, borderRadius: 8, px: 3, py: 1.5, fontWeight: 'bold' }}
            >
              View Full Inventory
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {cards.map((card, idx) => (
          <Grid item xs={12} sm={6} lg={4} key={card.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card sx={{ borderRadius: 4, borderLeft: `6px solid ${card.accent}`, boxShadow: theme.shadows[2], '&:hover': { boxShadow: theme.shadows[6], transform: 'translateY(-4px)' }, transition: 'all 0.3s ease' }}>
                <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" variant="button" fontWeight="bold">{card.label}</Typography>
                    <Typography variant="h3" fontWeight="bold" color="text.primary" mt={1}>
                      <CountUp end={card.value} prefix={card.prefix} decimals={card.decimals || 0} duration={2} separator="," />
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: '50%', bgcolor: alpha(card.accent, 0.1), color: card.accent }}>
                    {card.icon}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts & Activity Feed */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: theme.shadows[2] }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Timeline color="primary" />
                  <Typography variant="h5" fontWeight="bold">Weekly Revenue Trends</Typography>
                </Box>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[4] }} />
                      <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: theme.shadows[2] }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>Recent Activity</Typography>
                <Stack spacing={3}>
                  {[
                    { text: 'New order #1023 placed', time: '10 mins ago', color: 'success.main' },
                    { text: 'Low stock alert: Fresh Milk', time: '1 hour ago', color: 'warning.main' },
                    { text: 'Supplier delivery received', time: '3 hours ago', color: 'info.main' },
                    { text: 'Product pricing updated', time: 'Yesterday', color: 'primary.main' }
                  ].map((activity, idx) => (
                    <Box key={idx} display="flex" gap={2} alignItems="center">
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: activity.color }} />
                      <Box>
                        <Typography fontWeight="bold">{activity.text}</Typography>
                        <Typography variant="caption" color="text.secondary">{activity.time}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Button variant="outlined" fullWidth sx={{ mt: 4, borderRadius: 2 }}>View All Logs</Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
