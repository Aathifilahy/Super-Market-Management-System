import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Link,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { RegisterFormData } from '../types/auth';
import { useAuth } from '../hooks/useAuth';

type PasswordStrength = {
  score: number;
  label: string;
  color: 'error' | 'warning' | 'success';
};

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  if (score <= 25) {
    return { score, label: 'Weak', color: 'error' };
  }

  if (score <= 75) {
    return { score, label: 'Medium', color: 'warning' };
  }

  return { score, label: 'Strong', color: 'success' };
}

function AdminRegister() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Admin',
      address: '',
      phone: '',
      rememberMe: true,
    },
  });

  const password = watch('password', '');
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watch('name'), watch('email'), watch('password'), watch('confirmPassword'), watch('address'), watch('phone')]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      await registerUser({
        ...data,
        role: 'Admin',
      });
      navigate('/admin/products');
    } catch {
      // Error is surfaced via auth context state.
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, md: 6 } }}>
      <Card sx={{ width: '100%', maxWidth: 720, borderRadius: 4, boxShadow: 6 }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Create admin account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Register an admin account for inventory and system management.
              </Typography>
            </Box>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    autoComplete="name"
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message ?? 'Enter your full name.'}
                    {...register('name', {
                      required: 'Name is required.',
                      minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                      maxLength: { value: 100, message: 'Name must be at most 100 characters.' },
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={Boolean(errors.password)}>
                    <InputLabel htmlFor="admin-register-password">Password</InputLabel>
                    <OutlinedInput
                      id="admin-register-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      label="Password"
                      {...register('password', {
                        required: 'Password is required.',
                        minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                        validate: {
                          hasUppercase: (value) => /[A-Z]/.test(value) || 'Include at least one uppercase letter.',
                          hasNumber: (value) => /[0-9]/.test(value) || 'Include at least one number.',
                        },
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
                      {errors.password?.message ?? 'At least 8 characters, with uppercase and number.'}
                    </FormHelperText>
                  </FormControl>

                  <Box sx={{ mt: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" mb={0.75}>
                      <Typography variant="caption" color="text.secondary">
                        Password strength
                      </Typography>
                      <Typography variant="caption" color={`${passwordStrength.color}.main`}>
                        {passwordStrength.label}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={password ? passwordStrength.score : 0}
                      color={passwordStrength.color}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth error={Boolean(errors.confirmPassword)}>
                    <InputLabel htmlFor="admin-register-confirm-password">Confirm Password</InputLabel>
                    <OutlinedInput
                      id="admin-register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      label="Confirm Password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password.',
                        validate: (value) => value === password || 'Passwords do not match.',
                      })}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    <FormHelperText>
                      {errors.confirmPassword?.message ?? 'Re-enter the same password.'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    minRows={3}
                    error={Boolean(errors.address)}
                    helperText={errors.address?.message ?? 'Optional'}
                    {...register('address', {
                      maxLength: { value: 500, message: 'Address must be at most 500 characters.' },
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    autoComplete="tel"
                    error={Boolean(errors.phone)}
                    helperText={errors.phone?.message ?? 'Optional'}
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9+()\-\s]{7,20}$/,
                        message: 'Enter a valid phone number.',
                      },
                    })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isLoading || !isValid}
                    sx={{ py: 1.4, borderRadius: 999 }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Admin Account'}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Already have an admin account?{' '}
              <Link component={RouterLink} to="/admin/login" underline="hover" fontWeight={600}>
                Sign in here
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminRegister;
