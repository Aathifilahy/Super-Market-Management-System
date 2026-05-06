import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  Box, Button, CircularProgress, Drawer, FormControl, IconButton, InputLabel, MenuItem,
  Select, Stack, TextField, Typography, Divider, IconButton as MuiIconButton
} from '@mui/material';
import { Close, Add, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { adminUsersApi, CreateStaffUserPayload, StaffUserSummary, StaffRole } from '../services/adminUsersApi';
import { normalizeRole } from '../utils/role';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { toast } from 'react-toastify';

type StaffFormData = CreateStaffUserPayload;

function readAuthTokenFromStorage() {
  return sessionStorage.getItem('supermarket_auth_token') ?? localStorage.getItem('supermarket_auth_token');
}

export default function StaffManagement() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [staffUsers, setStaffUsers] = useState<StaffUserSummary[]>([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAdmin = useMemo(() => normalizeRole(user?.role) === 'Admin', [user?.role]);

  const { register, handleSubmit, formState: { errors, isValid }, setValue, watch, reset } = useForm<StaffFormData>({
    mode: 'onChange',
    defaultValues: { name: '', email: '', password: '', role: 'InventoryManager' },
  });
  const selectedRole = watch('role');

  const loadStaffUsers = useCallback(async (search?: string) => {
    const authToken = token ?? readAuthTokenFromStorage();
    if (!authToken) return;
    try {
      setIsStaffLoading(true);
      setStaffUsers(await adminUsersApi.getStaffUsers(authToken, search));
    } catch {
      toast.error('Failed to load staff users.');
    } finally {
      setIsStaffLoading(false);
    }
  }, [token]);

  useEffect(() => { if (isAdmin) void loadStaffUsers(); }, [isAdmin, loadStaffUsers]);

  const onSubmit: SubmitHandler<StaffFormData> = async (data) => {
    const authToken = token ?? readAuthTokenFromStorage();
    if (!authToken) return;
    try {
      setIsSubmitting(true);
      const response = await adminUsersApi.createStaffUser(data, authToken);
      toast.success(`Staff user created: ${response.name}`);
      await loadStaffUsers(staffSearch);
      reset();
      setDrawerOpen(false);
    } catch (err: any) {
      toast.error(err?.status === 403 ? 'Not allowed to appoint staff.' : 'Failed to create staff user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role', sortable: true, format: (val: string) => <StatusBadge status={val} /> },
    { id: 'isActive', label: 'Status', sortable: true, format: (val: boolean) => <StatusBadge status={val ? 'Active' : 'Inactive'} /> },
    { id: 'actions', label: 'Actions', align: 'right' as const, format: (_: any, row: StaffUserSummary) => (
      <Button size="small" variant="outlined" onClick={() => navigate(`/profile?userId=${row.id}`)}>View Profile</Button>
    )}
  ];

  if (!isAdmin) return <Box p={4}><Typography color="error" variant="h6">Access Denied. Admins only.</Typography></Box>;

  return (
    <Stack spacing={3} p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight="bold">Staff Management</Typography>
          <Typography color="text.secondary">View current staff accounts and appoint new users.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDrawerOpen(true)}>Appoint Staff</Button>
      </Box>

      <Box display="flex" gap={2}>
        <TextField size="small" label="Search staff" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} sx={{ width: 300 }} />
        <Button variant="outlined" startIcon={<Search />} onClick={() => loadStaffUsers(staffSearch)}>Search</Button>
      </Box>

      {isStaffLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : (
        <DataTable columns={columns} data={staffUsers} keyField="id" emptyMessage="No staff accounts found." />
      )}

      {/* Slide-in Drawer for adding staff */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Box p={3} display="flex" justifyContent="space-between" alignItems="center" bgcolor="primary.main" color="white">
          <Typography variant="h6" fontWeight="bold">Appoint New Staff</Typography>
          <IconButton color="inherit" onClick={() => setDrawerOpen(false)}><Close /></IconButton>
        </Box>
        <Box p={3} component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <TextField fullWidth label="Full Name" error={!!errors.name} helperText={errors.name?.message} {...register('name', { required: 'Name required', minLength: 2 })} />
            <TextField fullWidth label="Email Address" type="email" error={!!errors.email} helperText={errors.email?.message} {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
            <TextField fullWidth label="Password" type="password" error={!!errors.password} helperText={errors.password?.message} {...register('password', { required: 'Password required', minLength: 8 })} />
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Select label="Role" value={selectedRole} onChange={(e) => setValue('role', e.target.value as StaffRole, { shouldValidate: true })}>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="InventoryManager">Inventory Manager</MenuItem>
                <MenuItem value="Cashier">Cashier</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting || !isValid}>
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Staff User'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
}
