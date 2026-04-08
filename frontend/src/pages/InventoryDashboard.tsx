import React, { useEffect, useState } from 'react';
import { Alert, Card, CardContent, CircularProgress, Grid, Typography } from '@mui/material';
import inventoryApi, { InventoryDashboardSummary } from '../services/inventoryApi';

const emptySummary: InventoryDashboardSummary = {
  totalProducts: 0,
  totalSuppliers: 0,
  lowStockProducts: 0,
  totalStockUnits: 0,
  totalInventoryValue: 0,
  purchasesInLast30Days: 0,
};

export default function InventoryDashboard() {
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
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const cards = [
    { label: 'Total Products', value: summary.totalProducts },
    { label: 'Total Suppliers', value: summary.totalSuppliers },
    { label: 'Low Stock Products', value: summary.lowStockProducts },
    { label: 'Total Stock Units', value: summary.totalStockUnits },
    { label: 'Inventory Value', value: `$${summary.totalInventoryValue.toFixed(2)}` },
    { label: 'Purchases (30 days)', value: summary.purchasesInLast30Days },
  ];

  return (
    <Grid container spacing={2.5}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.label}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                {card.label}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
