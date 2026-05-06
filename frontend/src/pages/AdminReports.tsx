import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Card, CardContent, CircularProgress, FormControl, Grid, InputLabel, MenuItem,
  Select, Stack, TextField, Typography, useTheme, alpha
} from '@mui/material';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import adminReportsApi, { AdminReportsQuery, DailySalesReport, MonthlyRevenueReport, OrderSummaryReport, TopSellingProductsReport } from '../services/adminReportsApi';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function toIsoDate(date: Date) { return date.toISOString().slice(0, 10); }

export default function AdminReports() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rangeStart, setRangeStart] = useState(searchParams.get('startDate') ?? toIsoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [rangeEnd, setRangeEnd] = useState(searchParams.get('endDate') ?? toIsoDate(new Date()));
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [paymentMethod, setPaymentMethod] = useState(searchParams.get('paymentMethod') ?? '');
  const [customer, setCustomer] = useState(searchParams.get('customer') ?? '');
  const [topN, setTopN] = useState(Number(searchParams.get('topN') ?? '10') || 10);
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue'>(searchParams.get('sortBy') === 'revenue' ? 'revenue' : 'quantity');

  const [dailySales, setDailySales] = useState<DailySalesReport | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProductsReport | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const chartPalette = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.warning.main, theme.palette.info.main, theme.palette.success.main, theme.palette.error.main];

  const commonQuery = useMemo<AdminReportsQuery>(() => ({ startDate: rangeStart, endDate: rangeEnd, category: category || undefined, paymentMethod: paymentMethod || undefined, customer: customer || undefined }), [category, customer, paymentMethod, rangeEnd, rangeStart]);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('startDate', rangeStart); p.set('endDate', rangeEnd);
    if (category) p.set('category', category);
    if (paymentMethod) p.set('paymentMethod', paymentMethod);
    if (customer) p.set('customer', customer);
    if (topN !== 10) p.set('topN', String(topN));
    if (sortBy !== 'quantity') p.set('sortBy', sortBy);
    setSearchParams(p, { replace: true });
  }, [category, customer, paymentMethod, rangeEnd, rangeStart, setSearchParams, sortBy, topN]);

  const loadReports = useCallback(async () => {
    if (rangeStart > rangeEnd) { toast.error('Start date must be before end date.'); return; }
    try {
      setIsLoading(true);
      const [d, m, t, o] = await Promise.all([
        adminReportsApi.getDailySales(commonQuery),
        adminReportsApi.getMonthlyRevenue(commonQuery),
        adminReportsApi.getTopProducts({ ...commonQuery, topN, sortBy }),
        adminReportsApi.getOrderSummary(commonQuery),
      ]);
      setDailySales(d); setMonthlyRevenue(m); setTopProducts(t); setOrderSummary(o);
    } catch {
      toast.error('Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, [commonQuery, rangeEnd, rangeStart, sortBy, topN]);

  useEffect(() => { void loadReports(); }, [loadReports]);

  const dailyColumns = [
    { id: 'productName', label: 'Product Name', sortable: true },
    { id: 'quantitySold', label: 'Quantity Sold', align: 'right' as const, sortable: true },
    { id: 'revenue', label: 'Revenue', align: 'right' as const, sortable: true, format: (val: number) => `$${val.toFixed(2)}` },
  ];

  const topColumns = [
    { id: 'productName', label: 'Product', sortable: true },
    { id: 'quantitySold', label: 'Quantity Sold', align: 'right' as const, sortable: true },
    { id: 'revenue', label: 'Revenue', align: 'right' as const, sortable: true, format: (val: number) => `$${val.toFixed(2)}` },
  ];

  const orderColumns = [
    { id: 'status', label: 'Status', sortable: true },
    { id: 'count', label: 'Count', align: 'right' as const, sortable: true },
    { id: 'totalValue', label: 'Total Value', align: 'right' as const, sortable: true, format: (val: number) => `$${val.toFixed(2)}` },
  ];

  const monthlyColumns = [
    { id: 'date', label: 'Date', sortable: true, format: (val: string) => new Date(val).toLocaleDateString() },
    { id: 'orders', label: 'Orders', align: 'right' as const, sortable: true },
    { id: 'revenue', label: 'Revenue', align: 'right' as const, sortable: true, format: (val: number) => `$${val.toFixed(2)}` },
  ];

  return (
    <Stack spacing={3} p={2}>
      <Box>
        <Typography variant="h4" fontWeight="bold">Analytics & Reports</Typography>
        <Typography color="text.secondary">Comprehensive view of your store's performance metrics.</Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[2] }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth label="Start Date" InputLabelProps={{ shrink: true }} value={rangeStart} onChange={e => setRangeStart(e.target.value)} /></Grid>
            <Grid item xs={12} md={3}><TextField type="date" fullWidth label="End Date" InputLabelProps={{ shrink: true }} value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} /></Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment</InputLabel>
                <Select label="Payment" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <MenuItem value="">All</MenuItem><MenuItem value="Cash">Cash</MenuItem><MenuItem value="Card">Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}><Button fullWidth variant="contained" size="large" sx={{ height: '100%' }} onClick={loadReports}>Apply Filters</Button></Grid>
          </Grid>
        </CardContent>
      </Card>

      {isLoading ? <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box> : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3}>
            {[
              { label: 'Total Sales', val: dailySales?.totalSales, pref: '$', col: theme.palette.primary.main },
              { label: 'Orders Range', val: dailySales?.numberOfOrders, pref: '', col: theme.palette.secondary.main },
              { label: 'Avg Order Val', val: dailySales?.averageOrderValue, pref: '$', col: theme.palette.warning.main },
              { label: 'Monthly Revenue', val: monthlyRevenue?.monthlyTotal, pref: '$', col: theme.palette.success.main },
            ].map(k => (
              <Grid item xs={12} sm={6} md={3} key={k.label}>
                <Card sx={{ borderRadius: 4, borderLeft: `6px solid ${k.col}`, boxShadow: theme.shadows[2] }}>
                  <CardContent>
                    <Typography color="text.secondary" fontWeight="bold">{k.label}</Typography>
                    <Typography variant="h4" fontWeight="bold">{k.pref}{k.val?.toFixed(2) ?? '0.00'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ borderRadius: 4, p: 3, boxShadow: theme.shadows[2] }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Top Products ({sortBy})</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(topProducts?.items ?? []).map(i => ({ name: i.productName.substring(0, 15), val: sortBy === 'revenue' ? i.revenue : i.quantitySold }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }} contentStyle={{ borderRadius: 8 }} />
                      <Bar dataKey="val" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ borderRadius: 4, p: 3, boxShadow: theme.shadows[2] }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>Order Status</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderSummary?.items ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                        {orderSummary?.items.map((_, i) => <Cell key={i} fill={chartPalette[i % chartPalette.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Data Tables */}
          <Card sx={{ borderRadius: 4, boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>Monthly Revenue Daily Breakdown</Typography>
              <DataTable columns={monthlyColumns} data={monthlyRevenue?.dailyBreakdown ?? []} keyField="date" />
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
