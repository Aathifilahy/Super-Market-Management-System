import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import adminReportsApi, {
  DailySalesReport,
  MonthlyRevenueReport,
  OrderSummaryReport,
  TopSellingProductsReport,
} from '../services/adminReportsApi';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

export default function AdminReports() {
  const [dailyDate, setDailyDate] = useState<string>(toIsoDate(today));
  const [rangeStart, setRangeStart] = useState<string>(toIsoDate(monthStart));
  const [rangeEnd, setRangeEnd] = useState<string>(toIsoDate(today));
  const [topN, setTopN] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue'>('quantity');

  const [dailySales, setDailySales] = useState<DailySalesReport | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProductsReport | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartPalette = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

  const monthFilter = useMemo(() => {
    const selected = new Date(`${dailyDate}T00:00:00`);
    return {
      year: selected.getUTCFullYear(),
      month: selected.getUTCMonth() + 1,
    };
  }, [dailyDate]);

  const loadReports = useCallback(async () => {
    if (rangeStart > rangeEnd) {
      setError('Start date must be before or equal to end date.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [dailyData, monthlyData, topData, orderData] = await Promise.all([
        adminReportsApi.getDailySales(dailyDate),
        adminReportsApi.getMonthlyRevenue(monthFilter.year, monthFilter.month),
        adminReportsApi.getTopProducts({
          startDate: rangeStart,
          endDate: rangeEnd,
          topN,
          sortBy,
        }),
        adminReportsApi.getOrderSummary({
          startDate: rangeStart,
          endDate: rangeEnd,
        }),
      ]);

      setDailySales(dailyData);
      setMonthlyRevenue(monthlyData);
      setTopProducts(topData);
      setOrderSummary(orderData);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, [dailyDate, monthFilter.month, monthFilter.year, rangeEnd, rangeStart, sortBy, topN]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const applyPreset = (preset: 'today' | 'last7' | 'thisMonth') => {
    const now = new Date();
    const currentIso = toIsoDate(now);

    if (preset === 'today') {
      setDailyDate(currentIso);
      setRangeStart(currentIso);
      setRangeEnd(currentIso);
      return;
    }

    if (preset === 'last7') {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      setDailyDate(currentIso);
      setRangeStart(toIsoDate(start));
      setRangeEnd(currentIso);
      return;
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    setDailyDate(currentIso);
    setRangeStart(toIsoDate(startOfMonth));
    setRangeEnd(currentIso);
  };

  const monthlyTrendData = (monthlyRevenue?.dailyBreakdown ?? []).map((point) => ({
    dateLabel: new Date(point.date).toLocaleDateString(),
    revenue: point.revenue,
    orders: point.orders,
  }));

  const topProductsChartData = (topProducts?.items ?? []).map((item) => ({
    product: item.productName.length > 16 ? `${item.productName.slice(0, 16)}…` : item.productName,
    quantity: item.quantitySold,
    revenue: item.revenue,
  }));

  const orderSummaryChartData = (orderSummary?.items ?? []).map((item) => ({
    name: item.status,
    value: item.count,
    totalValue: item.totalValue,
  }));

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin Reports Dashboard
        </Typography>
        <Typography color="text.secondary">
          Daily sales, monthly revenue, top products, and order status summaries.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" size="small" onClick={() => applyPreset('today')}>
              Today
            </Button>
            <Button variant="outlined" size="small" onClick={() => applyPreset('last7')}>
              Last 7 Days
            </Button>
            <Button variant="outlined" size="small" onClick={() => applyPreset('thisMonth')}>
              This Month
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            label="Daily Report Date"
            InputLabelProps={{ shrink: true }}
            value={dailyDate}
            onChange={(event) => setDailyDate(event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            label="Range Start"
            InputLabelProps={{ shrink: true }}
            value={rangeStart}
            onChange={(event) => setRangeStart(event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            label="Range End"
            InputLabelProps={{ shrink: true }}
            value={rangeEnd}
            onChange={(event) => setRangeEnd(event.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 1.5 }}>
          <TextField
            type="number"
            fullWidth
            label="Top N"
            value={topN}
            onChange={(event) => setTopN(Number(event.target.value) || 10)}
            inputProps={{ min: 1, max: 100 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 1.5 }}>
          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sort</InputLabel>
            <Select
              labelId="sort-by-label"
              label="Sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'quantity' | 'revenue')}
            >
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="revenue">Revenue</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box>
        <Typography
          role="button"
          onClick={() => {
            void loadReports();
          }}
          sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 600 }}
        >
          Refresh Reports
        </Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          {!dailySales && !monthlyRevenue && !topProducts && !orderSummary ? (
            <Alert severity="info">No report data available for the selected filters.</Alert>
          ) : null}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Total Sales (Day)</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ${dailySales?.totalSales?.toFixed(2) ?? '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Orders (Day)</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {dailySales?.numberOfOrders ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Avg Order Value (Day)</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ${dailySales?.averageOrderValue?.toFixed(2) ?? '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Monthly Revenue</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ${monthlyRevenue?.monthlyTotal?.toFixed(2) ?? '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Top-Selling Products ({sortBy === 'quantity' ? 'Quantity' : 'Revenue'})
              </Typography>

              <Box sx={{ width: '100%', height: 260, mb: 2 }}>
                <ResponsiveContainer>
                  <BarChart data={topProductsChartData} margin={{ top: 12, right: 16, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {sortBy === 'revenue' ? (
                      <Bar dataKey="revenue" name="Revenue" fill="#1976d2" />
                    ) : (
                      <Bar dataKey="quantity" name="Quantity Sold" fill="#2e7d32" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(topProducts?.items ?? []).map((item) => (
                    <TableRow key={item.productId} hover>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.quantitySold}</TableCell>
                      <TableCell align="right">${item.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {(topProducts?.items?.length ?? 0) === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography color="text.secondary">No top-selling products in this range.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Order Summary by Status
                  </Typography>

                  <Box sx={{ width: '100%', height: 260, mb: 2 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={orderSummaryChartData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={88}
                          label
                        >
                          {orderSummaryChartData.map((entry, index) => (
                            <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Total Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(orderSummary?.items ?? []).map((item) => (
                        <TableRow key={item.status} hover>
                          <TableCell>{item.status}</TableCell>
                          <TableCell align="right">{item.count}</TableCell>
                          <TableCell align="right">${item.totalValue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {(orderSummary?.items?.length ?? 0) === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography color="text.secondary">No order summary data in this range.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Monthly Revenue Daily Breakdown
                  </Typography>

                  <Box sx={{ width: '100%', height: 260, mb: 2 }}>
                    <ResponsiveContainer>
                      <LineChart data={monthlyTrendData} margin={{ top: 12, right: 16, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dateLabel" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1976d2" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Orders</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(monthlyRevenue?.dailyBreakdown ?? []).map((point) => (
                        <TableRow key={point.date} hover>
                          <TableCell>{new Date(point.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">{point.orders}</TableCell>
                          <TableCell align="right">${point.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {(monthlyRevenue?.dailyBreakdown?.length ?? 0) === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography color="text.secondary">No monthly breakdown data for selected month.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}
