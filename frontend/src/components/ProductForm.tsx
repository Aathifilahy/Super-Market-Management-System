import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CreateProductDto, UpdateProductDto } from '../types/Product';
import { useAuth } from '../hooks/useAuth';

function normalizeRole(role: unknown): string {
  if (typeof role === 'string') {
    return role;
  }

  if (typeof role === 'number') {
    switch (role) {
      case 0:
        return 'Customer';
      case 1:
        return 'Admin';
      case 2:
        return 'InventoryManager';
      case 3:
        return 'Cashier';
      default:
        return String(role);
    }
  }

  return '';
}

interface ProductFormProps {
  initialData?: UpdateProductDto;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  title: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = normalizeRole(user?.role);
  const isAdminOrInventory = role === 'Admin' || role === 'InventoryManager';
  const afterSavePath = isAdminOrInventory ? '/admin/products' : '/shop';
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    category: '',
    price: 0,
    quantity: 0,
    expiryDate: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price || 0,
        quantity: initialData.quantity || 0,
        expiryDate: initialData.expiryDate || '',
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const dataToSubmit = {
        ...formData,
        imageUrl: formData.imageUrl?.trim() || undefined,
      };
      await onSubmit(dataToSubmit);
      navigate(afterSavePath, { replace: true });
    } catch (err) {
      setSubmitError('Failed to save product. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!errors.category}
                helperText={errors.category}
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                required
              />
            </Grid>

            <Grid size={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                inputProps={{ min: '0' }}
                value={formData.quantity}
                onChange={handleChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Image URL (optional)"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>

            <Grid size={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate(afterSavePath)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ProductForm;
