import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assessment as BarChartIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  PointOfSale as PointOfSaleIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../utils/role';

const drawerWidth = 260;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const role = normalizeRole(user?.role);

  const getMenuLinks = () => {
    if (role === 'Admin') {
      return [
        { title: 'Dashboard', path: '/admin/products', icon: <DashboardIcon /> },
        { title: 'User Management', path: '/admin/staff', icon: <PeopleIcon /> },
        { title: 'Reports', path: '/admin/reports', icon: <BarChartIcon /> },
        { title: 'Order Ops', path: '/admin/orders', icon: <LocalShippingIcon /> },
      ];
    }
    if (role === 'InventoryManager') {
      return [
        { title: 'Dashboard', path: '/inventory/dashboard', icon: <DashboardIcon /> },
        { title: 'Stock List', path: '/inventory/products', icon: <InventoryIcon /> },
        { title: 'Suppliers', path: '/inventory/suppliers', icon: <LocalShippingIcon /> },
        { title: 'Purchase Orders', path: '/inventory/purchases', icon: <ReceiptIcon /> },
        { title: 'Low Stock Alerts', path: '/inventory/low-stock', icon: <WarningIcon /> },
      ];
    }
    if (role === 'Cashier') {
      return [
        { title: 'Active Sale', path: '/cashier/pos', icon: <PointOfSaleIcon /> },
      ];
    }
    
    // Customer / Guest
    return [
      { title: 'Shop', path: '/shop', icon: <StoreIcon /> },
      { title: 'Cart', path: '/cart', icon: <ShoppingCartIcon /> },
      { title: 'My Orders', path: '/orders', icon: <ReceiptIcon /> },
    ];
  };

  const menuLinks = getMenuLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          S
        </Box>
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          Supermarket
        </Typography>
      </Toolbar>
      <Divider sx={{ mb: 2 }} />
      <List sx={{ px: 2, flexGrow: 1 }}>
        {menuLinks.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.action.hover, 0.05),
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {user && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
              {user.name?.charAt(0) || <PersonIcon />}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" noWrap fontWeight={600}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {role}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="large" color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            {user ? (
              <>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1, p: 0 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                    {user.name?.charAt(0) || <PersonIcon />}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{
                    elevation: 3,
                    sx: { mt: 1.5, minWidth: 200, borderRadius: 2 }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ListItemButton sx={{ borderRadius: 2 }} onClick={() => navigate('/login')}>Login</ListItemButton>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}` },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          mb: { xs: '64px', md: 0 }, // margin bottom for mobile nav
          overflowX: 'hidden'
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100, borderTop: `1px solid ${theme.palette.divider}` }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(event, newValue) => {
              navigate(newValue);
            }}
          >
            {menuLinks.slice(0, 4).map(item => (
               <BottomNavigationAction
                 key={item.title}
                 label={item.title}
                 value={item.path}
                 icon={item.icon}
                 sx={{ 
                   minWidth: 'auto',
                   '&.Mui-selected': { color: 'primary.main' }
                 }}
               />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
