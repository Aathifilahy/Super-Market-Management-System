import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import {
  adminUsersApi,
  AdminUsersApiError,
  CreateStaffUserPayload,
  CreatedStaffUserResponse,
  StaffUserSummary,
  StaffRole,
} from '../services/adminUsersApi';
import { normalizeRole } from '../utils/role';

type StaffFormData = {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
};

function readAuthTokenFromStorage(): string | null {
  return sessionStorage.getItem('supermarket_auth_token') ?? localStorage.getItem('supermarket_auth_token');
}

export default function StaffManagement() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedStaffUserResponse | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUserSummary[]>([]);
  const [staffSearch, setStaffSearch] = useState('');

  const isAdmin = useMemo(() => normalizeRole(user?.role) === 'Admin', [user?.role]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
  } = useForm<StaffFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'InventoryManager',
    },
  });

  const selectedRole = watch('role');

  const loadStaffUsers = useCallback(async (search?: string) => {
    const authToken = token ?? readAuthTokenFromStorage();
    if (!authToken) {
      setApiError('You are not authenticated. Please log in again.');
      return;
    }

    try {
      setIsStaffLoading(true);
      setApiError(null);
      const users = await adminUsersApi.getStaffUsers(authToken, search);
      setStaffUsers(users);
    } catch (error) {
      const parsed = error as AdminUsersApiError;
      setApiError(parsed?.message ?? 'Failed to load staff users.');
    } finally {
      setIsStaffLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    if (isAdmin) {
      void loadStaffUsers();
    }
  }, [isAdmin, loadStaffUsers]);

  const onSubmit: SubmitHandler<StaffFormData> = async (data) => {
    setApiError(null);
    setCreatedUser(null);

    const authToken = token ?? readAuthTokenFromStorage();
    if (!authToken) {
      setApiError('You are not authenticated. Please log in again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateStaffUserPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      const response = await adminUsersApi.createStaffUser(payload, authToken);
      setCreatedUser(response);
      await loadStaffUsers(staffSearch);
      reset({
        name: '',
        email: '',
        password: '',
        role: 'InventoryManager',
      });
    } catch (error) {
      const parsed = error as AdminUsersApiError;
      if (parsed?.status === 403) {
        setApiError('Supervisor only: you are not allowed to appoint staff from this account.');
      } else {
        setApiError(parsed?.message ?? 'Failed to create staff user.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3} sx={{ py: { xs: 2, md: 4 } }}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Staff Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View current staff accounts and appoint new staff users.
        </Typography>
      </Box>

      {!isAdmin ? (
        <Alert severity="warning">Only Admin users can access this page.</Alert>
      ) : null}

      {apiError ? <Alert severity="error">{apiError}</Alert> : null}

      {createdUser ? (
        <Alert severity="success">
          Staff user created: <strong>{createdUser.name}</strong> ({createdUser.email}) - role:{' '}
          <strong>{String(createdUser.role)}</strong>
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 4, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Current Staff Accounts
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    fullWidth
                    label="Search staff"
                    value={staffSearch}
                    onChange={(event) => setStaffSearch(event.target.value)}
                  />
                  <Button variant="outlined" onClick={() => void loadStaffUsers(staffSearch)}>
                    Search
                  </Button>
                </Stack>

                <Divider />

                {isStaffLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List disablePadding>
                    {staffUsers.map((staff) => (
                      <ListItemButton
                        key={staff.id}
                        divider
                        onClick={() => navigate(`/profile?userId=${staff.id}`)}
                        sx={{ borderRadius: 2 }}
                      >
                        <ListItemText
                          primary={staff.name}
                          secondary={
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {staff.email}
                              </Typography>
                              <Chip size="small" label={String(staff.role)} />
                              <Chip
                                size="small"
                                color={staff.isActive ? 'success' : 'default'}
                                label={staff.isActive ? 'Active' : 'Inactive'}
                              />
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    ))}

                    {staffUsers.length === 0 ? (
                      <Box sx={{ py: 3 }}>
                        <Typography color="text.secondary">No staff accounts found.</Typography>
                      </Box>
                    ) : null}
                  </List>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack spacing={2.5}>
                <Typography variant="h6" fontWeight={700}>
                  Appoint New Staff
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Name"
                      autoComplete="name"
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message ?? 'Enter staff full name.'}
                      {...register('name', {
                        required: 'Name is required.',
                        minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                        maxLength: { value: 100, message: 'Name must be at most 100 characters.' },
                      })}
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      autoComplete="email"
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message ?? 'Use a valid email address.'}
                      {...register('email', {
                        required: 'Email is required.',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email address.',
                        },
                      })}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message ?? 'At least 8 characters.'}
                      {...register('password', {
                        required: 'Password is required.',
                        minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                        maxLength: { value: 100, message: 'Password must be at most 100 characters.' },
                      })}
                    />

                    <FormControl fullWidth error={Boolean(errors.role)}>
                      <InputLabel id="staff-role-label">Role</InputLabel>
                      <Select
                        labelId="staff-role-label"
                        label="Role"
                        value={selectedRole}
                        onChange={(event) => setValue('role', event.target.value as StaffRole, { shouldValidate: true })}
                      >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="InventoryManager">InventoryManager</MenuItem>
                        <MenuItem value="Cashier">Cashier</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isSubmitting || !isValid}
                      sx={{ py: 1.4, borderRadius: 999 }}
                    >
                      {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Staff User'}
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
