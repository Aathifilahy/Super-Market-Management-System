import React, { useEffect, useMemo, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
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

function Register() {
  const navigate = useNavigate();
  const theme = useTheme();
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
      role: 'Customer',
      address: '',
      phone: '',
      rememberMe: true,
    },
  });

  const password = watch('password', '');
  const watchedName = watch('name', '');
  const watchedEmail = watch('email', '');
  const watchedConfirmPassword = watch('confirmPassword', '');
  const watchedAddress = watch('address', '');
  const watchedPhone = watch('phone', '');
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [
    watchedName,
    watchedEmail,
    password,
    watchedConfirmPassword,
    watchedAddress,
    watchedPhone,
    error,
    clearError,
  ]);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      await registerUser({
        ...data,
        role: 'Customer',
      });
      navigate('/');
    } catch {
      // Error is surfaced via auth context state.
    }
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: alpha(theme.palette.common.white, 0.96),
      '& fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.16),
      },
      '&:hover fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.34),
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
      },
    },
  };

  const benefitItems = [
    {
      icon: <FavoriteRoundedIcon fontSize="small" />,
      title: 'Fast customer onboarding',
      description: 'Create an account once and continue shopping with saved profile details.',
    },
    {
      icon: <LocalShippingRoundedIcon fontSize="small" />,
      title: 'Smooth order tracking',
      description: 'Keep your address and contact information ready for future deliveries.',
    },
    {
      icon: <VerifiedUserRoundedIcon fontSize="small" />,
      title: 'Protected credentials',
      description: 'Use a stronger password for safer access to your supermarket profile.',
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        px: { xs: 0, md: 2 },
        py: { xs: 2, md: 6 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: { xs: -24, md: -64 },
          background:
            `radial-gradient(circle at 14% 16%, ${alpha(theme.palette.secondary.light, 0.2)} 0%, transparent 34%),` +
            `radial-gradient(circle at 88% 14%, ${alpha(theme.palette.primary.light, 0.2)} 0%, transparent 34%),` +
            `radial-gradient(circle at 72% 92%, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 30%)`,
          pointerEvents: 'none',
        }}
      />

      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: 1180,
          mx: 'auto',
          borderRadius: { xs: 4, md: 6 },
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.common.white, 0.75)}`,
          boxShadow: '0 34px 84px rgba(25, 118, 210, 0.16)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, md: 4.5 }}>
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                px: { xs: 3, sm: 4, md: 4.5 },
                py: { xs: 4, md: 5 },
                background:
                  `linear-gradient(160deg, ${alpha(theme.palette.secondary.main, 0.98)} 0%, ${alpha(
                    theme.palette.primary.main,
                    0.94,
                  )} 100%)`,
                color: theme.palette.common.white,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    `radial-gradient(circle at 22% 18%, ${alpha(
                      theme.palette.common.white,
                      0.22,
                    )} 0%, transparent 28%),` +
                    `radial-gradient(circle at 84% 16%, ${alpha(
                      theme.palette.common.white,
                      0.14,
                    )} 0%, transparent 26%),` +
                    `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.common.black, 0.12)} 100%)`,
                }}
              />

              <Stack sx={{ position: 'relative', zIndex: 1, height: '100%' }} spacing={3.5}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: '0.22em', opacity: 0.88, fontWeight: 700 }}
                  >
                    Customer Signup
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mt: 1.5, maxWidth: 320 }}>
                    Join your supermarket account in minutes.
                  </Typography>
                  <Typography sx={{ mt: 1.5, maxWidth: 360, opacity: 0.92, lineHeight: 1.7 }}>
                    Create a polished customer profile for faster checkout, smoother order
                    tracking, and a more personal shopping experience.
                  </Typography>
                </Box>

                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3.5,
                    bgcolor: alpha(theme.palette.common.white, 0.14),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.25}>
                      <Typography variant="h6" fontWeight={700}>
                        Why customers love this flow
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.84 }}>
                        Clean onboarding, reliable account access, and all the essentials needed
                        for orders and profile management.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Stack spacing={1.5}>
                  {benefitItems.map((item) => (
                    <Stack
                      key={item.title}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                      sx={{
                        borderRadius: 3,
                        p: 1.5,
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'grid',
                          placeItems: 'center',
                          width: 38,
                          height: 38,
                          borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.common.white, 0.18),
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography fontWeight={700}>{item.title}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.84, lineHeight: 1.6 }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7.5 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Stack spacing={3.5}>
                <Box>
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    Create your account
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620 }}>
                    Register with your personal details to manage shopping, orders, and account
                    information without changing any of the existing app behavior.
                  </Typography>
                </Box>

                {error ? (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 3,
                      '& .MuiAlert-message': {
                        fontWeight: 500,
                      },
                    }}
                  >
                    {error}
                  </Alert>
                ) : null}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        autoComplete="name"
                        error={Boolean(errors.name)}
                        helperText={errors.name?.message ?? 'Enter your full name.'}
                        sx={textFieldSx}
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
                        sx={textFieldSx}
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
                        <InputLabel htmlFor="register-password">Password</InputLabel>
                        <OutlinedInput
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          label="Password"
                          sx={{
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.common.white, 0.96),
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 4px ${alpha(theme.palette.secondary.main, 0.1)}`,
                            },
                          }}
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

                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" mb={0.9}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Password strength
                          </Typography>
                          <Typography variant="caption" color={`${passwordStrength.color}.main`} fontWeight={700}>
                            {passwordStrength.label}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={password ? passwordStrength.score : 0}
                          color={passwordStrength.color}
                          sx={{
                            height: 9,
                            borderRadius: 999,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={Boolean(errors.confirmPassword)}>
                        <InputLabel htmlFor="register-confirm-password">Confirm Password</InputLabel>
                        <OutlinedInput
                          id="register-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          label="Confirm Password"
                          sx={{
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.common.white, 0.96),
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
                            },
                          }}
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
                        sx={textFieldSx}
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
                        sx={textFieldSx}
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
                        sx={{
                          py: 1.5,
                          borderRadius: 999,
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          boxShadow: '0 16px 30px rgba(25, 118, 210, 0.2)',
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <Divider>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                    Already a member?
                  </Typography>
                </Divider>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" underline="hover" fontWeight={700}>
                    Sign in here
                  </Link>
                </Typography>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default Register;
