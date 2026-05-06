import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography, Skeleton, IconButton
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useForm, SubmitHandler } from 'react-hook-form';
import suppliersApi, { Supplier, SupplierPayload } from '../services/suppliersApi';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

type SupplierFormData = SupplierPayload;
const initialFormValues: SupplierFormData = { companyName: '', contactPerson: '', email: '', phone: '', address: '', taxIdOrVatNumber: '' };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<SupplierFormData>({ mode: 'onChange', defaultValues: initialFormValues });

  const loadSuppliers = async (searchText?: string) => {
    try {
      setIsLoading(true);
      setSuppliers(await suppliersApi.list(searchText));
    } catch {
      toast.error('Failed to load suppliers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadSuppliers(); }, []);

  const onSubmit: SubmitHandler<SupplierFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      if (editingSupplier) await suppliersApi.update(editingSupplier.id, data);
      else await suppliersApi.create(data);
      setFormOpen(false);
      setEditingSupplier(null);
      reset(initialFormValues);
      toast.success('Supplier saved!');
      await loadSuppliers(search);
    } catch {
      toast.error('Failed to save supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({ ...supplier, taxIdOrVatNumber: supplier.taxIdOrVatNumber ?? '' });
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await suppliersApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Supplier deleted');
      await loadSuppliers(search);
    } catch {
      toast.error('Failed to delete supplier. Purchase history may exist.');
      setDeleteTarget(null);
    }
  };

  const columns = [
    { id: 'companyName', label: 'Company Name', sortable: true },
    { id: 'contactPerson', label: 'Contact', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phone', label: 'Phone', sortable: true },
    { id: 'taxIdOrVatNumber', label: 'Tax/VAT', format: (val: string) => val || '-' },
    { id: 'actions', label: 'Actions', align: 'right' as const, format: (_: any, row: Supplier) => (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <IconButton size="small" color="primary" onClick={() => onEdit(row)}><Edit fontSize="small" /></IconButton>
        <IconButton size="small" color="error" onClick={() => setDeleteTarget(row)}><Delete fontSize="small" /></IconButton>
      </Stack>
    )},
  ];

  return (
    <Stack spacing={3} p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold">Suppliers</Typography>
          <Typography color="text.secondary">Manage inventory supplier records.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setEditingSupplier(null); reset(initialFormValues); setFormOpen(true); }}>
          Add Supplier
        </Button>
      </Box>

      <Box display="flex" gap={2}>
        <TextField size="small" label="Search suppliers" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: 8 } }} />
        <Button variant="outlined" onClick={() => loadSuppliers(search)}>Search</Button>
      </Box>

      {isLoading ? (
        <Stack spacing={2}><Skeleton variant="rectangular" height={50} /><Skeleton variant="rectangular" height={300} /></Stack>
      ) : (
        <DataTable columns={columns} data={suppliers} keyField="id" emptyMessage="No suppliers found." />
      )}

      {/* Supplier Form Modal */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle variant="h5" fontWeight="bold">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent dividers sx={{ border: 'none' }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Company Name" fullWidth error={!!errors.companyName} helperText={errors.companyName?.message} {...register('companyName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                <TextField label="Contact Person" fullWidth error={!!errors.contactPerson} helperText={errors.contactPerson?.message} {...register('contactPerson', { required: 'Required' })} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
                <TextField label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} {...register('phone', { required: 'Required' })} />
              </Stack>
              <TextField label="Address" fullWidth multiline minRows={2} error={!!errors.address} helperText={errors.address?.message} {...register('address', { required: 'Required' })} />
              <TextField label="Tax ID / VAT Number" fullWidth error={!!errors.taxIdOrVatNumber} helperText={errors.taxIdOrVatNumber?.message} {...register('taxIdOrVatNumber')} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setFormOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!isValid || isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight="bold">Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete <strong>{deleteTarget?.companyName}</strong>?</Typography></DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
