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

export default function EmpleadoDetalleModal({ open, onClose, empleado }) {
  if (!empleado) return null

  const nombreCompleto = [
    empleado.apellidoPaternoEmpleado,
    empleado.apellidoMaternoEmpleado,
    empleado.nombreEmpleado,
  ].filter(Boolean).join(' ')

  return (
    <AppModal open={open} onClose={onClose} title="Detalle del empleado">
      <Grid container spacing={3}>
        <Grid size={6}>
          <Campo label="No. de Control" value={empleado.noControlEmpleado} />
        </Grid>
        <Grid size={6}>
          <Campo label="Área de adscripción" value={empleado.areaAdscripcion} />
        </Grid>
        <Grid size={12}>
          <Campo label="Nombre completo" value={nombreCompleto} />
        </Grid>
        <Grid size={6}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Estado
          </Typography>
          <Chip
            label={empleado.empleadoActivo ? 'Activo' : 'Inactivo'}
            color={empleado.empleadoActivo ? 'success' : 'default'}
            size="small"
          />
        </Grid>
      </Grid>
    </AppModal>
  )
}
