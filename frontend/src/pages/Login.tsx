import React, { useEffect, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginFormData } from '../types/auth';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../utils/role';

function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login, logout, isLoading, error, clearError, user, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const role = normalizeRole(user.role);
    if (role === 'Admin') {
      navigate('/admin/products', { replace: true });
      return;
    }

    if (role === 'InventoryManager') {
      navigate('/inventory/dashboard', { replace: true });
      return;
    }

    if (role === 'Cashier') {
      navigate('/cashier/pos', { replace: true });
      return;
    }

    if (role === 'Customer') {
      navigate('/shop', { replace: true });
      return;
    }

    logout();
    navigate('/shop', { replace: true });
  }, [isAuthenticated, user, navigate, logout]);

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

  const featureItems = [
    {
      icon: <Inventory2RoundedIcon fontSize="small" />,
      title: 'Inventory visibility',
      description: 'Track stock movement, supplier activity, and product updates in one place.',
    },
    {
      icon: <LocalMallRoundedIcon fontSize="small" />,
      title: 'Seamless shopping',
      description: 'Customers can continue shopping, checking out, and reviewing their orders.',
    },
    {
      icon: <SecurityRoundedIcon fontSize="small" />,
      title: 'Secure access',
      description: 'Role-aware access keeps staff tools and customer flows neatly separated.',
    },
  ];

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: alpha(theme.palette.common.white, 0.94),
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.16),
      },
      '&:hover fieldset': {
        borderColor: alpha(theme.palette.primary.main, 0.36),
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
      },
    },
  };

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
          inset: { xs: -24, md: -56 },
          background:
            `radial-gradient(circle at 12% 18%, ${alpha(theme.palette.primary.light, 0.22)} 0%, transparent 34%),` +
            `radial-gradient(circle at 90% 12%, ${alpha(theme.palette.secondary.light, 0.24)} 0%, transparent 34%),` +
            `radial-gradient(circle at 82% 92%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 30%)`,
          pointerEvents: 'none',
        }}
      />

      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          maxWidth: 1080,
          mx: 'auto',
          borderRadius: { xs: 4, md: 6 },
          bgcolor: alpha(theme.palette.background.paper, 0.88),
          border: `1px solid ${alpha(theme.palette.common.white, 0.72)}`,
          boxShadow: '0 32px 80px rgba(25, 118, 210, 0.18)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: 'relative',
                height: '100%',
                minHeight: { xs: 280, md: 100 },
                overflow: 'hidden',
                px: { xs: 3, sm: 4, md: 4.5 },
                py: { xs: 4, md: 5 },
                background:
                  `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${alpha(
                    theme.palette.primary.dark,
                    0.92,
                  )} 48%, ${theme.palette.secondary.main} 100%)`,
                color: theme.palette.common.white,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    `radial-gradient(circle at 18% 22%, ${alpha(
                      theme.palette.common.white,
                      0.26,
                    )} 0%, transparent 32%),` +
                    `radial-gradient(circle at 86% 18%, ${alpha(
                      theme.palette.common.white,
                      0.18,
                    )} 0%, transparent 28%),` +
                    `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.common.black, 0.12)} 100%)`,
                }}
              />

              <Stack sx={{ position: 'relative', zIndex: 1, height: '100%' }} spacing={3.5}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ letterSpacing: '0.22em', opacity: 0.88, fontWeight: 700 }}
                  >
                    Supermarket Portal
                  </Typography>
                  <Typography variant="h3" fontWeight={800} sx={{ mt: 1.5, maxWidth: 320 }}>
                    Welcome back to your retail workspace.
                  </Typography>
                  <Typography sx={{ mt: 1.5, maxWidth: 380, opacity: 0.92, lineHeight: 1.7 }}>
                    Sign in to manage shopping activity, customer orders, and daily supermarket
                    operations with confidence.
                  </Typography>
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        p: 2,
                        bgcolor: alpha(theme.palette.common.white, 0.14),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Typography variant="h5" fontWeight={800}>
                        24/7
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        Account access
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        p: 2,
                        bgcolor: alpha(theme.palette.common.white, 0.14),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Typography variant="h5" fontWeight={800}>
                        Live
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        Inventory updates
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Stack spacing={1.5}>
                  {featureItems.map((item) => (
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

          <Grid size={{ xs: 12, md: 7 }}>
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Stack spacing={3.5}>
                <Box>
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    Sign in to your account
                  </Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
                    Continue to your cart, orders, or staff workspace using the same secure account
                    you already have.
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
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      autoComplete="email"
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message ?? 'Enter the email linked to your account.'}
                      sx={textFieldSx}
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
                        sx={{
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.common.white, 0.94),
                          '&.Mui-focused': {
                            boxShadow: `0 0 0 4px ${alpha(theme.palette.secondary.main, 0.1)}`,
                          },
                        }}
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

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={<Checkbox defaultChecked {...register('rememberMe')} />}
                        label="Remember me"
                      />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        Protected authentication for customers and staff
                      </Typography>
                    </Stack>

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
                        boxShadow: '0 16px 30px rgba(220, 0, 78, 0.22)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                  </Stack>
                </Box>

                <Divider>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                    New to the platform?
                  </Typography>
                </Divider>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Don&apos;t have an account?{' '}
                  <Link component={RouterLink} to="/register" underline="hover" fontWeight={700}>
                    Register here
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

export default Login;
