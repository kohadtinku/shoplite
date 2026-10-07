import { Snackbar, Alert } from '@mui/material';

// notice = { type: 'success' | 'error', text } | null
export default function Notice({ notice, onClose }) {
  return (
    <Snackbar open={!!notice} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      {notice ? <Alert severity={notice.type} onClose={onClose} variant="filled">{notice.text}</Alert> : undefined}
    </Snackbar>
  );
}
