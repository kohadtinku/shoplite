import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Typography, Button, Chip, Stack, TextField, Box, Alert, CircularProgress } from '@mui/material';
import api, { money, errMsg } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState(null);

  useEffect(() => { api.get(`/products/${id}`).then((r) => setProduct(r.data.data)).catch((e) => setError(errMsg(e))); }, [id]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!product) return <Box sx={{ textAlign: 'center', p: 6 }}><CircularProgress /></Box>;
  const avail = product.stock?.available_stock ?? 0;

  return (
    <Paper sx={{ p: 4 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>← Back</Button>
      <Chip label={product.category?.name} size="small" sx={{ mb: 1 }} />
      <Typography variant="h4" fontWeight={600}>{product.name}</Typography>
      <Typography variant="h5" color="primary" sx={{ my: 1 }}>{money(product.price)}</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>SKU: {product.sku}</Typography>
      <Typography sx={{ mb: 2 }}>{product.description}</Typography>
      <Typography color={avail > 0 ? 'success.main' : 'error'} sx={{ mb: 2 }}>{avail > 0 ? `${avail} available` : 'Out of stock'}</Typography>
      {!isAdmin && (
        <Stack direction="row" spacing={2}>
          <TextField type="number" size="small" label="Qty" sx={{ width: 100 }} value={qty} inputProps={{ min: 1, max: avail }} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
          <Button variant="contained" disabled={avail < 1} onClick={() => { add(product, qty); setNotice({ type: 'success', text: 'Added to cart' }); }}>Add to cart</Button>
          <Button onClick={() => navigate('/cart')}>Go to cart</Button>
        </Stack>
      )}
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </Paper>
  );
}
