import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Divider, Drawer, IconButton, Stack, TextField, Typography, useTheme, alpha } from '@mui/material';
import { Add, Remove, DeleteOutline, Close, ShoppingCartCheckout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import cartApi from '../services/cartApi';
import { productAPI } from '../services/api';
import { Cart as CartType, CartItem } from '../types/cart';
import { toast } from 'react-toastify';

export default function Cart() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [imageMap, setImageMap] = useState<Record<number, string | undefined>>({});

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate('/shop'), 300);
  };

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      setCart(response);
    } catch (err) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCart(); }, [loadCart]);

  useEffect(() => {
    async function loadImages(items: CartItem[]) {
      const missingIds = items.map(i => i.productId).filter(id => !(id in imageMap));
      if (!missingIds.length) return;
      const results = await Promise.all(missingIds.map(async id => {
        try { return { id, url: (await productAPI.getById(id)).imageUrl }; } catch { return { id, url: undefined }; }
      }));
      setImageMap(prev => {
        const next = { ...prev };
        results.forEach(r => { next[r.id] = r.url; });
        return next;
      });
    }
    if (cart?.items.length) void loadImages(cart.items);
  }, [cart, imageMap]);

  const updateQuantity = async (item: CartItem, qty: number) => {
    if (qty < 1) return;
    try {
      setActionLoadingId(item.id);
      setCart(await cartApi.updateCartItem(item.id, qty));
    } catch {
      toast.error('Failed to update item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setActionLoadingId(itemId);
      setCart(await cartApi.removeFromCart(itemId));
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isEmpty = !cart?.items.length;
  const total = cart?.totalAmount ?? 0;

  return (
    <Drawer anchor="right" open={open} onClose={handleClose} PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 0, display: 'flex', flexDirection: 'column' } }}>
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h5" fontWeight="bold">Your Cart</Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}><Close /></IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
        ) : isEmpty ? (
          <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
            <ShoppingCartCheckout sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">Your cart is empty</Typography>
            <Button variant="contained" sx={{ mt: 3, borderRadius: 8 }} onClick={handleClose}>Continue Shopping</Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {cart?.items.map(item => {
              const busy = actionLoadingId === item.id;
              return (
                <Box key={item.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 4, boxShadow: theme.shadows[1], border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: 'grey.100', overflow: 'hidden', flexShrink: 0 }}>
                    {imageMap[item.productId] ? (
                      <Box component="img" src={imageMap[item.productId]} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%"><Typography variant="caption" color="text.secondary">No Img</Typography></Box>
                    )}
                  </Box>
                  <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="space-between">
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography fontWeight="bold" noWrap>{item.productName}</Typography>
                        <Typography variant="body2" color="text.secondary">${item.price.toFixed(2)} each</Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => removeItem(item.id)} disabled={busy}><DeleteOutline fontSize="small" /></IconButton>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: 'grey.100', borderRadius: 8, px: 1 }}>
                        <IconButton size="small" onClick={() => updateQuantity(item, item.quantity - 1)} disabled={busy || item.quantity <= 1}><Remove fontSize="small" /></IconButton>
                        <Typography fontWeight="bold">{item.quantity}</Typography>
                        <IconButton size="small" onClick={() => updateQuantity(item, item.quantity + 1)} disabled={busy}><Add fontSize="small" /></IconButton>
                      </Stack>
                      <Typography fontWeight="bold" color="primary.main">${item.lineTotal.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {!isEmpty && (
        <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack spacing={2} mb={3}>
            <Box display="flex" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography fontWeight="bold">${total.toFixed(2)}</Typography></Box>
            <Divider />
            <Box display="flex" justifyContent="space-between"><Typography variant="h5" fontWeight="bold">Total</Typography><Typography variant="h5" fontWeight="bold" color="primary.main">${total.toFixed(2)}</Typography></Box>
          </Stack>
          <Button variant="contained" size="large" fullWidth onClick={() => navigate('/checkout')} startIcon={<ShoppingCartCheckout />} sx={{ py: 2, borderRadius: 2, fontSize: '1.1rem' }}>
            Proceed to Checkout
          </Button>
        </Box>
      )}
    </Drawer>
  );
}