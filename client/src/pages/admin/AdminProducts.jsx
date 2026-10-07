import { useEffect, useState, useCallback } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, IconButton, Chip, Pagination, FormControlLabel, Switch, Alert, Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api, { money, errMsg } from '../../services/api';
import PageTitle from '../../components/PageTitle';
import Notice from '../../components/Notice';

const empty = { name: '', sku: '', price: '', category_id: '', description: '', is_active: true, initial_stock: 0, reorder_level: 10 };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState(null); // null | { id?, ...form }
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get('/products', { params: { page, limit: 8, search: search || undefined, include_inactive: true, sort: 'id', order: 'ASC' } });
    setProducts(data.data.products); setTotalPages(data.data.pagination.totalPages);
  }, [page, search]);

  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data.data)); }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setFormError('');
    const { id, ...f } = dialog;
    try {
      if (id) {
        await api.put(`/products/${id}`, { name: f.name, sku: f.sku, price: Number(f.price), category_id: Number(f.category_id), description: f.description, is_active: f.is_active });
      } else {
        await api.post('/products', { ...f, price: Number(f.price), category_id: Number(f.category_id), initial_stock: Number(f.initial_stock), reorder_level: Number(f.reorder_level) });
      }
      setDialog(null); setNotice({ type: 'success', text: 'Product saved' }); load();
    } catch (e) { setFormError(errMsg(e)); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try { const { data } = await api.delete(`/products/${p.id}`); setNotice({ type: 'success', text: data.message }); load(); }
    catch (e) { setNotice({ type: 'error', text: errMsg(e) }); }
  };

  const set = (k) => (e) => setDialog({ ...dialog, [k]: e.target.value });

  return (
    <>
      <PageTitle>Manage Products</PageTitle>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField size="small" label="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={() => { setFormError(''); setDialog({ ...empty, category_id: categories[0]?.id || '' }); }}>Add product</Button>
      </Stack>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>SKU</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell><TableCell>Stock</TableCell><TableCell>Status</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.sku}</TableCell><TableCell>{p.category?.name}</TableCell>
                <TableCell>{money(p.price)}</TableCell><TableCell>{p.stock?.available_stock ?? '-'}</TableCell>
                <TableCell><Chip size="small" label={p.is_active ? 'Active' : 'Inactive'} color={p.is_active ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setFormError(''); setDialog({ ...p, price: p.price }); }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => remove(p)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Stack alignItems="center" sx={{ mt: 2 }}><Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} /></Stack>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>{dialog?.id ? 'Edit product' : 'Add product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Name" value={dialog?.name || ''} onChange={set('name')} />
            <Stack direction="row" spacing={2}>
              <TextField label="SKU" fullWidth value={dialog?.sku || ''} onChange={set('sku')} />
              <TextField label="Price (₹)" type="number" fullWidth value={dialog?.price ?? ''} onChange={set('price')} />
            </Stack>
            <TextField select label="Category" value={dialog?.category_id || ''} onChange={set('category_id')}>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Description" multiline minRows={2} value={dialog?.description || ''} onChange={set('description')} />
            {!dialog?.id && (
              <Stack direction="row" spacing={2}>
                <TextField label="Initial stock" type="number" fullWidth value={dialog?.initial_stock} onChange={set('initial_stock')} />
                <TextField label="Reorder level" type="number" fullWidth value={dialog?.reorder_level} onChange={set('reorder_level')} />
              </Stack>
            )}
            <FormControlLabel control={<Switch checked={!!dialog?.is_active} onChange={(e) => setDialog({ ...dialog, is_active: e.target.checked })} />} label="Active" />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
