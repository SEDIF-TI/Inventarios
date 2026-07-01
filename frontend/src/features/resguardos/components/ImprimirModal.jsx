import { Box, Typography, Stack } from '@mui/material'
import LabelIcon       from '@mui/icons-material/Label'
import DescriptionIcon from '@mui/icons-material/Description'
import AppModal from '@/components/ui/AppModal'

export default function ImprimirModal({ open, onClose, onSelect }) {
  const handle = (tipo) => { onSelect(tipo); onClose() }

  const cardSx = {
    flex: 1,
    border: '2px solid',
    borderColor: 'divider',
    borderRadius: 3,
    p: 3,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 150ms',
    '&:hover': { borderColor: '#db2777', bgcolor: 'rgba(219,39,119,0.04)' },
  }

  return (
    <AppModal open={open} onClose={onClose} title="Seleccionar tipo de impresión" maxWidth="sm">
      <Stack direction="row" spacing={2} sx={{ pt: 1 }}>

        <Box sx={cardSx} onClick={() => handle('etiquetas')}>
          <LabelIcon sx={{ fontSize: 44, color: '#db2777', mb: 1 }} />
          <Typography fontWeight={700} mb={0.5}>Etiquetas</Typography>
          <Typography variant="caption" color="text.secondary">
            Datos mínimos para etiquetas físicas 3×10
          </Typography>
        </Box>

        <Box sx={cardSx} onClick={() => handle('formatos')}>
          <DescriptionIcon sx={{ fontSize: 44, color: '#db2777', mb: 1 }} />
          <Typography fontWeight={700} mb={0.5}>Formatos</Typography>
          <Typography variant="caption" color="text.secondary">
            Resguardos oficiales de bienes muebles
          </Typography>
        </Box>

      </Stack>
    </AppModal>
  )
}
