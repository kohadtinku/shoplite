import { useEffect, useState, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid, Card, CardContent, CardActions, Typography, Button, TextField, MenuItem, Pagination, Box, Chip, Paper, Stack, CircularProgress,
} from '@mui/material';
import api, { money } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PageTitle from '../components/PageTitle';
import Notice from '../components/Notice';

export default function Products() {
  const { add } = useCart();
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ search: '', category_id: '', min_price: '', max_price: '', sort: 'created_at', order: 'DESC', page: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries({ ...filters, limit: 8 }).filter(([, v]) => v !== ''));
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data.data)); }, []);
  useEffect(() => { load(); }, [load]);

  const setF = (k) => (e) => setFilters({ ...filters, [k]: e.target.value, page: 1 });

  return (
    <>
      <PageTitle>Products</PageTitle>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><TextField fullWidth size="small" label="Search" value={filters.search} onChange={setF('search')} /></Grid>
          <Grid item xs={6} md={2}>
            <TextField select fullWidth size="small" label="Category" value={filters.category_id} onChange={setF('category_id')}>
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={3} md={1.5}><TextField fullWidth size="small" type="number" label="Min ₹" value={filters.min_price} onChange={setF('min_price')} /></Grid>
          <Grid item xs={3} md={1.5}><TextField fullWidth size="small" type="number" label="Max ₹" value={filters.max_price} onChange={setF('max_price')} /></Grid>
          <Grid item xs={6} md={2}>
            <TextField select fullWidth size="small" label="Sort by" value={filters.sort} onChange={setF('sort')}>
              <MenuItem value="created_at">Newest</MenuItem><MenuItem value="price">Price</MenuItem><MenuItem value="name">Name</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField select fullWidth size="small" label="Order" value={filters.order} onChange={setF('order')}>
              <MenuItem value="ASC">Ascending</MenuItem><MenuItem value="DESC">Descending</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? <Box sx={{ textAlign: 'center', p: 6 }}><CircularProgress /></Box> : (
        <Grid container spacing={2}>
          {products.length === 0 && <Grid item xs={12}><Typography>No products found.</Typography></Grid>}
          {products.map((p) => {
            const avail = p.stock?.available_stock ?? 0;
            return (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip size="small" label={p.category?.name} sx={{ mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight={600}>{p.name}</Typography>
                    <Typography variant="h6" color="primary">{money(p.price)}</Typography>
                    <Typography variant="body2" color={avail > 0 ? 'success.main' : 'error'}>{avail > 0 ? `In stock (${avail})` : 'Out of stock'}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={RouterLink} to={`/products/${p.id}`}>Details</Button>
                    {!isAdmin && <Button size="small" variant="contained" disabled={avail < 1} onClick={() => { add(p); setNotice({ type: 'success', text: `${p.name} added to cart` }); }}>Add to cart</Button>}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Stack alignItems="center" sx={{ mt: 3 }}>
        <Pagination count={pagination.totalPages} page={filters.page} onChange={(_, page) => setFilters({ ...filters, page })} color="primary" />
      </Stack>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
