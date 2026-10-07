import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, TextField, Button, Typography, MenuItem, Stack, Alert, FormControlLabel, Checkbox, Divider } from '@mui/material';
import api, { money, errMsg } from '../services/api';
import { useCart } from '../context/CartContext';
import PageTitle from '../components/PageTitle';

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [method, setMethod] = useState('UPI');
  const [fail, setFail] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return <Alert severity="info">Your cart is empty.</Alert>;

  const placeOrder = async () => {
    setError(''); setBusy(true);
    try {
      // The server recalculates everything from the database - the client never sends prices.
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        shipping_address: address, payment_method: method, simulate_payment_failure: fail,
      });
      clear();
      navigate('/orders', { state: { placed: data.data } });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <>
      <PageTitle>Checkout</PageTitle>
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {items.map((i) => <Typography key={i.product_id}>{i.name} × {i.quantity} — {money(i.price * i.quantity)}</Typography>)}
          <Divider />
          <Typography variant="h6">Total: {money(total)}</Typography>
          <TextField label="Shipping address" multiline minRows={3} required value={address} onChange={(e) => setAddress(e.target.value)} />
          <TextField select label="Payment method (simulated)" value={method} onChange={(e) => setMethod(e.target.value)}>
            {['COD', 'UPI', 'CARD', 'NET_BANKING'].map((m) => <MenuItem key={m} value={m}>{m.replace('_', ' ')}</MenuItem>)}
          </TextField>
          <FormControlLabel control={<Checkbox checked={fail} onChange={(e) => setFail(e.target.checked)} />} label="Simulate payment failure (demonstrates transaction ROLLBACK — non-COD only)" />
          <Button variant="contained" size="large" disabled={busy || address.trim().length < 5} onClick={placeOrder}>{busy ? 'Placing order…' : 'Place order'}</Button>
        </Stack>
      </Paper>
    </>
  );
}
