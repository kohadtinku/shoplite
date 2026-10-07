import { useNavigate } from 'react-router-dom';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, IconButton, Typography, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../context/CartContext';
import { money } from '../services/api';
import PageTitle from '../components/PageTitle';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography gutterBottom>Your cart is empty.</Typography>
      <Button variant="contained" onClick={() => navigate('/products')}>Browse products</Button>
    </Paper>
  );

  return (
    <>
      <PageTitle>Shopping Cart</PageTitle>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Price</TableCell><TableCell>Qty</TableCell><TableCell>Subtotal</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.product_id}>
                <TableCell>{i.name}</TableCell>
                <TableCell>{money(i.price)}</TableCell>
                <TableCell><TextField type="number" size="small" sx={{ width: 80 }} value={i.quantity} inputProps={{ min: 1, max: i.max }} onChange={(e) => setQty(i.product_id, Number(e.target.value))} /></TableCell>
                <TableCell>{money(i.price * i.quantity)}</TableCell>
                <TableCell><IconButton onClick={() => remove(i.product_id)}><DeleteIcon /></IconButton></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
        <Typography variant="h6">Total: {money(total)}</Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/checkout')}>Checkout</Button>
      </Box>
    </>
  );
}
