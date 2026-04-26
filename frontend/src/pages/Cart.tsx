import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useNavigate } from 'react-router-dom';
import cartApi from '../services/cartApi';
import { productAPI } from '../services/api';
import { Cart as CartType, CartItem } from '../types/cart';

type ProductImageMap = Record<number, string | undefined>;

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [clearLoading, setClearLoading] = useState(false);
  const [imageMap, setImageMap] = useState<ProductImageMap>({});

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      setCart(response);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'Failed to load cart.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    async function loadImages(items: CartItem[]) {
      const missingIds = items
        .map((item) => item.productId)
        .filter((productId) => !(productId in imageMap));

      if (missingIds.length === 0) {
        return;
      }

      const results = await Promise.all(
        missingIds.map(async (productId) => {
          try {
            const product = await productAPI.getById(productId);
            return { productId, imageUrl: product.imageUrl };
          } catch {
            return { productId, imageUrl: undefined };
          }
        })
      );

      setImageMap((prev) => {
        const next = { ...prev };
        results.forEach(({ productId, imageUrl }) => {
          next[productId] = imageUrl;
        });
        return next;
      });
    }

    if (cart?.items.length) {
      void loadImages(cart.items);
    }
  }, [cart, imageMap]);

  const handleQuantityChange = async (item: CartItem, nextQuantity: number) => {
    if (nextQuantity < 0) {
      return;
    }

    try {
      setActionLoadingId(item.id);
      setError(null);
      const updatedCart = await cartApi.updateCartItem(item.id, nextQuantity);
      setCart(updatedCart);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'Failed to update cart item.';
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      setActionLoadingId(itemId);
      setError(null);
      const updatedCart = await cartApi.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'Failed to remove cart item.';
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearLoading(true);
      setError(null);
      const updatedCart = await cartApi.clearCart();
      setCart(updatedCart);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'Failed to clear cart.';
      setError(message);
    } finally {
      setClearLoading(false);
    }
  };

  const itemCount = cart?.items.length ?? 0;
  const isEmpty = itemCount === 0;

  const total = useMemo(() => cart?.totalAmount ?? 0, [cart]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3} data-testid="cart-page">
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Shopping Cart
          </Typography>
          <Typography color="text.secondary">
            Review your selected items before checkout.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Box>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {isEmpty ? (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ py: 8 }}>
            <Stack spacing={2} alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                Your cart is empty
              </Typography>
              <Typography color="text.secondary" textAlign="center" maxWidth={480}>
                Add products to your cart to review quantities and proceed to checkout.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/')}>
                Browse Products
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {cart?.items.map((item) => {
            const busy = actionLoadingId === item.id;

            return (
              <Card key={item.id} sx={{ borderRadius: 4, boxShadow: 2 }} data-testid="cart-item">
                <CardContent>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: '1fr', md: '140px 1fr auto' }}
                    gap={3}
                    alignItems="center"
                  >
                    {imageMap[item.productId] ? (
                      <CardMedia
                        component="img"
                        image={imageMap[item.productId]}
                        alt={item.productName}
                        sx={{ width: '100%', maxWidth: 140, height: 120, borderRadius: 3, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 140,
                          height: 120,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant="body2">No image</Typography>
                      </Box>
                    )}

                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {item.productName}
                      </Typography>
                      <Typography color="text.secondary">Unit price: ${item.price.toFixed(2)}</Typography>
                      <Typography fontWeight={600}>Subtotal: ${item.lineTotal.toFixed(2)}</Typography>
                    </Stack>

                    <Stack spacing={2} alignItems={{ xs: 'stretch', md: 'flex-end' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          color="primary"
                          onClick={() => void handleQuantityChange(item, item.quantity - 1)}
                          disabled={busy || item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>

                        <TextField
                          type="number"
                          value={item.quantity}
                          size="small"
                          sx={{ width: 90 }}
                          inputProps={{ min: 1 }}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (Number.isNaN(value)) {
                              return;
                            }
                            void handleQuantityChange(item, value);
                          }}
                          disabled={busy}
                        />

                        <IconButton
                          color="primary"
                          onClick={() => void handleQuantityChange(item, item.quantity + 1)}
                          disabled={busy}
                        >
                          <AddIcon />
                        </IconButton>

                        {busy ? <CircularProgress size={22} /> : null}
                      </Stack>

                      <Button
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => void handleRemove(item.id)}
                        disabled={busy}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
            <CardContent>
              <Stack spacing={2.5}>
                <Typography variant="h6" fontWeight={700}>
                  Cart Summary
                </Typography>
                <Divider />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color="text.secondary">Items</Typography>
                  <Typography fontWeight={600}>{cart?.totalItems ?? 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    ${total.toFixed(2)}
                  </Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => void handleClearCart()}
                    disabled={clearLoading}
                  >
                    {clearLoading ? <CircularProgress size={22} color="inherit" /> : 'Clear Cart'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingCartCheckoutIcon />}
                    onClick={() => navigate('/checkout')}
                    data-testid="checkout-button"
                  >
                    Proceed to Checkout
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}

export default Cart;