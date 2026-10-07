import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Button, Alert, Pagination, Stack, Box } from '@mui/material';
import api, { money, errMsg } from '../services/api';
import PageTitle from '../components/PageTitle';
import StatusChip from '../components/StatusChip';
import Notice from '../components/Notice';

export default function Orders() {
  const location = useLocation();
  const placed = location.state?.placed;
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get('/orders', { params: { page, limit: 5 } });
    setOrders(data.data.orders); setTotalPages(data.data.pagination.totalPages);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try { await api.put(`/orders/${id}/status`, { status: 'cancelled' }); setNotice({ type: 'success', text: 'Order cancelled, stock restored' }); load(); }
    catch (e) { setNotice({ type: 'error', text: errMsg(e) }); }
  };

  return (
    <>
      <PageTitle>My Orders</PageTitle>
      {placed && <Alert severity="success" sx={{ mb: 2 }}>Order confirmed! Your order number is <b>{placed.order_number}</b> — payment: {placed.payment?.payment_method} ({placed.payment?.payment_status}).</Alert>}
      {orders.length === 0 && <Typography>No orders yet.</Typography>}
      {orders.map((o) => (
        <Paper key={o.id} sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 1 }}>
            <Box><Typography fontWeight={600}>{o.order_number}</Typography><Typography variant="caption">{new Date(o.created_at).toLocaleString()}</Typography></Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip status={o.status} />
              {o.payment && <StatusChip status={o.payment.payment_status} />}
              <Typography fontWeight={600}>{money(o.total_amount)}</Typography>
              {['pending', 'confirmed', 'processing', 'shipped'].includes(o.status) && <Button size="small" color="error" onClick={() => cancel(o.id)}>Cancel</Button>}
            </Stack>
          </Stack>
          <Table size="small">
            <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Price paid</TableCell><TableCell>Qty</TableCell><TableCell>Subtotal</TableCell></TableRow></TableHead>
            <TableBody>
              {o.items.map((i) => (
                <TableRow key={i.id}><TableCell>{i.product?.name}</TableCell><TableCell>{money(i.price)}</TableCell><TableCell>{i.quantity}</TableCell><TableCell>{money(i.subtotal)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      ))}
      <Stack alignItems="center"><Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} /></Stack>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
