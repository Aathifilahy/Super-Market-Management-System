import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Slide, CircularProgress, IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { TransitionProps } from '@mui/material/transitions';
import { CreateProductDto, UpdateProductDto } from '../types/Product';
import { useAuth } from '../hooks/useAuth';
import { isAdminOrInventoryRole } from '../utils/role';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ProductFormProps {
  initialData?: UpdateProductDto;
  onSubmit: (data: CreateProductDto | UpdateProductDto) => Promise<void>;
  title: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrInventory = isAdminOrInventoryRole(user?.role);
  const afterSavePath = isAdminOrInventory ? '/admin/products' : '/shop';

  const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '', category: '', price: 0, quantity: 0, expiryDate: '', imageUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        price: initialData.price || 0,
        quantity: initialData.quantity || 0,
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate(afterSavePath), 300);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const dataToSubmit = { ...formData, imageUrl: formData.imageUrl?.trim() || undefined };
      await onSubmit(dataToSubmit);
      handleClose();
    } catch (err) {
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight="bold">{title}</Typography>
        <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ border: 'none', py: 2 }}>
          <Grid container spacing={3}>
            {errors.submit && (
               <Grid item xs={12}>
                 <Typography color="error" variant="body2" fontWeight="bold">{errors.submit}</Typography>
               </Grid>
            )}
            <Grid item xs={12}>
              <TextField fullWidth label="Product Name" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} error={!!errors.category} helperText={errors.category} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Price" name="price" type="number" inputProps={{ step: '0.01', min: '0' }} value={formData.price} onChange={handleChange} error={!!errors.price} helperText={errors.price} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Quantity" name="quantity" type="number" inputProps={{ min: '0' }} value={formData.quantity} onChange={handleChange} error={!!errors.quantity} helperText={errors.quantity} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Expiry Date" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} error={!!errors.expiryDate} helperText={errors.expiryDate} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Image URL (optional)" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleClose} disabled={submitting} sx={{ borderRadius: 2, px: 3 }}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting} sx={{ borderRadius: 2, px: 4 }} startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}>
            {submitting ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;
