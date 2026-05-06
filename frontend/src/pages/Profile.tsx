import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import authApi, { ApiErrorResponse, ChangePasswordData, UpdateProfileData } from '../services/authApi';
import { adminUsersApi } from '../services/adminUsersApi';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types/auth';
import { normalizeRole } from '../utils/role';

type ProfileFormData = UpdateProfileData;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as ApiErrorResponse).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

function Profile() {
  const { user, token, isLoading: authLoading, setAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);

  const requestedUserId = Number(searchParams.get('userId'));
  const isAdmin = normalizeRole(user?.role) === 'Admin';
  const isStaffProfileView = isAdmin && Number.isFinite(requestedUserId) && requestedUserId > 0 && requestedUserId !== user?.id;
  const activeProfileUser = viewedUser ?? user;
  const isViewingAnotherProfile = Boolean(isStaffProfileView && viewedUser);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileFormData>({
    mode: 'onChange',
    defaultValues: {
      name: user?.name ?? '',
      address: user?.address ?? '',
      phone: user?.phone ?? '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch,
    formState: { errors: passwordErrors, isValid: isPasswordValid },
  } = useForm<ChangePasswordData>({
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch('newPassword', '');

  useEffect(() => {
    if (!activeProfileUser) {
      return;
    }

    reset({
      name: activeProfileUser.name,
      address: activeProfileUser.address ?? '',
      phone: activeProfileUser.phone ?? '',
    });
  }, [activeProfileUser, reset]);

  useEffect(() => {
    let ignore = false;

    async function loadViewedStaffProfile() {
      if (!isStaffProfileView) {
        setViewedUser(null);
        return;
      }

      if (!token) {
        setPageLoading(false);
        return;
      }

      try
      {
        setPageLoading(true);
        setPageError(null);
        const profile = await adminUsersApi.getStaffUserById(token, requestedUserId);

        if (ignore) {
          return;
        }

        setViewedUser(profile);
      }
      catch (error)
      {
        if (!ignore) {
          setPageError(getErrorMessage(error));
        }
      }
      finally
      {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    }

    void loadViewedStaffProfile();

    return () => {
      ignore = true;
    };
  }, [isStaffProfileView, requestedUserId, token]);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      if (isStaffProfileView) {
        return;
      }

      if (!token) {
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setPageError(null);
        const profile = await authApi.getProfile(token);

        if (ignore) {
          return;
        }

        setAuth(profile, token);
        reset({
          name: profile.name,
          address: profile.address ?? '',
          phone: profile.phone ?? '',
        });
      } catch (error) {
        if (!ignore) {
          setPageError(getErrorMessage(error));
        }
      } finally {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [isStaffProfileView, token, setAuth, reset]);

  const onSubmitProfile: SubmitHandler<ProfileFormData> = async (data) => {
    if (isViewingAnotherProfile) {
      setPageError('Profile updates for other users are not available on this page.');
      return;
    }

    if (!token) {
      setPageError('You must be logged in to update your profile.');
      return;
    }

    try {
      setSavingProfile(true);
      setPageError(null);
      setSuccessMessage(null);

      const updatedUser = await authApi.updateProfile({
        name: data.name.trim(),
        address: data.address?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      });

      setAuth(updatedUser, token);
      reset({
        name: updatedUser.name,
        address: updatedUser.address ?? '',
        phone: updatedUser.phone ?? '',
      });
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmitPassword: SubmitHandler<ChangePasswordData> = async (data) => {
    try {
      setChangingPassword(true);
      setPageError(null);
      setSuccessMessage(null);

      await authApi.changePassword(data);
      setPasswordDialogOpen(false);
      resetPasswordForm();
      setSuccessMessage('Password changed successfully.');
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const identityRows = useMemo(
    () => [
      { label: 'Email', value: activeProfileUser?.email ?? '-' },
      { label: 'Role', value: String(activeProfileUser?.role ?? '-') },
      { label: 'Status', value: activeProfileUser?.isActive ? 'Active' : 'Inactive' },
    ],
    [activeProfileUser]
  );

  if (authLoading || pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {isViewingAnotherProfile ? 'Staff Profile' : 'My Account'}
        </Typography>
        <Typography color="text.secondary">
          {isViewingAnotherProfile
            ? 'Viewing selected staff profile details.'
            : 'Manage your personal details and account security.'}
        </Typography>
      </Box>

      {pageError ? <Alert severity="error">{pageError}</Alert> : null}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

      <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab label="Profile" />
            <Tab label="Orders" />
          </Tabs>

          {tab === 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight={700}>
                        {activeProfileUser?.name ?? 'User'}
                      </Typography>
                      {identityRows.map((row) => (
                        <Box key={row.label}>
                          <Typography variant="caption" color="text.secondary">
                            {row.label}
                          </Typography>
                          <Typography variant="body1">{row.value}</Typography>
                        </Box>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      {!isViewingAnotherProfile ? (
                        <Button variant="outlined" onClick={() => setPasswordDialogOpen(true)}>
                          Change Password
                        </Button>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box component="form" onSubmit={handleSubmit(onSubmitProfile)} noValidate>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Name"
                      disabled={isViewingAnotherProfile}
                      error={Boolean(errors.name)}
                      helperText={errors.name?.message ?? 'Displayed across your account.'}
                      {...register('name', {
                        required: 'Name is required.',
                        minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                        maxLength: { value: 100, message: 'Name must be at most 100 characters.' },
                      })}
                    />

                    <TextField
                      fullWidth
                      label="Address"
                      disabled={isViewingAnotherProfile}
                      multiline
                      minRows={3}
                      error={Boolean(errors.address)}
                      helperText={errors.address?.message ?? 'Optional'}
                      {...register('address', {
                        maxLength: { value: 500, message: 'Address must be at most 500 characters.' },
                      })}
                    />

                    <TextField
                      fullWidth
                      label="Phone"
                      disabled={isViewingAnotherProfile}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone?.message ?? 'Optional'}
                      {...register('phone', {
                        pattern: {
                          value: /^[0-9+()\-\s]{7,20}$/,
                          message: 'Enter a valid phone number.',
                        },
                      })}
                    />

                    <Stack direction="row" justifyContent="flex-end">
                      {!isViewingAnotherProfile ? (
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={savingProfile || !isDirty || !isValid}
                          sx={{ minWidth: 180 }}
                        >
                          {savingProfile ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Orders
                </Typography>
                <Typography color="text.secondary">
                  Your order history tab is ready. Order listing can be connected here next.
                </Typography>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onClose={() => !changingPassword && setPasswordDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Change Password</DialogTitle>
        <Box component="form" onSubmit={handlePasswordSubmit(onSubmitPassword)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                error={Boolean(passwordErrors.currentPassword)}
                helperText={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword', {
                  required: 'Current password is required.',
                  minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                })}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                error={Boolean(passwordErrors.newPassword)}
                helperText={passwordErrors.newPassword?.message ?? 'Use at least 8 characters.'}
                {...registerPassword('newPassword', {
                  required: 'New password is required.',
                  minLength: { value: 8, message: 'Password must be at least 8 characters.' },
                  validate: {
                    hasUppercase: (value) => /[A-Z]/.test(value) || 'Include at least one uppercase letter.',
                    hasNumber: (value) => /[0-9]/.test(value) || 'Include at least one number.',
                  },
                })}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                error={Boolean(passwordErrors.confirmNewPassword)}
                helperText={passwordErrors.confirmNewPassword?.message}
                {...registerPassword('confirmNewPassword', {
                  required: 'Please confirm your new password.',
                  validate: (value) => value === newPassword || 'Passwords do not match.',
                })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => {
                setPasswordDialogOpen(false);
                resetPasswordForm();
              }}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={changingPassword || !isPasswordValid}>
              {changingPassword ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
}

export default Profile;