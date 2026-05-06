import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, CircularProgress, Divider, FormControl, FormControlLabel,
  Radio, RadioGroup, Stack, TextField, Typography, Stepper, Step, StepLabel, useTheme, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LocalShipping, Payment, ShoppingCart, CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import cartApi from '../services/cartApi';
import orderApi from '../services/orderApi';
import { Cart } from '../types/cart';
import { OrderDetail } from '../types/order';
import { toast } from 'react-toastify';

const steps = ['Review Cart', 'Shipping Details', 'Payment Method', 'Confirmation'];

export default function Checkout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [cart, setCart] = useState<Cart | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    async function loadCart() {
      try {
        setCart(await cartApi.getCart());
      } catch {
        toast.error('Failed to load checkout details');
      } finally {
        setLoading(false);
      }
    }
    void loadCart();
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) { toast.error('Shipping address is required'); return; }
    try {
      setPlacingOrder(true);
      const placedOrder = await orderApi.placeOrder(shippingAddress.trim(), paymentMethod);
      setOrder(placedOrder);
      setCart(null);
      handleNext();
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!cart?.items.length && activeStep !== 3) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}><Typography variant="h6" mb={2}>Your cart is empty</Typography><Button variant="contained" onClick={() => navigate('/shop')}>Back to Shop</Button></Card>
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" py={6} px={2}>
      <Card sx={{ width: '100%', maxWidth: 800, borderRadius: 4, boxShadow: theme.shadows[4], overflow: 'hidden' }}>
        <Box sx={{ p: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold">Checkout</Typography>
        </Box>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <CardContent sx={{ p: { xs: 2, md: 5 }, minHeight: 400 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {activeStep === 0 && (
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center" gap={1}><ShoppingCart color="primary" /><Typography variant="h6" fontWeight="bold">Review Your Items</Typography></Box>
                  <Divider />
                  {cart?.items.map(item => (
                    <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight="bold">{item.productName} <Typography component="span" color="text.secondary">x {item.quantity}</Typography></Typography>
                      <Typography fontWeight="bold">${item.lineTotal.toFixed(2)}</Typography>
                    </Box>
                  ))}
                  <Divider />
                  <Box display="flex" justifyContent="space-between"><Typography variant="h5" fontWeight="bold">Total</Typography><Typography variant="h5" fontWeight="bold" color="primary.main">${cart?.totalAmount.toFixed(2)}</Typography></Box>
                  <Box display="flex" justifyContent="flex-end" mt={2}>
                    <Button variant="contained" size="large" onClick={handleNext}>Proceed to Shipping</Button>
                  </Box>
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center" gap={1}><LocalShipping color="primary" /><Typography variant="h6" fontWeight="bold">Shipping Details</Typography></Box>
                  <Divider />
                  <TextField fullWidth label="Full Shipping Address" multiline minRows={4} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required placeholder="123 Main St, City, Country..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button variant="outlined" size="large" onClick={handleBack}>Back</Button>
                    <Button variant="contained" size="large" onClick={handleNext} disabled={!shippingAddress.trim()}>Proceed to Payment</Button>
                  </Box>
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={3}>
                  <Box display="flex" alignItems="center" gap={1}><Payment color="primary" /><Typography variant="h6" fontWeight="bold">Payment Method</Typography></Box>
                  <Divider />
                  <FormControl component="fieldset">
                    <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, mb: 2, p: 1 }}>
                        <FormControlLabel value="Card" control={<Radio />} label="Credit / Debit Card" sx={{ ml: 1 }} />
                      </Box>
                      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, mb: 2, p: 1 }}>
                        <FormControlLabel value="CashOnDelivery" control={<Radio />} label="Cash on Delivery" sx={{ ml: 1 }} />
                      </Box>
                      <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, mb: 2, p: 1 }}>
                        <FormControlLabel value="BankTransfer" control={<Radio />} label="Bank Transfer" sx={{ ml: 1 }} />
                      </Box>
                    </RadioGroup>
                  </FormControl>
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Button variant="outlined" size="large" onClick={handleBack} disabled={placingOrder}>Back</Button>
                    <Button variant="contained" size="large" onClick={handlePlaceOrder} disabled={placingOrder}>
                      {placingOrder ? <CircularProgress size={24} color="inherit" /> : `Place Order ($${cart?.totalAmount.toFixed(2)})`}
                    </Button>
                  </Box>
                </Stack>
              )}

              {activeStep === 3 && order && (
                <Stack spacing={3} alignItems="center" textAlign="center" py={4}>
                  <CheckCircle color="success" sx={{ fontSize: 80 }} />
                  <Typography variant="h4" fontWeight="bold">Order Confirmed!</Typography>
                  <Typography color="text.secondary">Thank you for your purchase. Your order number is <strong>#{order.id}</strong>.</Typography>
                  
                  <Card variant="outlined" sx={{ width: '100%', mt: 3, borderRadius: 3, textAlign: 'left' }}>
                    <CardContent>
                      <Typography fontWeight="bold" gutterBottom>Order Summary</Typography>
                      <Typography variant="body2" color="text.secondary">Status: {order.status}</Typography>
                      <Typography variant="body2" color="text.secondary">Payment: {order.paymentMethod}</Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>Address: {order.shippingAddress}</Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" justifyContent="space-between">
                         <Typography fontWeight="bold">Total Paid</Typography>
                         <Typography fontWeight="bold" color="primary.main">${order.totalAmount.toFixed(2)}</Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  <Box display="flex" gap={2} mt={2}>
                    <Button variant="outlined" onClick={() => navigate('/orders')}>View Orders</Button>
                    <Button variant="contained" onClick={() => navigate('/shop')}>Continue Shopping</Button>
                  </Box>
                </Stack>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </Box>
  );
}