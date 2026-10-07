import { Typography } from '@mui/material';
export default function PageTitle({ children }) {
  return <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>{children}</Typography>;
}
