import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginFormData } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { isAdminOrInventoryRole, isCustomerRole, normalizeRole } from '../utils/role';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isLoading, error, clearError, user, isAuthenticated } = useAuth();
  const isAdminLogin = location.pathname === '/admin/login';
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    normalizeRole(user.role);
    const isAdminOrInventory = isAdminOrInventoryRole(user.role);
    const isCustomer = isCustomerRole(user.role);

    if (isAdminLogin && !isAdminOrInventory) {
      logout();
      window.alert('This account is not authorized for Admin/Staff access.');
      navigate('/start', { replace: true });
      return;
    }

    if (!isAdminLogin && !isCustomer) {
      logout();
      window.alert('This account is not authorized for Customer access.');
      navigate('/start', { replace: true });
      return;
    }

    const from = (location.state as { from?: unknown } | null)?.from;
    if (typeof from === 'string' && from.startsWith('/')) {
      navigate(from, { replace: true });
      return;
    }

    if (isAdminOrInventory) {
      navigate('/admin/products', { replace: true });
      return;
    }

    navigate('/shop', { replace: true });
  }, [isAuthenticated, user, isAdminLogin, location.state, navigate, logout]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    clearError();

    try {
      await login(data);
    } catch {
      // Error is handled by auth context state.
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, md: 8 } }}>
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 4, boxShadow: 6 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {isAdminLogin ? 'Admin / Staff Sign In' : 'Welcome back'}
              </Typography>
              <Typography color="text.secondary">
                {isAdminLogin
                  ? 'Sign in to manage inventory.'
                  : 'Sign in to access your account, cart, and orders.'}
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message ?? 'Enter the email linked to your account.'}
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address.',
                    },
                  })}
                />

                <FormControl fullWidth error={Boolean(errors.password)}>
                  <InputLabel htmlFor="login-password">Password</InputLabel>
                  <OutlinedInput
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    label="Password"
                    {...register('password', {
                      required: 'Password is required.',
                      minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                    })}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText>
                    {errors.password?.message ?? 'Enter your account password.'}
                  </FormHelperText>
                </FormControl>

                <FormControlLabel
                  control={<Checkbox defaultChecked {...register('rememberMe')} />}
                  label="Remember me"
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading || !isValid}
                  sx={{ py: 1.4, borderRadius: 999 }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to={isAdminLogin ? '/admin/register' : '/register'} underline="hover" fontWeight={600}>
                Register here
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;