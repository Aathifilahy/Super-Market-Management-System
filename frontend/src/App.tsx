import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import StaffManagement from './pages/StaffManagement';
import AdminReports from './pages/AdminReports';
import AdminOrderOperations from './pages/AdminOrderOperations';
import InventoryLayout from './pages/InventoryLayout';
import InventoryDashboard from './pages/InventoryDashboard';
import SuppliersPage from './pages/SuppliersPage';
import StockPurchasesPage from './pages/StockPurchasesPage';
import InventoryLowStockPage from './pages/InventoryLowStockPage';
import CashierLayout from './pages/CashierLayout';
import CashierDashboard from './pages/CashierDashboard';
import { isAdminOrInventoryRole, isCashierRole, normalizeRole } from './utils/role';

function StaffAwareShopRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <ProductList />;
  }

  const role = normalizeRole(user.role);
  if (role === 'Cashier') {
    return <Navigate to="/cashier/pos" replace />;
  }

  if (role === 'Admin') {
    return <Navigate to="/admin/products" replace />;
  }

  if (role === 'InventoryManager') {
    return <Navigate to="/inventory/dashboard" replace />;
  }

  return <ProductList />;
}

function AppShell() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdminOrInventory = isAdminOrInventoryRole(user?.role);
  const isCashier = isCashierRole(user?.role);
  const isAdmin = normalizeRole(user?.role) === 'Admin';
  const inventoryHomeRoute = isAdmin ? '/admin/products' : '/inventory/dashboard';
  const navButtonSx = {
    borderRadius: 999,
    px: { xs: 1.25, md: 1.8 },
    py: 0.9,
    minWidth: 'auto',
    textTransform: 'none',
    fontWeight: 700,
    letterSpacing: 0.2,
    color: alpha(theme.palette.common.white, 0.92),
    '&:hover': {
      bgcolor: alpha(theme.palette.common.white, 0.12),
    },
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${alpha(
            theme.palette.primary.dark,
            0.96,
          )} 45%, ${theme.palette.secondary.main} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
          boxShadow: '0 18px 40px rgba(25, 118, 210, 0.18)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 72, md: 78 },
            px: { xs: 1, sm: 2 },
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: -0.3,
              color: theme.palette.common.white,
            }}
          >
            Supermarket Management
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 0.5 }}>
            <Button color="inherit" component={Link} to="/" sx={navButtonSx}>
              Home
            </Button>

            {!isAuthenticated || (!isAdminOrInventory && !isCashier) ? (
              <Button color="inherit" component={Link} to="/shop" sx={navButtonSx}>
                Shop
              </Button>
            ) : null}

            {isAuthenticated && isCashier ? (
              <Button color="inherit" component={Link} to="/cashier/pos" sx={navButtonSx}>
                POS
              </Button>
            ) : null}

            {isAuthenticated && isAdminOrInventory ? (
              <>
                <Button color="inherit" component={Link} to={inventoryHomeRoute} sx={navButtonSx}>
                  Inventory
                </Button>
                <Button color="inherit" component={Link} to="/add-product" sx={navButtonSx}>
                  Add Product
                </Button>
                {isAdmin ? (
                  <Button color="inherit" component={Link} to="/admin/staff" sx={navButtonSx}>
                    Staff
                  </Button>
                ) : null}
                {isAdmin ? (
                  <Button color="inherit" component={Link} to="/admin/reports" sx={navButtonSx}>
                    Reports
                  </Button>
                ) : null}
                <Button color="inherit" component={Link} to="/admin/orders" sx={navButtonSx}>
                  Order Ops
                </Button>
              </>
            ) : null}

            {isAuthenticated && !isAdminOrInventory && !isCashier ? (
              <>
                <Button color="inherit" component={Link} to="/cart" sx={navButtonSx}>
                  Cart
                </Button>
                <Button color="inherit" component={Link} to="/orders" sx={navButtonSx}>
                  Orders
                </Button>
              </>
            ) : null}

            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/profile" sx={navButtonSx}>
                  Profile
                </Button>
                <Button
                  color="inherit"
                  sx={navButtonSx}
                  onClick={() => {
                    logout();
                    navigate('/', { replace: true });
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/register" sx={navButtonSx}>
                  Register
                </Button>
                <Button color="inherit" component={Link} to="/login" sx={navButtonSx}>
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<StaffAwareShopRoute />} />

          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/register" element={<Navigate to="/register" replace />} />

          <Route
            path="/admin/products"
            element={
              <RequireRole roles={['Admin', 'InventoryManager']}>
                <ProductList />
              </RequireRole>
            }
          />

          <Route
            path="/inventory"
            element={
              <RequireRole roles={['Admin', 'InventoryManager']}>
                <InventoryLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InventoryDashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="purchases" element={<StockPurchasesPage />} />
            <Route path="low-stock" element={<InventoryLowStockPage />} />
          </Route>

          <Route
            path="/cashier"
            element={
              <RequireRole roles={['Cashier']}>
                <CashierLayout />
              </RequireRole>
            }
          >
            <Route index element={<Navigate to="pos" replace />} />
            <Route path="pos" element={<CashierDashboard />} />
          </Route>

          <Route
            path="/admin/staff"
            element={
              <RequireRole roles={['Admin']}>
                <StaffManagement />
              </RequireRole>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <RequireRole roles={['Admin']}>
                <AdminReports />
              </RequireRole>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <RequireRole roles={['Admin', 'InventoryManager']}>
                <AdminOrderOperations />
              </RequireRole>
            }
          />

          <Route
            path="/add-product"
            element={
              <RequireRole roles={['Admin', 'InventoryManager']}>
                <AddProduct />
              </RequireRole>
            }
          />
          <Route
            path="/edit-product/:id"
            element={
              <RequireRole roles={['Admin', 'InventoryManager']}>
                <EditProduct />
              </RequireRole>
            }
          />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireRole roles={['Customer']}>
                <Cart />
              </RequireRole>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireRole roles={['Customer']}>
                <Checkout />
              </RequireRole>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireRole roles={['Customer']}>
                <Orders />
              </RequireRole>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireRole roles={['Customer']}>
                <OrderDetails />
              </RequireRole>
            }
          />
        </Routes>
      </Container>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
