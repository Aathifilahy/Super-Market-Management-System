import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Divider } from '@mui/material';
import { format } from 'date-fns';
import orderApi from '../services/orderApi';
import { Order, OrderDetail } from '../types/order';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-toastify';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setOrders(await orderApi.getOrders());
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const handleViewDetails = async (orderId: number) => {
    try {
      setDetailLoading(true);
      setSelectedOrder(await orderApi.getOrderDetails(orderId));
    } catch {
      toast.error('Failed to load order details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { id: 'id', label: 'Order #', format: (val: number) => `#${val}`, sortable: true },
    { id: 'orderDate', label: 'Date', format: (val: string) => format(new Date(val), 'MMM d, yyyy h:mm a'), sortable: true },
    { id: 'totalAmount', label: 'Total', format: (val: number) => `$${val.toFixed(2)}`, sortable: true },
    { id: 'status', label: 'Status', format: (val: string) => <StatusBadge status={val} /> },
    { id: 'paymentStatus', label: 'Payment', format: (val: string) => <StatusBadge status={val} /> },
    { id: 'actions', label: 'Actions', align: 'right' as const, format: (_: any, row: Order) => (
      <Button variant="outlined" size="small" onClick={() => handleViewDetails(row.id)} disabled={detailLoading}>View Details</Button>
    )},
  ];

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Stack spacing={3} p={2}>
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>My Orders</Typography>
        <Typography color="text.secondary">Track your purchases and review order details.</Typography>
      </Box>

      <DataTable columns={columns} data={orders} keyField="id" emptyMessage="You have no orders yet." />

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle variant="h5" fontWeight="bold">Order #{selectedOrder?.id}</DialogTitle>
        <DialogContent dividers sx={{ border: 'none' }}>
          {selectedOrder && (
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary">{format(new Date(selectedOrder.orderDate), 'PPP p')}</Typography>
                <Box display="flex" gap={1}>
                  <StatusBadge status={selectedOrder.status} />
                  <StatusBadge status={`Pay: ${selectedOrder.paymentStatus}`} />
                </Box>
              </Box>
              
              <Box p={2} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Shipping Address</Typography>
                <Typography fontWeight="medium">{selectedOrder.shippingAddress}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1} gutterBottom>Payment Method</Typography>
                <Typography fontWeight="medium">{selectedOrder.paymentMethod}</Typography>
              </Box>

              <Box>
                <Typography fontWeight="bold" mb={2}>Items</Typography>
                <Stack spacing={1.5}>
                  {selectedOrder.items.map((item) => (
                    <Box key={item.id} display="flex" justifyContent="space-between">
                      <Box>
                        <Typography fontWeight="medium">{item.productName}</Typography>
                        <Typography variant="body2" color="text.secondary">Qty: {item.quantity} x ${item.price.toFixed(2)}</Typography>
                      </Box>
                      <Typography fontWeight="bold">${item.lineTotal.toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">${selectedOrder.totalAmount.toFixed(2)}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSelectedOrder(null)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}