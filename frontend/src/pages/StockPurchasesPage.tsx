import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
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
import { SubmitHandler, useForm } from 'react-hook-form';
import { productAPI } from '../services/api';
import suppliersApi, { Supplier } from '../services/suppliersApi';
import stockPurchasesApi, { CreateStockPurchasePayload, StockPurchase } from '../services/stockPurchasesApi';
import { Product } from '../types/Product';

type PurchaseFormData = {
  supplierId: number;
  productId: number;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  expiryDate: string;
};

export default function StockPurchasesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<StockPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<PurchaseFormData>({
    mode: 'onChange',
    defaultValues: {
      supplierId: 0,
      productId: 0,
      quantity: 1,
      purchasePrice: 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date().toISOString().slice(0, 10),
    },
  });

  const selectedSupplier = watch('supplierId');
  const selectedProduct = watch('productId');

  const loadAll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [suppliersData, productsData, historyData] = await Promise.all([
        suppliersApi.list(),
        productAPI.getAll(),
        stockPurchasesApi.list(),
      ]);

      setSuppliers(suppliersData.filter((s) => s.isActive));
      setProducts(productsData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load purchase data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const onSubmit: SubmitHandler<PurchaseFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload: CreateStockPurchasePayload = {
        supplierId: Number(data.supplierId),
        productId: Number(data.productId),
        quantity: Number(data.quantity),
        purchasePrice: Number(data.purchasePrice),
        purchaseDate: new Date(data.purchaseDate).toISOString(),
        expiryDate: new Date(data.expiryDate).toISOString(),
      };

      await stockPurchasesApi.create(payload);
      setSuccess('Stock purchase recorded and inventory updated successfully.');
      reset({
        supplierId: 0,
        productId: 0,
        quantity: 1,
        purchasePrice: 0,
        purchaseDate: new Date().toISOString().slice(0, 10),
        expiryDate: new Date().toISOString().slice(0, 10),
      });
      await loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to record stock purchase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Stack spacing={3}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Typography variant="h6" fontWeight={700}>
        Record Stock Purchase
      </Typography>

      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth error={Boolean(errors.supplierId)}>
            <InputLabel id="supplier-select-label">Supplier</InputLabel>
            <Select
              labelId="supplier-select-label"
              value={selectedSupplier || 0}
              label="Supplier"
              onChange={(event) => setValue('supplierId', Number(event.target.value), { shouldValidate: true })}
            >
              <MenuItem value={0}>Select supplier</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier.id} value={supplier.id}>{supplier.companyName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth error={Boolean(errors.productId)}>
            <InputLabel id="product-select-label">Product</InputLabel>
            <Select
              labelId="product-select-label"
              value={selectedProduct || 0}
              label="Product"
              onChange={(event) => setValue('productId', Number(event.target.value), { shouldValidate: true })}
            >
              <MenuItem value={0}>Select product</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            error={Boolean(errors.quantity)}
            helperText={errors.quantity?.message}
            {...register('quantity', {
              required: 'Quantity is required.',
              valueAsNumber: true,
              min: { value: 1, message: 'Quantity must be greater than zero.' },
            })}
          />

          <TextField
            label="Purchase Price"
            type="number"
            fullWidth
            error={Boolean(errors.purchasePrice)}
            helperText={errors.purchasePrice?.message}
            {...register('purchasePrice', {
              required: 'Purchase price is required.',
              valueAsNumber: true,
              min: { value: 0.01, message: 'Purchase price must be greater than zero.' },
            })}
          />

          <TextField
            label="Purchase Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.purchaseDate)}
            helperText={errors.purchaseDate?.message}
            {...register('purchaseDate', {
              required: 'Purchase date is required.',
            })}
          />

          <TextField
            label="Expiry Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.expiryDate)}
            helperText={errors.expiryDate?.message}
            {...register('expiryDate', {
              required: 'Expiry date is required.',
            })}
          />
        </Stack>

        <Button type="submit" variant="contained" disabled={!isValid || isSubmitting} sx={{ width: { xs: '100%', md: 260 } }}>
          {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save Purchase'}
        </Button>
      </Stack>

      <Typography variant="h6" fontWeight={700}>
        Purchase History
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((purchase) => (
            <TableRow key={purchase.id} hover>
              <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
              <TableCell>{purchase.supplierCompanyName}</TableCell>
              <TableCell>{purchase.productName}</TableCell>
              <TableCell>{new Date(purchase.expiryDate).toLocaleDateString()}</TableCell>
              <TableCell align="right">{purchase.quantity}</TableCell>
              <TableCell align="right">${purchase.purchasePrice.toFixed(2)}</TableCell>
              <TableCell align="right">${purchase.totalCost.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography color="text.secondary">No purchases recorded yet.</Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </Stack>
  );
}
