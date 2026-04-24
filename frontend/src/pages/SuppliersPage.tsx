import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import suppliersApi, { Supplier, SupplierPayload } from '../services/suppliersApi';

type SupplierFormData = SupplierPayload;

const initialFormValues: SupplierFormData = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  taxIdOrVatNumber: '',
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SupplierFormData>({
    mode: 'onChange',
    defaultValues: initialFormValues,
  });

  const headerTitle = useMemo(
    () => (editingSupplier ? 'Edit Supplier' : 'Add Supplier'),
    [editingSupplier]
  );

  const loadSuppliers = async (searchText?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await suppliersApi.list(searchText);
      setSuppliers(list);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load suppliers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSuppliers();
  }, []);

  const onSubmit: SubmitHandler<SupplierFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, data);
      } else {
        await suppliersApi.create(data);
      }

      setEditingSupplier(null);
      reset(initialFormValues);
      await loadSuppliers(search);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to save supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    reset({
      companyName: supplier.companyName,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      taxIdOrVatNumber: supplier.taxIdOrVatNumber ?? '',
      isActive: supplier.isActive,
    });
  };

  const onCancelEdit = () => {
    setEditingSupplier(null);
    reset(initialFormValues);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setError(null);
      await suppliersApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await loadSuppliers(search);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to delete supplier.');
      setDeleteTarget(null);
    }
  };

  return (
    <Stack spacing={3}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Search suppliers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" onClick={() => void loadSuppliers(search)}>
          Search
        </Button>
      </Stack>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5}>
          <Typography variant="h6" fontWeight={700}>{headerTitle}</Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Company Name"
              fullWidth
              error={Boolean(errors.companyName)}
              helperText={errors.companyName?.message}
              {...register('companyName', {
                required: 'Company name is required.',
                minLength: { value: 2, message: 'Company name must be at least 2 characters.' },
                maxLength: { value: 150, message: 'Company name must be at most 150 characters.' },
              })}
            />
            <TextField
              label="Contact Person"
              fullWidth
              error={Boolean(errors.contactPerson)}
              helperText={errors.contactPerson?.message}
              {...register('contactPerson', {
                required: 'Contact person is required.',
                minLength: { value: 2, message: 'Contact person must be at least 2 characters.' },
              })}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required.',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email.' },
              })}
            />
            <TextField
              label="Phone"
              fullWidth
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
              {...register('phone', {
                required: 'Phone is required.',
                pattern: {
                  value: /^[0-9+()\-\s]{7,20}$/,
                  message: 'Phone must be 7-20 chars with digits, spaces or +()-.',
                },
              })}
            />
          </Stack>

          <TextField
            label="Address"
            fullWidth
            multiline
            minRows={2}
            error={Boolean(errors.address)}
            helperText={errors.address?.message}
            {...register('address', {
              required: 'Address is required.',
              maxLength: { value: 500, message: 'Address must be at most 500 characters.' },
            })}
          />

          <TextField
            label="Tax ID / VAT Number"
            fullWidth
            error={Boolean(errors.taxIdOrVatNumber)}
            helperText={errors.taxIdOrVatNumber?.message}
            {...register('taxIdOrVatNumber', {
              maxLength: { value: 50, message: 'Tax ID/VAT must be at most 50 characters.' },
            })}
          />

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
            {editingSupplier ? (
              <Button variant="outlined" onClick={onCancelEdit}>
                Cancel
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Tax/VAT</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id} hover>
                <TableCell>{supplier.companyName}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.taxIdOrVatNumber ?? '-'}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" onClick={() => onEdit(supplier)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => setDeleteTarget(supplier)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">No suppliers found.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete supplier?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete <strong>{deleteTarget?.companyName}</strong>. If purchase history exists, delete will be blocked.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={() => void confirmDelete()} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
