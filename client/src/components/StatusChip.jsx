import { Chip } from '@mui/material';

const colors = {
  pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'error',
  paid: 'success', failed: 'error', refunded: 'default',
};

export default function StatusChip({ status }) {
  return <Chip size="small" label={status} color={colors[status] || 'default'} sx={{ textTransform: 'capitalize' }} />;
}
