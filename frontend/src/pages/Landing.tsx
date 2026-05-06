import React from 'react';
import { alpha } from '@mui/material/styles';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { Box, Button, Card, CardContent, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();

  const blue = theme.palette.info.light;
  const orange = theme.palette.warning.light;
  const pink = theme.palette.secondary.light;
  const surface = theme.palette.background.paper;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: { xs: 'auto', md: 'calc(100vh - 170px)' },
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 4 },
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          background:
            `radial-gradient(circle at 15% 20%, ${alpha(blue, 0.55)} 0%, transparent 55%),` +
            `radial-gradient(circle at 85% 25%, ${alpha(pink, 0.45)} 0%, transparent 60%),` +
            `radial-gradient(circle at 55% 90%, ${alpha(orange, 0.35)} 0%, transparent 60%),` +
            `linear-gradient(135deg, ${alpha(blue, 0.18)} 0%, ${alpha(pink, 0.12)} 45%, ${alpha(
              orange,
              0.14,
            )} 100%)`,
          filter: 'saturate(1.15)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: -200,
          opacity: 0.55,
          background:
            `conic-gradient(from 180deg at 50% 50%, ${alpha(
              blue,
              0.18,
            )} 0deg, ${alpha(pink, 0.18)} 120deg, ${alpha(orange, 0.18)} 240deg, ${alpha(
              blue,
              0.18,
            )} 360deg)`,
          transform: 'rotate(-12deg)',
          filter: 'blur(24px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          opacity: 0.14,
          background:
            `repeating-linear-gradient(135deg, ${alpha(
              theme.palette.common.white,
              0.9,
            )} 0px, ${alpha(theme.palette.common.white, 0.9)} 1px, transparent 1px, transparent 14px)`,
          mixBlendMode: 'soft-light',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Card
        sx={{
          width: '100%',
          maxWidth: 1040,
          borderRadius: { xs: 4, md: 6 },
          boxShadow: '0 30px 90px rgba(25, 118, 210, 0.18)',
          bgcolor: alpha(surface, 0.82),
          border: `1px solid ${alpha(theme.palette.common.white, 0.62)}`,
          backdropFilter: 'blur(16px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 3, md: 3 }} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: '0.22em',
                      fontWeight: 700,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Modern Retail Experience
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      mt: 1.5,
                      fontWeight: 800,
                      lineHeight: 1.06,
                      fontSize: { xs: '2.6rem', md: '4rem' },
                    }}
                  >
                    Online Supermarket Management System
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 2, maxWidth: 560, lineHeight: 1.8, fontSize: { xs: '1rem', md: '1.05rem' } }}
                  >
                    Customers can shop online through a clean, modern storefront with quick access
                    to registration, login, and product browsing.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                    '& > *': {
                      flex: { sm: '1 1 0' },
                    },
                  }}
                >
                  {[
                    {
                      icon: <ShoppingBagRoundedIcon fontSize="small" />,
                      text: 'Clean shopping flow',
                      color: theme.palette.primary.main,
                    },
                    {
                      icon: <VerifiedRoundedIcon fontSize="small" />,
                      text: 'Professional presentation',
                      color: theme.palette.secondary.main,
                    },
                    {
                      icon: <LocalShippingRoundedIcon fontSize="small" />,
                      text: 'Responsive on all screens',
                      color: theme.palette.primary.dark,
                    },
                  ].map((item) => (
                    <Card
                      key={item.text}
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.common.white, 0.66),
                        border: `1px solid ${alpha(theme.palette.common.white, 0.82)}`,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <CardContent sx={{ p: 2.25 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 3,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: alpha(item.color, 0.14),
                              color: item.color,
                              flexShrink: 0,
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography color="text.secondary" fontWeight={600}>
                            {item.text}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 4.5,
                  background: `linear-gradient(180deg, ${alpha(
                    theme.palette.common.white,
                    0.82,
                  )} 0%, ${alpha(theme.palette.common.white, 0.66)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.85)}`,
                  boxShadow: '0 22px 50px rgba(15, 23, 42, 0.08)',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h4" fontWeight={800} sx={{ mt: 1.2 }}>
                        Start shopping
                      </Typography>
                      <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.7 }}>
                        Use the options below to create an account, sign in, or browse products.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          Quick access
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          Everything you need is right here
                        </Typography>
                      </Stack>
                    </Box>

                    <Stack spacing={1.5}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/register')}
                        sx={{
                          py: 1.5,
                          borderRadius: 999,
                          fontWeight: 700,
                          boxShadow: '0 14px 30px rgba(25, 118, 210, 0.2)',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }}
                      >
                        Register
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/login')}
                        sx={{
                          py: 1.5,
                          borderRadius: 999,
                          fontWeight: 700,
                          borderColor: alpha(theme.palette.primary.main, 0.28),
                          color: theme.palette.primary.main,
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="text"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/shop')}
                        sx={{
                          py: 1.25,
                          borderRadius: 999,
                          fontWeight: 700,
                          color: theme.palette.secondary.main,
                        }}
                      >
                        Browse
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
