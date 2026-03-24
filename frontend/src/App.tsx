import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { useAuth } from './hooks/useAuth';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { isAdminOrInventoryRole } from './utils/role';

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdminOrInventory = isAdminOrInventoryRole(user?.role);
  const hideNav = location.pathname === '/start';

  return (
    <>
      {!hideNav ? (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Supermarket Management
            </Typography>

            <Button color="inherit" component={Link} to="/">
              Home
            </Button>

            {!isAuthenticated ? (
              <Button color="inherit" component={Link} to="/start">
                Get Started
              </Button>
            ) : null}

            {!isAuthenticated || !isAdminOrInventory ? (
              <Button color="inherit" component={Link} to="/shop">
                Shop
              </Button>
            ) : null}

            {isAuthenticated && isAdminOrInventory ? (
              <>
                <Button color="inherit" component={Link} to="/admin/products">
                  Inventory
                </Button>
                <Button color="inherit" component={Link} to="/add-product">
                  Add Product
                </Button>
              </>
            ) : null}

            {isAuthenticated && !isAdminOrInventory ? (
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
                    navigate('/start', { replace: true });
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
      ) : null}

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<Landing />} />
          <Route path="/shop" element={<ProductList />} />

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          <Route
            path="/admin/products"
            element={
              <RequireRole roles={['Admin', 'InventoryManager']}>
                <ProductList />
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
