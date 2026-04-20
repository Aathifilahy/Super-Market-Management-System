import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
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

function AppShell() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdminOrInventory = isAdminOrInventoryRole(user?.role);
  const isCashier = isCashierRole(user?.role);
  const isAdmin = normalizeRole(user?.role) === 'Admin';
  const inventoryHomeRoute = isAdmin ? '/admin/products' : '/inventory/dashboard';

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Supermarket Management
          </Typography>

            <Button color="inherit" component={Link} to="/">
              Home
            </Button>

            {!isAuthenticated || !isAdminOrInventory ? (
              <Button color="inherit" component={Link} to="/shop">
                Shop
              </Button>
            ) : null}

            {isAuthenticated && isCashier ? (
              <Button color="inherit" component={Link} to="/cashier/pos">
                POS
              </Button>
            ) : null}

            {isAuthenticated && isAdminOrInventory ? (
              <>
                <Button color="inherit" component={Link} to={inventoryHomeRoute}>
                  Inventory
                </Button>
                <Button color="inherit" component={Link} to="/add-product">
                  Add Product
                </Button>
                {isAdmin ? (
                  <Button color="inherit" component={Link} to="/admin/staff">
                    Staff
                  </Button>
                ) : null}
                {isAdmin ? (
                  <Button color="inherit" component={Link} to="/admin/reports">
                    Reports
                  </Button>
                ) : null}
                <Button color="inherit" component={Link} to="/admin/orders">
                  Order Ops
                </Button>
              </>
            ) : null}

            {isAuthenticated && !isAdminOrInventory && !isCashier ? (
              <>
                <Button color="inherit" component={Link} to="/cart">
                  Cart
                </Button>
                <Button color="inherit" component={Link} to="/orders">
                  Orders
                </Button>
              </>
            ) : null}

            {isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/profile">
                  Profile
                </Button>
                <Button
                  color="inherit"
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
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
              </>
            )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shop" element={<ProductList />} />

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
              <RequireAuth>
                <Cart />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetails />
              </RequireAuth>
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
