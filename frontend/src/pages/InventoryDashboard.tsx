import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import inventoryApi, { InventoryDashboardSummary } from '../services/inventoryApi';

const emptySummary: InventoryDashboardSummary = {
  totalProducts: 0,
  totalSuppliers: 0,
  lowStockProducts: 0,
  totalStockUnits: 0,
  totalInventoryValue: 0,
  purchasesInLast30Days: 0,
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export default function InventoryDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [summary, setSummary] = useState<InventoryDashboardSummary>(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await inventoryApi.getDashboard();
        if (!ignore) {
          setSummary(data);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load inventory dashboard.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 6, md: 10 } }}>
        <Card
          sx={{
            width: '100%',
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            boxShadow: '0 24px 60px rgba(25, 118, 210, 0.1)',
          }}
        >
          <CardContent sx={{ py: 7 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography color="text.secondary">Loading dashboard overview...</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  const welcomeName = user?.name?.trim() || 'Team';
  const stockCoverage =
    summary.totalProducts > 0
      ? `${Math.max(0, Math.round(((summary.totalProducts - summary.lowStockProducts) / summary.totalProducts) * 100))}%`
      : '100%';

  const cards = [
    {
      label: 'Products in catalog',
      value: summary.totalProducts.toLocaleString(),
      helper: 'Tracked inventory items',
      icon: <Inventory2RoundedIcon />,
      accent: theme.palette.primary.main,
    },
    {
      label: 'Supplier network',
      value: summary.totalSuppliers.toLocaleString(),
      helper: 'Active supplier relationships',
      icon: <LocalShippingRoundedIcon />,
      accent: theme.palette.secondary.main,
    },
    {
      label: 'Low stock alerts',
      value: summary.lowStockProducts.toLocaleString(),
      helper: 'Items needing attention',
      icon: <WarningAmberRoundedIcon />,
      accent: theme.palette.warning.main,
    },
    {
      label: 'Stock units on hand',
      value: summary.totalStockUnits.toLocaleString(),
      helper: 'Current quantity across products',
      icon: <WarehouseRoundedIcon />,
      accent: theme.palette.info.main,
    },
    {
      label: 'Inventory value',
      value: currencyFormatter.format(summary.totalInventoryValue),
      helper: 'Estimated stock investment',
      icon: <AttachMoneyRoundedIcon />,
      accent: theme.palette.success.main,
    },
    {
      label: 'Purchases in 30 days',
      value: summary.purchasesInLast30Days.toLocaleString(),
      helper: 'Recent stock purchase activity',
      icon: <ShoppingBagRoundedIcon />,
      accent: theme.palette.primary.dark,
    },
  ];

  const quickActions = [
    {
      title: 'Manage products',
      description: 'Review inventory items, pricing, and product details.',
      to: '/inventory/products',
    },
    {
      title: 'Update suppliers',
      description: 'Keep supplier contacts and procurement sources organized.',
      to: '/inventory/suppliers',
    },
    {
      title: 'Record purchases',
      description: 'Log incoming stock and monitor procurement activity.',
      to: '/inventory/purchases',
    },
    {
      title: 'Review low stock',
      description: 'Prioritize items that need replenishment soon.',
      to: '/inventory/low-stock',
    },
  ];

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 5,
          color: theme.palette.common.white,
          background:
            `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
              theme.palette.primary.dark,
              0.96,
            )} 42%, ${theme.palette.secondary.main} 100%)`,
          boxShadow: '0 30px 80px rgba(25, 118, 210, 0.24)',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              `radial-gradient(circle at 12% 20%, ${alpha(theme.palette.common.white, 0.24)} 0%, transparent 28%),` +
              `radial-gradient(circle at 90% 16%, ${alpha(theme.palette.common.white, 0.16)} 0%, transparent 28%),` +
              `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.common.black, 0.12)} 100%)`,
          }}
        />
        <CardContent sx={{ position: 'relative', p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.25}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: '0.24em', fontWeight: 700, opacity: 0.86 }}
                  >
                    Inventory Overview
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    Welcome back, {welcomeName}
                  </Typography>
                  <Typography sx={{ mt: 1.25, maxWidth: 620, opacity: 0.9, lineHeight: 1.7 }}>
                    Here is a clean snapshot of your supermarket operations so you can spot stock
                    issues quickly, stay on top of suppliers, and move into action faster.
                  </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    component={RouterLink}
                    to="/inventory/products"
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      borderRadius: 999,
                      px: 2.5,
                      bgcolor: alpha(theme.palette.common.white, 0.18),
                      color: theme.palette.common.white,
                    }}
                  >
                    Open inventory
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/inventory/low-stock"
                    variant="outlined"
                    sx={{
                      borderRadius: 999,
                      px: 2.5,
                      borderColor: alpha(theme.palette.common.white, 0.45),
                      color: theme.palette.common.white,
                    }}
                  >
                    Review low stock
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      bgcolor: alpha(theme.palette.common.white, 0.14),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardContent sx={{ p: 2.25 }}>
                      <Typography variant="body2" sx={{ opacity: 0.84 }}>
                        Stock coverage
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                        {stockCoverage}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      bgcolor: alpha(theme.palette.common.white, 0.14),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardContent sx={{ p: 2.25 }}>
                      <Typography variant="body2" sx={{ opacity: 0.84 }}>
                        Low stock items
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                        {summary.lowStockProducts}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      bgcolor: alpha(theme.palette.common.white, 0.14),
                      border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardContent sx={{ p: 2.25 }}>
                      <Typography variant="body2" sx={{ opacity: 0.84 }}>
                        Inventory value
                      </Typography>
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                        {currencyFormatter.format(summary.totalInventoryValue)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.8 }}>
                        Based on the current stock levels tracked in the dashboard summary.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={card.label}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 4,
                border: `1px solid ${alpha(card.accent, 0.15)}`,
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        {card.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={800}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        color: card.accent,
                        bgcolor: alpha(card.accent, 0.12),
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {card.helper}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5" fontWeight={800} gutterBottom>
                    Quick actions
                  </Typography>
                  <Typography color="text.secondary">
                    Jump straight into the most common inventory tasks without leaving the dashboard.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {quickActions.map((action) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={action.title}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          borderRadius: 3.5,
                          borderColor: alpha(theme.palette.primary.main, 0.12),
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={1.5}>
                            <Box>
                              <Typography variant="h6" fontWeight={700}>
                                {action.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                                {action.description}
                              </Typography>
                            </Box>
                            <Button
                              component={RouterLink}
                              to={action.to}
                              variant="text"
                              endIcon={<ArrowForwardRoundedIcon />}
                              sx={{ alignSelf: 'flex-start', px: 0 }}
                            >
                              Open
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.08)}`,
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5" fontWeight={800} gutterBottom>
                    Today&apos;s focus
                  </Typography>
                  <Typography color="text.secondary">
                    A quick operational summary to help you decide where attention is needed next.
                  </Typography>
                </Box>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.14)}`,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Restock priority
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {summary.lowStockProducts}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                      Products currently flagged as low stock and worth reviewing soon.
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Supplier reach
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {summary.totalSuppliers}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                      Suppliers available to support replenishment and procurement activity.
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    bgcolor: alpha(theme.palette.secondary.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Purchase momentum
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                      {summary.purchasesInLast30Days}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                      Stock purchase records captured during the last 30 days.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
