import { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Alert } from '@mui/material';
import api, { money, errMsg } from '../../services/api';
import PageTitle from '../../components/PageTitle';
import StatusChip from '../../components/StatusChip';

const Kpi = ({ label, value, color }) => (
  <Paper sx={{ p: 2, borderLeft: 5, borderColor: color || 'primary.main' }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="h5" fontWeight={700}>{value}</Typography>
  </Paper>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data.data)).catch((e) => setError(errMsg(e)));
    api.get('/admin/reports').then((r) => setReports(r.data.data)).catch(() => {});
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;
  const k = data.kpis;
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <>
      <PageTitle>Admin Dashboard</PageTitle>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ['Total Users', k.total_users], ['Total Products', k.total_products], ['Total Orders', k.total_orders],
          ['Total Revenue (delivered)', money(k.total_revenue)], ['Pending Orders', k.pending_orders, 'warning.main'], ['Low Stock Products', k.low_stock_products, 'error.main'],
        ].map(([l, v, c]) => <Grid item xs={6} md={2} key={l}><Kpi label={l} value={v} color={c} /></Grid>)}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, overflowX: 'auto' }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Recent Orders</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Order</TableCell><TableCell>Customer</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
              <TableBody>
                {data.recentOrders.map((o) => (
                  <TableRow key={o.id}><TableCell>{o.order_number}</TableCell><TableCell>{o.customer}</TableCell><TableCell>{money(o.total_amount)}</TableCell><TableCell><StatusChip status={o.status} /></TableCell><TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, overflowX: 'auto' }}>
            <Typography fontWeight={600} sx={{ mb: 1 }}>Low Stock</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Current</TableCell><TableCell>Reorder</TableCell></TableRow></TableHead>
              <TableBody>
                {data.lowStock.map((s) => (
                  <TableRow key={s.product_id}><TableCell>{s.product}</TableCell><TableCell sx={{ color: 'error.main', fontWeight: 600 }}>{s.current_stock}</TableCell><TableCell>{s.reorder_level}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {reports && (
          <>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography fontWeight={600} sx={{ mb: 1 }}>Top Products (units sold)</Typography>
                {reports.topProducts.map((p) => <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}><span>{p.name}</span><b>{p.units_sold}</b></Box>)}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography fontWeight={600} sx={{ mb: 1 }}>Revenue by Category</Typography>
                {reports.revenueByCategory.map((c) => <Box key={c.category} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}><span>{c.category}</span><b>{money(c.revenue)}</b></Box>)}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography fontWeight={600} sx={{ mb: 1 }}>Monthly Revenue</Typography>
                {reports.monthlyRevenue.map((m) => <Box key={`${m.year}-${m.month}`} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.3 }}><span>{months[m.month]} {m.year} ({m.orders} orders)</span><b>{money(m.revenue)}</b></Box>)}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );
}
