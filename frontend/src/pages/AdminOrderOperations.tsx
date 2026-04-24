import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import adminOrdersApi, { AdminOrderPaymentItem } from '../services/adminOrdersApi';

export default function AdminOrderOperations() {
  const [orders, setOrders] = useState<AdminOrderPaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminOrdersApi.getPendingPaymentOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load pending payment orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleMarkPaid = async (orderId: number) => {
    try {
      setProcessingOrderId(orderId);
      setError(null);
      setSuccess(null);
      await adminOrdersApi.markOrderAsPaid(orderId);
      setSuccess(`Order #${orderId} marked as paid.`);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to mark order as paid.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Order Operations
        </Typography>
        <Typography color="text.secondary">
          Simulate successful payments by marking pending orders as paid for reporting.
        </Typography>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Stack direction="row" justifyContent="flex-end">
        <Button variant="outlined" onClick={() => void loadOrders()} disabled={isLoading}>
          Refresh
        </Button>
      </Stack>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>#{order.id}</TableCell>
                <TableCell>
                  <Typography fontWeight={600}>{order.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.customerEmail}
                  </Typography>
                </TableCell>
                <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell align="right">{order.totalItems}</TableCell>
                <TableCell align="right">${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => void handleMarkPaid(order.id)}
                    disabled={processingOrderId === order.id}
                  >
                    {processingOrderId === order.id ? <CircularProgress size={18} color="inherit" /> : 'Mark Paid'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography color="text.secondary">No pending payment orders found.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}
    </Stack>
  );
}
