import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Skeleton, Grid, Card, CardContent, CardMedia, CardActions, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack, IconButton, Divider, alpha, useTheme
} from '@mui/material';
import { AddShoppingCart, Edit, Delete, FilterList, Search } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../services/api';
import cartApi from '../services/cartApi';
import { useAuth } from '../hooks/useAuth';
import { Product } from '../types/Product';
import { isAdminOrInventoryRole } from '../utils/role';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-toastify';

const ProductList: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qtyById, setQtyById] = useState<Record<number, number>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: number | null }>({ open: false, productId: null });
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const isAdminOrInventory = isAdminOrInventoryRole(user?.role);
  const isInventoryRoute = useMemo(() => location.pathname.startsWith('/admin') || location.pathname.startsWith('/inventory'), [location.pathname]);
  const showInventoryActions = isAdminOrInventory && isInventoryRoute;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
      const next: Record<number, number> = {};
      data.forEach((p) => { next[p.id] = 1; });
      setQtyById(next);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog.productId) {
      try {
        await productAPI.delete(deleteDialog.productId);
        toast.success('Product deleted successfully');
        await fetchProducts();
        setDeleteDialog({ open: false, productId: null });
      } catch (err) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const quantity = qtyById[product.id] ?? 1;
    if (quantity < 1 || quantity > product.quantity) {
      toast.warning(`Invalid quantity`);
      return;
    }
    try {
      await cartApi.addToCart(product.id, quantity);
      toast.success(`Added ${quantity} × ${product.name} to cart.`);
    } catch (err: any) {
      toast.error(typeof err?.message === 'string' ? err.message : 'Failed to add to cart.');
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => 
    (categoryFilter === 'All' || p.category === categoryFilter) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockColor = (quantity: number) => {
    if (quantity < 10) return 'error';
    if (quantity < 30) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box p={3}>
        <Skeleton variant="text" width={200} height={60} />
        <Grid container spacing={3} mt={2}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (showInventoryActions) {
    // Inventory / Admin View: Data Table
    const columns = [
      { id: 'imageUrl', label: 'Image', format: (v: string) => v ? <img src={v} alt="prod" style={{width: 40, height: 40, borderRadius: 8, objectFit: 'cover'}}/> : <Box sx={{width: 40, height: 40, bgcolor: 'grey.200', borderRadius: 2}}/> },
      { id: 'name', label: 'Product Name', sortable: true },
      { id: 'category', label: 'Category', sortable: true },
      { id: 'price', label: 'Price', format: (v: number) => `$${v.toFixed(2)}`, sortable: true },
      { id: 'quantity', label: 'Stock', format: (v: number) => <StatusBadge status={`${v} in stock`} type={getStockColor(v)} />, sortable: true },
      { id: 'actions', label: 'Actions', format: (_: any, row: Product) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" color="primary" onClick={() => navigate(`/edit-product/${row.id}`)}><Edit fontSize="small"/></IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, productId: row.id })}><Delete fontSize="small"/></IconButton>
        </Stack>
      )},
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight="bold">Inventory Management</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/add-product')}>
              Add New Product
            </Button>
          </Box>
          <DataTable columns={columns} data={products} keyField="id" />
          
          <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, productId: null })}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to delete this product? This action cannot be undone.</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog({ open: false, productId: null })}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    );
  }

  // Customer Shop View: Grid + Sidebar
  return (
    <Box p={3} display="flex" gap={4}>
      {/* Sidebar Filter */}
      <Box sx={{ width: 240, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>Categories</Typography>
        <Stack spacing={1}>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'contained' : 'text'}
              onClick={() => setCategoryFilter(cat)}
              sx={{ justifyContent: 'flex-start', borderRadius: 2 }}
              color={categoryFilter === cat ? 'primary' : 'inherit'}
            >
              {cat}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Main Content */}
      <Box flex={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">Shop Products</Typography>
          <TextField
            size="small"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }} /> }}
            sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: 8 } }}
          />
        </Box>

        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} component={motion.div} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                <Card sx={{ 
                  height: '100%', display: 'flex', flexDirection: 'column', 
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] },
                  position: 'relative', overflow: 'hidden'
                }}>
                  <Box sx={{ overflow: 'hidden', height: 180, bgcolor: 'grey.100' }}>
                    {product.imageUrl ? (
                      <Box
                        component="img"
                        src={product.imageUrl}
                        alt={product.name}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.1)' } }}
                      />
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">No Image</Typography>
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>{product.category}</Typography>
                    <Typography gutterBottom variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 2 }}>
                      ${product.price.toFixed(2)}
                    </Typography>
                    {product.quantity < 10 && product.quantity > 0 && (
                      <Typography variant="caption" color="warning.main" fontWeight="bold">Only {product.quantity} left in stock</Typography>
                    )}
                    {product.quantity === 0 && (
                      <Typography variant="caption" color="error.main" fontWeight="bold">Out of stock</Typography>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ p: 2, pt: 1.5 }}>
                    <Stack direction="row" spacing={1} width="100%">
                      <TextField
                        size="small"
                        type="number"
                        value={qtyById[product.id] ?? 1}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setQtyById(prev => ({ ...prev, [product.id]: val >= 1 ? val : 1 }));
                        }}
                        sx={{ width: '80px', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        disabled={product.quantity === 0}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddShoppingCart />}
                        disabled={product.quantity === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add
                      </Button>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </AnimatePresence>
          {filteredProducts.length === 0 && (
            <Box width="100%" py={8} textAlign="center">
              <Typography variant="h6" color="text.secondary">No products found matching your criteria.</Typography>
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductList;
