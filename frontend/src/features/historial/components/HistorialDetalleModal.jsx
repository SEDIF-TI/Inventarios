import { Box, Typography, Chip, Grid2 as Grid, Divider } from '@mui/material'
import AppModal from '@/components/ui/AppModal'

const MOVIMIENTO_CONFIG = {
  ALTA:         { label: 'Alta',         color: 'success' },
  BAJA:         { label: 'Baja',         color: 'error'   },
  DISPONIBLE:   { label: 'Disponible',   color: 'info'    },
  REASIGNACIÓN: { label: 'Reasignación', color: 'warning' },
}

function formatFecha(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Seccion({ label }) {
  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography variant="caption" fontWeight={600} color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Divider sx={{ mt: 0.5 }} />
    </Box>
  )
}

function Campo({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

export default function HistorialDetalleModal({ open, onClose, movimiento }) {
  if (!movimiento) return null

  const cfg = MOVIMIENTO_CONFIG[movimiento.tipoMovimiento] ?? { label: movimiento.tipoMovimiento, color: 'default' }

  return (
    <AppModal open={open} onClose={onClose} title="Detalle del movimiento" maxWidth="md">
      <Grid container spacing={3}>

        <Grid size={12}><Seccion label="Movimiento" /></Grid>
        <Grid size={6}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Tipo de movimiento
            </Typography>
            <Chip label={cfg.label} color={cfg.color} size="small" />
          </Box>
        </Grid>
        <Grid size={6}><Campo label="Fecha" value={formatFecha(movimiento.fechaMovimiento)} /></Grid>

        <Grid size={12}><Seccion label="Bien" /></Grid>
        <Grid size={12}><Campo label="Descripción" value={movimiento.descripcionBien} /></Grid>

        <Grid size={12}><Seccion label="Asignación" /></Grid>
        <Grid size={6}><Campo label="Empleado" value={movimiento.empleado} /></Grid>
        <Grid size={6}><Campo label="Área de adscripción" value={movimiento.areaAdscripcion} /></Grid>

        <Grid size={12}><Seccion label="Observaciones" /></Grid>
        <Grid size={12}><Campo label="Observación" value={movimiento.observacion} /></Grid>

      </Grid>
    </AppModal>
  )
}
