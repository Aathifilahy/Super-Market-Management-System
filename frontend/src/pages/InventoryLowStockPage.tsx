import React, { useEffect, useState } from 'react';
import { Alert, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import inventoryApi from '../services/inventoryApi';
import { Product } from '../types/Product';

export default function InventoryLowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async (nextThreshold?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getLowStock(nextThreshold);
      setProducts(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load low-stock data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Override Threshold"
          type="number"
          value={threshold}
          onChange={(event) => {
            const value = event.target.value;
            setThreshold(value === '' ? '' : Number(value));
          }}
          sx={{ width: { xs: '100%', md: 220 } }}
        />
        <Stack direction="row" spacing={1}>
          <Chip
            label="Apply"
            color="primary"
            onClick={() => void loadProducts(typeof threshold === 'number' ? threshold : undefined)}
            clickable
          />
          <Chip
            label="Reset"
            variant="outlined"
            onClick={() => {
              setThreshold('');
              void loadProducts();
            }}
            clickable
          />
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Threshold</TableCell>
              <TableCell align="right">Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell align="right">{product.quantity}</TableCell>
                <TableCell align="right">{product.lowStockThreshold ?? 10}</TableCell>
                <TableCell align="right">${product.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">No low-stock products found.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
