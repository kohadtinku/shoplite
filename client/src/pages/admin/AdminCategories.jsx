import { useEffect, useState, useCallback } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, IconButton, Alert, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api, { errMsg } from '../../services/api';
import PageTitle from '../../components/PageTitle';
import Notice from '../../components/Notice';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(null);

  const load = useCallback(() => api.get('/categories').then((r) => setCategories(r.data.data)), []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setFormError('');
    try {
      const body = { name: dialog.name, description: dialog.description };
      if (dialog.id) await api.put(`/categories/${dialog.id}`, body); else await api.post('/categories', body);
      setDialog(null); setNotice({ type: 'success', text: 'Category saved' }); load();
    } catch (e) { setFormError(errMsg(e)); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try { await api.delete(`/categories/${c.id}`); setNotice({ type: 'success', text: 'Category deleted' }); load(); }
    catch (e) { setNotice({ type: 'error', text: errMsg(e) }); }
  };

  return (
    <>
      <PageTitle>Manage Categories</PageTitle>
      <Box sx={{ mb: 2, textAlign: 'right' }}><Button variant="contained" onClick={() => { setFormError(''); setDialog({ name: '', description: '' }); }}>Add category</Button></Box>
      <Paper>
        <Table size="small">
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Products</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.description}</TableCell><TableCell>{c.product_count}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setFormError(''); setDialog({ ...c }); }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => remove(c)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{dialog?.id ? 'Edit category' : 'Add category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Name" value={dialog?.name || ''} onChange={(e) => setDialog({ ...dialog, name: e.target.value })} />
            <TextField label="Description" multiline minRows={2} value={dialog?.description || ''} onChange={(e) => setDialog({ ...dialog, description: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
