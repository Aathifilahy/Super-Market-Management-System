import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import cartApi from '../services/cartApi';
import orderApi from '../services/orderApi';
import { Cart } from '../types/cart';
import { OrderDetail } from '../types/order';

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      setCart(response);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'Failed to load checkout details.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const isEmpty = (cart?.items.length ?? 0) === 0;
  const totalAmount = useMemo(() => cart?.totalAmount ?? 0, [cart]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      setError('Shipping address is required.');
      return;
    }

    try {
      setPlacingOrder(true);
      setError(null);
      const placedOrder = await orderApi.placeOrder(shippingAddress.trim(), paymentMethod);
      setOrder(placedOrder);
      setCart(null);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'Failed to place order.';
      setError(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (order) {
    return (
      <Box display="flex" justifyContent="center" py={{ xs: 2, md: 8 }}>
        <Card sx={{ width: '100%', maxWidth: 820, borderRadius: 4, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Order Confirmed
                </Typography>
                <Typography color="text.secondary">
                  Your order was placed successfully. Order #{order.id} is currently {order.status.toLowerCase()}.
                </Typography>
              </Box>

              <Alert severity="success" data-testid="order-success-message">
                Payment status: {order.paymentStatus}. Total charged: ${order.totalAmount.toFixed(2)}.
              </Alert>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="h6">Order Summary</Typography>
                    <Typography>Shipping Address: {order.shippingAddress}</Typography>
                    <Typography>Payment Method: {order.paymentMethod}</Typography>
                    <Divider sx={{ my: 1 }} />
                    {order.items.map((item) => (
                      <Box key={item.id} display="flex" justifyContent="space-between" gap={2}>
                        <Typography>
                          {item.productName} x {item.quantity}
                        </Typography>
                        <Typography fontWeight={600}>${item.lineTotal.toFixed(2)}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" onClick={() => navigate('/profile')}>
                  View Profile
                </Button>
                <Button variant="outlined" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" py={{ xs: 2, md: 8 }}>
      <Card sx={{ width: '100%', maxWidth: 980, borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Checkout
              </Typography>
              <Typography color="text.secondary">
                Review your order, enter shipping details, and choose a payment method.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            {isEmpty ? (
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Typography variant="h6">Your cart is empty</Typography>
                    <Typography color="text.secondary">
                      Add items to your cart before proceeding to checkout.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/cart')}>
                      Back to Cart
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns={{ xs: '1fr', md: '1.25fr 0.9fr' }}
                gap={3}
                alignItems="start"
              >
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Typography variant="h6" fontWeight={700}>
                        Order Summary
                      </Typography>
                      <Divider />
                      {cart?.items.map((item) => (
                        <Box key={item.id} display="flex" justifyContent="space-between" gap={2}>
                          <Box>
                            <Typography fontWeight={600}>{item.productName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Qty: {item.quantity} x ${item.price.toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography fontWeight={700}>${item.lineTotal.toFixed(2)}</Typography>
                        </Box>
                      ))}
                      <Divider />
                      <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary">Items</Typography>
                        <Typography>{cart?.totalItems ?? 0}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          ${totalAmount.toFixed(2)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={2.5}>
                      <Typography variant="h6" fontWeight={700}>
                        Shipping & Payment
                      </Typography>

                      <TextField
                        fullWidth
                        label="Shipping Address"
                        multiline
                        minRows={4}
                        value={shippingAddress}
                        onChange={(event) => setShippingAddress(event.target.value)}
                        helperText="Enter the full address for delivery."
                        inputProps={{ 'data-testid': 'shipping-address' }}
                      />

                      <FormControl>
                        <FormLabel id="payment-method-label">Payment Method</FormLabel>
                        <RadioGroup
                          aria-labelledby="payment-method-label"
                          value={paymentMethod}
                          onChange={(event) => setPaymentMethod(event.target.value)}
                        >
                          <FormControlLabel value="CashOnDelivery" control={<Radio />} label="Cash on Delivery" />
                          <FormControlLabel value="Card" control={<Radio />} label="Card" />
                          <FormControlLabel value="BankTransfer" control={<Radio />} label="Bank Transfer" />
                        </RadioGroup>
                      </FormControl>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button variant="outlined" fullWidth onClick={() => navigate('/cart')} disabled={placingOrder}>
                          Back to Cart
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => void handlePlaceOrder()}
                          disabled={placingOrder || !shippingAddress.trim()}
                          data-testid="place-order-button"
                        >
                          {placingOrder ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Checkout;