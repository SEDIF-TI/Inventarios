import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function AppModal({ open, onClose, title, children, actions, maxWidth = 'sm', fullWidth = true }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3, px: 3 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}
