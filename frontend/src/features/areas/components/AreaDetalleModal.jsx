import { Box, Typography, Chip, Grid2 as Grid } from '@mui/material'
import AppModal from '@/components/ui/AppModal'

function Campo({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export default function AreaDetalleModal({ open, onClose, area }) {
  if (!area) return null

  return (
    <AppModal open={open} onClose={onClose} title="Detalle del área">
      <Grid container spacing={3}>
        <Grid size={6}>
          <Campo label="Código" value={area.codigo} />
        </Grid>
        <Grid size={6}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Estado
          </Typography>
          <Chip
            label={area.areaActiva ? 'Activa' : 'Inactiva'}
            color={area.areaActiva ? 'success' : 'default'}
            size="small"
          />
        </Grid>
        <Grid size={12}>
          <Campo label="Descripción" value={area.descripcion} />
        </Grid>
        <Grid size={12}>
          <Campo label="Responsable" value={area.responsable} />
        </Grid>
      </Grid>
    </AppModal>
  )
}
