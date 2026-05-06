import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Stack, TextField, Typography, useTheme, alpha
} from '@mui/material';
import { Add, Remove, Delete, Payment, Search, Cancel } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import posApi, { PosReceipt, PosSearchProduct, PosSearchResponse } from '../services/posApi';
import { toast } from 'react-toastify';

type CartItem = PosSearchProduct & { quantity: number; };

export default function CashierDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchResult, setSearchResult] = useState<PosSearchResponse>({ includeOutOfStock: false, totalResults: 0, categories: [], items: [] });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');
  const [amountTenderedInput, setAmountTenderedInput] = useState('');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await posApi.searchProducts({ q: searchText.trim() || undefined, includeOutOfStock: false });
      setSearchResult(response);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadProducts(), 300);
    return () => window.clearTimeout(timeoutId);
  }, [loadProducts]);

  const cartSubtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const totalItemsInCart = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const handleAddToCart = (item: PosSearchProduct) => {
    if (item.isOutOfStock || item.isExpired) return;
    
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, item.availableStock) } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, change: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, Math.min(item.quantity + change, item.availableStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeCartItem = (productId: number) => setCartItems(prev => prev.filter(i => i.id !== productId));

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      setIsCheckoutLoading(true);
      const amountTendered = paymentMethod === 'Cash' ? Number(amountTenderedInput) : undefined;
      const saleReceipt = await posApi.checkout({
        items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })),
        paymentMethod,
        amountTendered,
        simulateCardApproval: true,
      });
      setReceipt(saleReceipt);
      setCartItems([]);
      setIsPaymentOpen(false);
      toast.success(`Transaction ${saleReceipt.receiptNumber} completed!`);
      await loadProducts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete transaction');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 100px)' }}>
      {/* Product Grid - Left Panel */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Search products by name or barcode..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
          sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={2}>
              {searchResult.items.map(item => {
                const disabled = item.isOutOfStock || item.isExpired;
                return (
                  <Grid item xs={12} sm={6} md={4} xl={3} key={item.id}>
                    <Card
                      component={motion.div}
                      whileHover={{ scale: disabled ? 1 : 1.02 }}
                      whileTap={{ scale: disabled ? 1 : 0.98 }}
                      onClick={() => !disabled && handleAddToCart(item)}
                      sx={{ 
                        height: '100%', cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1, borderRadius: 3,
                        boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}`,
                        position: 'relative', overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ height: 120, bgcolor: 'grey.100', position: 'relative' }}>
                         {/* Mock Image Area */}
                         <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                           <Typography color="text.secondary" variant="caption">No Image</Typography>
                         </Box>
                         {item.availableStock > 0 && item.availableStock < 10 && (
                           <Chip label={`Only ${item.availableStock} left`} size="small" color="warning" sx={{ position: 'absolute', top: 8, right: 8 }} />
                         )}
                      </Box>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="primary">{item.category}</Typography>
                        <Typography fontWeight="bold" noWrap>{item.name}</Typography>
                        <Typography variant="h6" fontWeight="bold" mt={1}>${item.price.toFixed(2)}</Typography>
                        {disabled && (
                           <Typography variant="caption" color="error.main" fontWeight="bold">Unavailable</Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Cart - Right Panel */}
      <Paper elevation={3} sx={{ width: 400, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6" fontWeight="bold">Current Sale</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>Cashier: {user?.name}</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <AnimatePresence>
            {cartItems.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                <Payment sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography>Cart is empty</Typography>
              </Box>
            ) : (
              cartItems.map(item => (
                <motion.div
                  key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography fontWeight="bold">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">${item.price.toFixed(2)} each</Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => removeCartItem(item.id)}><Cancel fontSize="small" /></IconButton>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: 'grey.100', borderRadius: 8, p: 0.5 }}>
                          <IconButton size="small" onClick={() => updateCartQuantity(item.id, -1)}><Remove fontSize="small" /></IconButton>
                          <Typography fontWeight="bold" sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateCartQuantity(item.id, 1)} disabled={item.quantity >= item.availableStock}><Add fontSize="small" /></IconButton>
                        </Stack>
                        <Typography fontWeight="bold" variant="subtitle1">${(item.price * item.quantity).toFixed(2)}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </Box>

        <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack spacing={1.5} mb={3}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Items ({totalItemsInCart})</Typography>
              <Typography fontWeight="bold">${cartSubtotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Tax</Typography>
              <Typography fontWeight="bold">$0.00</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h5" fontWeight="bold">Total</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary.main">${cartSubtotal.toFixed(2)}</Typography>
            </Stack>
          </Stack>
          
          <Button
            variant="contained" color="primary" size="large" fullWidth disabled={cartItems.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            sx={{ py: 2, fontSize: '1.1rem', borderRadius: 2 }}
            startIcon={<Payment />}
          >
            Charge ${cartSubtotal.toFixed(2)}
          </Button>
        </Box>
      </Paper>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle variant="h5" fontWeight="bold">Complete Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, mt: 2 }}>
            {['Cash', 'Card'].map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'contained' : 'outlined'}
                onClick={() => setPaymentMethod(method as 'Cash' | 'Card')}
                fullWidth size="large" sx={{ py: 2, borderRadius: 3 }}
              >
                {method}
              </Button>
            ))}
          </Box>

          <Typography variant="h6" align="center" gutterBottom>Amount Due: <strong>${cartSubtotal.toFixed(2)}</strong></Typography>

          {paymentMethod === 'Cash' && (
            <TextField
              fullWidth label="Amount Tendered" type="number"
              value={amountTenderedInput} onChange={(e) => setAmountTenderedInput(e.target.value)}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
          )}
          {paymentMethod === 'Cash' && Number(amountTenderedInput) >= cartSubtotal && (
            <Typography variant="h6" align="center" color="success.main" sx={{ mt: 2 }}>
              Change: ${(Number(amountTenderedInput) - cartSubtotal).toFixed(2)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsPaymentOpen(false)} size="large">Cancel</Button>
          <Button 
            onClick={handleCheckout} variant="contained" size="large" color="primary"
            disabled={isCheckoutLoading || (paymentMethod === 'Cash' && Number(amountTenderedInput) < cartSubtotal)}
          >
            {isCheckoutLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Ensure Paper is available, since we used it.
import { Paper } from '@mui/material';
