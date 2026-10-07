import { useEffect, useState, useCallback } from 'react';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, ToggleButton, ToggleButtonGroup, Alert, Chip, Typography } from '@mui/material';
import api, { errMsg } from '../../services/api';
import PageTitle from '../../components/PageTitle';
import Notice from '../../components/Notice';

export default function AdminStock() {
  const [rows, setRows] = useState([]);
  const [onlyLow, setOnlyLow] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get(onlyLow ? '/stock/low-stock' : '/stock');
    setRows(data.data);
  }, [onlyLow]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setFormError('');
    try {
      const body = { reorder_level: Number(dialog.reorder_level) };
      if (dialog.change !== '' && Number(dialog.change) !== 0) body.change = Number(dialog.change);
      await api.put(`/stock/${dialog.product_id}`, body);
      setDialog(null); setNotice({ type: 'success', text: 'Stock updated' }); load();
    } catch (e) { setFormError(errMsg(e)); }
  };

  return (
    <>
      <PageTitle>Stock Management</PageTitle>
      <ToggleButtonGroup size="small" exclusive value={onlyLow ? 'low' : 'all'} onChange={(_, v) => v && setOnlyLow(v === 'low')} sx={{ mb: 2 }}>
        <ToggleButton value="all">All</ToggleButton><ToggleButton value="low">Low stock only</ToggleButton>
      </ToggleButtonGroup>
      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Category</TableCell><TableCell>Quantity</TableCell><TableCell>Reserved</TableCell><TableCell>Available</TableCell><TableCell>Reorder level</TableCell><TableCell /></TableRow></TableHead>
          <TableBody>
            {rows.map((s) => {
              const low = s.available_stock <= s.reorder_level;
              return (
                <TableRow key={s.id} sx={low ? { bgcolor: '#fff4f4' } : undefined}>
                  <TableCell>{s.product?.name}</TableCell><TableCell>{s.product?.category?.name}</TableCell>
                  <TableCell>{s.quantity}</TableCell><TableCell>{s.reserved_quantity}</TableCell>
                  <TableCell>{s.available_stock} {low && <Chip size="small" color="error" label="LOW" />}</TableCell>
                  <TableCell>{s.reorder_level}</TableCell>
                  <TableCell align="right"><Button size="small" onClick={() => { setFormError(''); setDialog({ product_id: s.product_id, name: s.product?.name, quantity: s.quantity, reorder_level: s.reorder_level, change: '' }); }}>Adjust</Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>Adjust stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Typography>{dialog?.name} — current quantity: <b>{dialog?.quantity}</b></Typography>
            <TextField label="Change (+ add / − remove)" type="number" value={dialog?.change ?? ''} onChange={(e) => setDialog({ ...dialog, change: e.target.value })} helperText="Example: 20 adds 20, -5 removes 5. Stock can never go below 0." />
            <TextField label="Reorder level" type="number" value={dialog?.reorder_level ?? ''} onChange={(e) => setDialog({ ...dialog, reorder_level: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialog(null)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions>
      </Dialog>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
