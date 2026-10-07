import { useEffect, useState, useCallback } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, MenuItem, TextField, Pagination, Stack, Typography } from '@mui/material';
import api, { money, errMsg } from '../../services/api';
import PageTitle from '../../components/PageTitle';
import StatusChip from '../../components/StatusChip';
import Notice from '../../components/Notice';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get('/orders', { params: { page, limit: 10, status: status || undefined } });
    setOrders(data.data.orders); setTotalPages(data.data.pagination.totalPages);
  }, [page, status]);
  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, newStatus) => {
    try { await api.put(`/orders/${id}/status`, { status: newStatus }); setNotice({ type: 'success', text: `Order updated to ${newStatus}` }); }
    catch (e) { setNotice({ type: 'error', text: errMsg(e) }); }
    load();
  };

  return (
    <>
      <PageTitle>All Orders</PageTitle>
      <TextField select size="small" label="Filter status" sx={{ minWidth: 180, mb: 2 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
        <MenuItem value="">All</MenuItem>
        {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Items</TableCell><TableCell>Total</TableCell><TableCell>Payment</TableCell><TableCell>Status</TableCell><TableCell>Change status</TableCell></TableRow></TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.order_number}<Typography variant="caption" display="block">{new Date(o.created_at).toLocaleDateString()}</Typography></TableCell>
                <TableCell>{o.user?.name}</TableCell>
                <TableCell>{o.items.map((i) => `${i.product?.name} ×${i.quantity}`).join(', ')}</TableCell>
                <TableCell>{money(o.total_amount)}</TableCell>
                <TableCell>{o.payment?.payment_method} <StatusChip status={o.payment?.payment_status} /></TableCell>
                <TableCell><StatusChip status={o.status} /></TableCell>
                <TableCell>
                  <TextField select size="small" value="" displayEmpty disabled={['delivered', 'cancelled'].includes(o.status)} onChange={(e) => changeStatus(o.id, e.target.value)} sx={{ minWidth: 130 }} SelectProps={{ displayEmpty: true, renderValue: () => 'Update…' }}>
                    {STATUSES.filter((s) => s !== o.status).map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Stack alignItems="center" sx={{ mt: 2 }}><Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} /></Stack>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
