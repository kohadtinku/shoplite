import { useState } from 'react';
import { Paper, TextField, Button, Stack, Typography, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';
import PageTitle from '../components/PageTitle';
import Notice from '../components/Notice';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [notice, setNotice] = useState(null);

  const save = async () => {
    try { const { data } = await api.put('/users/me', form); setUser(data.data.user); setNotice({ type: 'success', text: 'Profile updated' }); }
    catch (e) { setNotice({ type: 'error', text: errMsg(e) }); }
  };

  return (
    <>
      <PageTitle>Profile</PageTitle>
      <Paper sx={{ p: 3, maxWidth: 480 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center"><Typography>{user.email}</Typography><Chip size="small" label={user.role} /></Stack>
          <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Button variant="contained" onClick={save}>Save changes</Button>
        </Stack>
      </Paper>
      <Notice notice={notice} onClose={() => setNotice(null)} />
    </>
  );
}
