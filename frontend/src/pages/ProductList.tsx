import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { productAPI } from '../services/api';
import cartApi from '../services/cartApi';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types/Product';
import { isAdminOrInventoryRole } from '../utils/role';

const ProductList: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [qtyById, setQtyById] = useState<Record<number, number>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null,
  });

  const navigate = useNavigate();

  const isAdminOrInventory = isAdminOrInventoryRole(user?.role);
  const isInventoryRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);
  const showInventoryActions = isAdminOrInventory && isInventoryRoute;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
      setError(null);

      setQtyById((prev) => {
        const next = { ...prev };
        data.forEach((p) => {
          if (typeof next[p.id] !== 'number' || next[p.id] < 1) {
            next[p.id] = 1;
          }
        });
        return next;
      });
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.productId) {
      try {
        await productAPI.delete(deleteDialog.productId);
        await fetchProducts(); // Refresh list
        setDeleteDialog({ open: false, productId: null });
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-product/${id}`);
  };

  const handleAddNew = () => {
    navigate('/add-product');
  };

  const handleAddToCart = async (product: Product) => {
    setCartMessage(null);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const quantity = qtyById[product.id] ?? 1;
    if (quantity < 1) {
      setCartMessage('Quantity must be at least 1.');
      return;
    }

    if (quantity > product.quantity) {
      setCartMessage(`Only ${product.quantity} items are available in stock.`);
      return;
    }

    try {
      await cartApi.addToCart(product.id, quantity);
      setCartMessage(`Added ${quantity} × ${product.name} to cart.`);
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Failed to add to cart.';
      setCartMessage(message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        {showInventoryActions ? (
          <Button variant="contained" color="primary" onClick={handleAddNew}>
            Add New Product
          </Button>
        ) : null}
      </Box>

      {cartMessage ? (
        <Alert sx={{ mb: 2 }} severity={cartMessage.toLowerCase().includes('fail') ? 'error' : 'success'}>
          {cartMessage}
        </Alert>
      ) : null}

      {products.length === 0 ? (
        <Alert severity="info">No products found. Add your first product!</Alert>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {product.imageUrl && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={product.imageUrl}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                    {product.isLowStock && (
                      <Chip
                        label="Low Stock"
                        color="warning"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {product.isExpired && (
                      <Chip
                        label="Expired"
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {product.category}
                  </Typography>

                  <Typography variant="body1" fontWeight="bold" color="primary" gutterBottom>
                    ${product.price.toFixed(2)}
                  </Typography>

                  <Typography variant="body2" color={product.quantity < 10 ? 'error' : 'inherit'}>
                    Quantity: {product.quantity}
                  </Typography>

                  <Typography variant="body2">
                    Expiry: {new Date(product.expiryDate).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions>
                  {showInventoryActions ? (
                    <>
                      <Button size="small" color="primary" onClick={() => handleEdit(product.id)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, productId: product.id })}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <TextField
                        size="small"
                        label="Qty"
                        type="number"
                        value={qtyById[product.id] ?? 1}
                        inputProps={{ min: 1, max: product.quantity }}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setQtyById((prev) => ({
                            ...prev,
                            [product.id]: Number.isFinite(value) ? value : 1,
                          }));
                        }}
                        sx={{ width: 90 }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={product.quantity <= 0 || product.isExpired}
                        onClick={() => void handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </Stack>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, productId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, productId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;
