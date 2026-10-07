import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStock from './pages/admin/AdminStock';

export default function App() {
  const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;
  const admin = (el) => <ProtectedRoute adminOnly>{el}</ProtectedRoute>;
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={guard(<Checkout />)} />
        <Route path="/orders" element={guard(<Orders />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/admin/dashboard" element={admin(<Dashboard />)} />
        <Route path="/admin/products" element={admin(<AdminProducts />)} />
        <Route path="/admin/categories" element={admin(<AdminCategories />)} />
        <Route path="/admin/orders" element={admin(<AdminOrders />)} />
        <Route path="/admin/stock" element={admin(<AdminStock />)} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}
