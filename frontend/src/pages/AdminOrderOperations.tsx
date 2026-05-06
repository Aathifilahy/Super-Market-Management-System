import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography, Skeleton } from '@mui/material';
import adminOrdersApi, { AdminOrderPaymentItem } from '../services/adminOrdersApi';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-toastify';

export default function AdminOrderOperations() {
  const [orders, setOrders] = useState<AdminOrderPaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminOrdersApi.getPendingPaymentOrders();
      setOrders(data);
    } catch (err: any) {
      toast.error('Failed to load pending payment orders.');
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
      await adminOrdersApi.markOrderAsPaid(orderId);
      toast.success(`Order #${orderId} marked as paid.`);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err: any) {
      toast.error('Failed to mark order as paid.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const columns = [
    { id: 'id', label: 'Order ID', format: (val: number) => `#${val}` },
    { id: 'customerName', label: 'Customer', format: (_: any, row: AdminOrderPaymentItem) => (
      <Box>
        <Typography fontWeight="bold">{row.customerName}</Typography>
        <Typography variant="body2" color="text.secondary">{row.customerEmail}</Typography>
      </Box>
    )},
    { id: 'orderDate', label: 'Date', format: (val: string) => new Date(val).toLocaleString() },
    { id: 'paymentMethod', label: 'Payment Method' },
    { id: 'status', label: 'Status', format: (val: string) => <StatusBadge status={val} /> },
    { id: 'totalItems', label: 'Items', align: 'right' as const },
    { id: 'totalAmount', label: 'Total', align: 'right' as const, format: (val: number) => `$${val.toFixed(2)}` },
    { id: 'actions', label: 'Actions', align: 'right' as const, format: (_: any, row: AdminOrderPaymentItem) => (
      <Button
        variant="contained" size="small"
        onClick={() => handleMarkPaid(row.id)}
        disabled={processingOrderId === row.id}
      >
        {processingOrderId === row.id ? <CircularProgress size={18} color="inherit" /> : 'Mark Paid'}
      </Button>
    )}
  ];

  return (
    <Stack spacing={3} p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Order Operations</Typography>
          <Typography color="text.secondary">Manage pending payments and order statuses.</Typography>
        </Box>
        <Button variant="outlined" onClick={loadOrders} disabled={isLoading}>Refresh</Button>
      </Box>

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={50} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      ) : (
        <DataTable columns={columns} data={orders} keyField="id" emptyMessage="No pending payment orders found." />
      )}
    </Stack>
  );
}
