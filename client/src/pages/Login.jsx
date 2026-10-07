import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Paper, TextField, Button, Typography, Alert, Stack, Link } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/products', { replace: true });
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 420, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Login</Typography>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" variant="contained" size="large">Login</Button>
          <Typography variant="body2">No account? <Link component={RouterLink} to="/register">Register</Link></Typography>
          <Alert severity="info" sx={{ fontSize: 13 }}>
            Demo: admin@shoplite.com / Admin@123<br />Customer: rahul@shoplite.com / Customer@123
          </Alert>
        </Stack>
      </form>
    </Paper>
  );
}
