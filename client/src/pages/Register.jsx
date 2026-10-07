import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Paper, TextField, Button, Typography, Alert, Stack, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await register(form); navigate('/products'); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 420, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Create account</Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" required value={form.name} onChange={set('name')} />
          <TextField label="Email" type="email" required value={form.email} onChange={set('email')} />
          <TextField label="Password (min 6 chars)" type="password" required value={form.password} onChange={set('password')} />
          <TextField label="Phone (optional)" value={form.phone} onChange={set('phone')} />
          <Button type="submit" variant="contained" size="large">Register</Button>
          <Typography variant="body2">Already registered? <Link component={RouterLink} to="/login">Login</Link></Typography>
        </Stack>
      </form>
    </Paper>
  );
}
