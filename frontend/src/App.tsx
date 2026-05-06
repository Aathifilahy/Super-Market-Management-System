import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import AppLayout from './components/AppLayout';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';

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
import InventoryDashboard from './pages/InventoryDashboard';
import SuppliersPage from './pages/SuppliersPage';
import StockPurchasesPage from './pages/StockPurchasesPage';
import InventoryLowStockPage from './pages/InventoryLowStockPage';
import CashierDashboard from './pages/CashierDashboard';
import { normalizeRole } from './utils/role';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StaffAwareShopRoute() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <ProductList />;

  const role = normalizeRole(user.role);
  if (role === 'Cashier') return <Navigate to="/cashier/pos" replace />;
  if (role === 'Admin') return <Navigate to="/admin/products" replace />;
  if (role === 'InventoryManager') return <Navigate to="/inventory/dashboard" replace />;

  return <ProductList />;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><StaffAwareShopRoute /></PageTransition>} />

        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin/register" element={<Navigate to="/register" replace />} />

        <Route path="/admin/products" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><ProductList /></PageTransition></RequireRole>} />
        
        {/* Inventory flat routes to work with AppLayout */}
        <Route path="/inventory/dashboard" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><InventoryDashboard /></PageTransition></RequireRole>} />
        <Route path="/inventory/products" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><ProductList /></PageTransition></RequireRole>} />
        <Route path="/inventory/suppliers" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><SuppliersPage /></PageTransition></RequireRole>} />
        <Route path="/inventory/purchases" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><StockPurchasesPage /></PageTransition></RequireRole>} />
        <Route path="/inventory/low-stock" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><InventoryLowStockPage /></PageTransition></RequireRole>} />

        {/* Cashier flat routes */}
        <Route path="/cashier/pos" element={<RequireRole roles={['Cashier']}><PageTransition><CashierDashboard /></PageTransition></RequireRole>} />

        <Route path="/admin/staff" element={<RequireRole roles={['Admin']}><PageTransition><StaffManagement /></PageTransition></RequireRole>} />
        <Route path="/admin/reports" element={<RequireRole roles={['Admin']}><PageTransition><AdminReports /></PageTransition></RequireRole>} />
        <Route path="/admin/orders" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><AdminOrderOperations /></PageTransition></RequireRole>} />
        
        <Route path="/add-product" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><AddProduct /></PageTransition></RequireRole>} />
        <Route path="/edit-product/:id" element={<RequireRole roles={['Admin', 'InventoryManager']}><PageTransition><EditProduct /></PageTransition></RequireRole>} />

        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />

        <Route path="/profile" element={<RequireAuth><PageTransition><Profile /></PageTransition></RequireAuth>} />
        <Route path="/cart" element={<RequireRole roles={['Customer']}><PageTransition><Cart /></PageTransition></RequireRole>} />
        <Route path="/checkout" element={<RequireRole roles={['Customer']}><PageTransition><Checkout /></PageTransition></RequireRole>} />
        <Route path="/orders" element={<RequireRole roles={['Customer']}><PageTransition><Orders /></PageTransition></RequireRole>} />
        <Route path="/orders/:id" element={<RequireRole roles={['Customer']}><PageTransition><OrderDetails /></PageTransition></RequireRole>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AppLayout>
        <AnimatedRoutes />
      </AppLayout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Router>
  );
}

export default App;
