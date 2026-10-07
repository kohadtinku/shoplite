import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Badge, Container, Box, IconButton, Menu, MenuItem } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const adminLinks = [
  ['Dashboard', '/admin/dashboard'], ['Products', '/admin/products'], ['Categories', '/admin/categories'],
  ['Orders', '/admin/orders'], ['Stock', '/admin/stock'],
];

export default function MainLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar position="sticky">
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box component={RouterLink} to="/products" sx={{ color: 'inherit', textDecoration: 'none', mr: 2 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1}>ShopLite</Typography>
            <Typography variant="caption">Simple E-Commerce Management System</Typography>
          </Box>
          <Button color="inherit" component={RouterLink} to="/products">Products</Button>
          {user && !isAdmin && <Button color="inherit" component={RouterLink} to="/orders">My Orders</Button>}
          {isAdmin && adminLinks.map(([label, to]) => (
            <Button key={to} color="inherit" component={RouterLink} to={to}>{label}</Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          {!isAdmin && (
            <IconButton color="inherit" onClick={() => navigate('/cart')}>
              <Badge badgeContent={count} color="secondary"><ShoppingCartIcon /></Badge>
            </IconButton>
          )}
          {user ? (
            <>
              <Button color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>{user.name}</Button>
              <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
                <MenuItem onClick={() => { setAnchor(null); navigate('/profile'); }}>Profile</MenuItem>
                <MenuItem onClick={() => { setAnchor(null); logout(); navigate('/login'); }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}><Outlet /></Container>
    </Box>
  );
}
