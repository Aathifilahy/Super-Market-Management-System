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
import { useSearchParams } from 'react-router-dom';
import adminReportsApi, {
  AdminReportsQuery,
  DailySalesReport,
  MonthlyRevenueReport,
  OrderSummaryReport,
  TopSellingProductsReport,
} from '../services/adminReportsApi';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getStartOfWeek(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function buildCsvFileName(reportType: string, startDate: string, endDate: string): string {
  return `${reportType}-${startDate.replaceAll('-', '')}-${endDate.replaceAll('-', '')}.csv`;
}

type PresetRange = 'today' | 'thisWeek' | 'thisMonth' | 'custom';

const today = new Date();
const todayIso = toIsoDate(today);
const monthStartIso = toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1));

export default function AdminReports() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [presetRange, setPresetRange] = useState<PresetRange>(
    (searchParams.get('preset') as PresetRange | null) ?? 'thisMonth'
  );
  const [rangeStart, setRangeStart] = useState<string>(searchParams.get('startDate') ?? monthStartIso);
  const [rangeEnd, setRangeEnd] = useState<string>(searchParams.get('endDate') ?? todayIso);
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? '');
  const [paymentMethod, setPaymentMethod] = useState<string>(searchParams.get('paymentMethod') ?? '');
  const [customer, setCustomer] = useState<string>(searchParams.get('customer') ?? '');
  const [topN, setTopN] = useState<number>(Number(searchParams.get('topN') ?? '10') || 10);
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue'>(
    searchParams.get('sortBy') === 'revenue' ? 'revenue' : 'quantity'
  );

  const [dailySales, setDailySales] = useState<DailySalesReport | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueReport | null>(null);
  const [topProducts, setTopProducts] = useState<TopSellingProductsReport | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const chartPalette = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

  const commonQuery = useMemo<AdminReportsQuery>(
    () => ({
      startDate: rangeStart,
      endDate: rangeEnd,
      category: category || undefined,
      paymentMethod: paymentMethod || undefined,
      customer: customer || undefined,
    }),
    [category, customer, paymentMethod, rangeEnd, rangeStart]
  );

  useEffect(() => {
    const nextParams = new URLSearchParams();
    nextParams.set('preset', presetRange);
    nextParams.set('startDate', rangeStart);
    nextParams.set('endDate', rangeEnd);

    if (category) {
      nextParams.set('category', category);
    }
    if (paymentMethod) {
      nextParams.set('paymentMethod', paymentMethod);
    }
    if (customer) {
      nextParams.set('customer', customer);
    }
    if (topN !== 10) {
      nextParams.set('topN', String(topN));
    }
    if (sortBy !== 'quantity') {
      nextParams.set('sortBy', sortBy);
    }

    setSearchParams(nextParams, { replace: true });
  }, [category, customer, paymentMethod, presetRange, rangeEnd, rangeStart, setSearchParams, sortBy, topN]);

  const applyPreset = useCallback((preset: PresetRange) => {
    const now = new Date();
    const currentIso = toIsoDate(now);
    setPresetRange(preset);

    if (preset === 'today') {
      setRangeStart(currentIso);
      setRangeEnd(currentIso);
      return;
    }

    if (preset === 'thisWeek') {
      setRangeStart(toIsoDate(getStartOfWeek(now)));
      setRangeEnd(currentIso);
      return;
    }

    if (preset === 'thisMonth') {
      setRangeStart(toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)));
      setRangeEnd(currentIso);
      return;
    }
  }, []);

  const loadReports = useCallback(async () => {
    if (rangeStart > rangeEnd) {
      setError('Start date must be before or equal to end date.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setExportError(null);

      const [dailyData, monthlyData, topData, orderData] = await Promise.all([
        adminReportsApi.getDailySales(commonQuery),
        adminReportsApi.getMonthlyRevenue(commonQuery),
        adminReportsApi.getTopProducts({
          ...commonQuery,
          topN,
          sortBy,
        }),
        adminReportsApi.getOrderSummary(commonQuery),
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
  }, [commonQuery, rangeEnd, rangeStart, sortBy, topN]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleExport = async (exporter: () => Promise<void>) => {
    try {
      setExportError(null);
      await exporter();
    } catch (err: any) {
      setExportError(err?.response?.data?.message ?? err?.message ?? 'Failed to export report.');
    }
  };

  const monthlyTrendData = (monthlyRevenue?.dailyBreakdown ?? []).map((point) => ({
    dateLabel: new Date(point.date).toLocaleDateString(),
    revenue: point.revenue,
    orders: point.orders,
  }));

  const topProductsChartData = (topProducts?.items ?? []).map((item) => ({
    product: item.productName.length > 16 ? `${item.productName.slice(0, 16)}...` : item.productName,
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
          Filter sales and order analytics, compare trends, and export CSV files for review.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant={presetRange === 'today' ? 'contained' : 'outlined'} size="small" onClick={() => applyPreset('today')}>
                Today
              </Button>
              <Button variant={presetRange === 'thisWeek' ? 'contained' : 'outlined'} size="small" onClick={() => applyPreset('thisWeek')}>
                This Week
              </Button>
              <Button variant={presetRange === 'thisMonth' ? 'contained' : 'outlined'} size="small" onClick={() => applyPreset('thisMonth')}>
                This Month
              </Button>
              <Button variant={presetRange === 'custom' ? 'contained' : 'outlined'} size="small" onClick={() => setPresetRange('custom')}>
                Custom
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <TextField
                  type="date"
                  fullWidth
                  label="Range Start"
                  InputLabelProps={{ shrink: true }}
                  value={rangeStart}
                  onChange={(event) => {
                    setPresetRange('custom');
                    setRangeStart(event.target.value);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <TextField
                  type="date"
                  fullWidth
                  label="Range End"
                  InputLabelProps={{ shrink: true }}
                  value={rangeEnd}
                  onChange={(event) => {
                    setPresetRange('custom');
                    setRangeEnd(event.target.value);
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <TextField
                  fullWidth
                  label="Category"
                  placeholder="Dairy"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <FormControl fullWidth>
                  <InputLabel id="payment-method-filter-label">Payment</InputLabel>
                  <Select
                    labelId="payment-method-filter-label"
                    label="Payment"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <TextField
                  fullWidth
                  label="Customer"
                  placeholder="Name or email"
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <TextField
                  type="number"
                  fullWidth
                  label="Top N"
                  value={topN}
                  onChange={(event) => setTopN(Number(event.target.value) || 10)}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2.4 }}>
                <FormControl fullWidth>
                  <InputLabel id="sort-by-label">Top Products Sort</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    label="Top Products Sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as 'quantity' | 'revenue')}
                  >
                    <MenuItem value="quantity">Quantity</MenuItem>
                    <MenuItem value="revenue">Revenue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" onClick={() => void loadReports()}>
                Refresh Reports
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  applyPreset('thisMonth');
                  setCategory('');
                  setPaymentMethod('');
                  setCustomer('');
                  setTopN(10);
                  setSortBy('quantity');
                }}
              >
                Reset Filters
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {exportError ? <Alert severity="error">{exportError}</Alert> : null}

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
                  <Typography color="text.secondary">Total Sales</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ${dailySales?.totalSales?.toFixed(2) ?? '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Orders in Range</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {dailySales?.numberOfOrders ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Avg Order Value</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ${dailySales?.averageOrderValue?.toFixed(2) ?? '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary">Revenue in Range</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    ${monthlyRevenue?.monthlyTotal?.toFixed(2) ?? '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Daily Sales Summary
                  </Typography>
                  <Typography color="text.secondary">
                    {dailySales?.startDate} to {dailySales?.endDate}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={() =>
                    void handleExport(() =>
                      adminReportsApi.exportDailySalesCsv(
                        commonQuery,
                        buildCsvFileName('daily-sales', rangeStart, rangeEnd)
                      )
                    )
                  }
                >
                  Export CSV
                </Button>
              </Stack>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dailySales?.topSellingProducts ?? []).map((item) => (
                    <TableRow key={item.productId} hover>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.quantitySold}</TableCell>
                      <TableCell align="right">${item.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Top-Selling Products ({sortBy === 'quantity' ? 'Quantity' : 'Revenue'})
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() =>
                    void handleExport(() =>
                      adminReportsApi.exportTopProductsCsv(
                        { ...commonQuery, topN, sortBy },
                        buildCsvFileName('top-products', rangeStart, rangeEnd)
                      )
                    )
                  }
                >
                  Export CSV
                </Button>
              </Stack>

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
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Order Summary by Status
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        void handleExport(() =>
                          adminReportsApi.exportOrderSummaryCsv(
                            commonQuery,
                            buildCsvFileName('order-summary', rangeStart, rangeEnd)
                          )
                        )
                      }
                    >
                      Export CSV
                    </Button>
                  </Stack>

                  <Box sx={{ width: '100%', height: 260, mb: 2 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={orderSummaryChartData} dataKey="value" nameKey="name" outerRadius={88} label>
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
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Monthly Revenue Daily Breakdown
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        void handleExport(() =>
                          adminReportsApi.exportMonthlyRevenueCsv(
                            commonQuery,
                            buildCsvFileName('monthly-revenue', rangeStart, rangeEnd)
                          )
                        )
                      }
                    >
                      Export CSV
                    </Button>
                  </Stack>

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
