import { Box, Typography, Chip, Grid2 as Grid, Divider, Stack, Button } from '@mui/material'
import PersonAddAlt1Icon    from '@mui/icons-material/PersonAddAlt1'
import SwapHorizIcon        from '@mui/icons-material/SwapHoriz'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import Inventory2Icon       from '@mui/icons-material/Inventory2'
import AppModal from '@/components/ui/AppModal'

const ESTATUS_CHIP = {
  ACTIVO:     { label: 'Activo',     color: 'success' },
  DISPONIBLE: { label: 'Disponible', color: 'info' },
  BAJA:       { label: 'Baja',       color: 'error' },
}

function accionesDisponibles(estatus) {
  if (estatus === 'ACTIVO')     return ['baja', 'reasignar', 'disponible']
  if (estatus === 'DISPONIBLE') return ['asignar', 'baja']
  return []
}

const ACCION_CONFIG = {
  asignar:    { label: 'Asignar',              icon: PersonAddAlt1Icon },
  reasignar:  { label: 'Reasignar',            icon: SwapHorizIcon },
  baja:       { label: 'Dar de baja',          icon: RemoveCircleOutlineIcon },
  disponible: { label: 'Marcar disponible',    icon: Inventory2Icon },
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

export default function ResguardoDetalleModal({ open, onClose, resguardo, onAccion }) {
  if (!resguardo) return null

  const acciones = accionesDisponibles(resguardo.estatus)
  const estatusCfg = ESTATUS_CHIP[resguardo.estatus] ?? { label: resguardo.estatus ?? '—', color: 'default' }

  return (
    <AppModal open={open} onClose={onClose} title="Detalle del resguardo" maxWidth="md">
      <Grid container spacing={3}>

        <Grid size={12}><Seccion label="Asignación" /></Grid>
        <Grid size={6}><Campo label="Área de adscripción" value={resguardo.areaAdscripcion} /></Grid>
        <Grid size={6}><Campo label="Empleado" value={resguardo.empleado} /></Grid>

        <Grid size={12}><Seccion label="Datos del bien" /></Grid>
        <Grid size={3}><Campo label="COG" value={resguardo.cogBien} /></Grid>
        <Grid size={4.5}><Campo label="No. Inventario" value={resguardo.noInventarioBien} /></Grid>
        <Grid size={4.5}><Campo label="No. Interno" value={resguardo.noInternoBien} /></Grid>
        <Grid size={12}><Campo label="Descripción" value={resguardo.descripcionBien} /></Grid>
        <Grid size={3}><Campo label="Estado" value={resguardo.estadoBien} /></Grid>
        <Grid size={3}><Campo label="Marca" value={resguardo.marcaBien} /></Grid>
        <Grid size={3}><Campo label="Modelo" value={resguardo.modeloBien} /></Grid>
        <Grid size={3}><Campo label="No. Serie" value={resguardo.noSerieBien} /></Grid>
        <Grid size={6}><Campo label="Material" value={resguardo.materialBien} /></Grid>
        <Grid size={6}><Campo label="Color" value={resguardo.colorBien} /></Grid>

        <Grid size={12}><Seccion label="Administrativo" /></Grid>
        <Grid size={6}><Campo label="Factura" value={resguardo.facturaBien} /></Grid>
        <Grid size={6}><Campo label="Entrada" value={resguardo.entradaBien} /></Grid>
        <Grid size={6}><Campo label="Pedido" value={resguardo.pedidoBien} /></Grid>
        <Grid size={6}><Campo label="Proveedor" value={resguardo.proveedorBien} /></Grid>
        <Grid size={6}><Campo label="Costo" value={resguardo.costoBien != null ? `$${Number(resguardo.costoBien).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : null} /></Grid>
        <Grid size={6}><Campo label="Fecha de asignación" value={resguardo.fechaAsignacionBien} /></Grid>

        <Grid size={12}><Seccion label="Observaciones" /></Grid>

        <Grid size={8}>
          <Stack spacing={2}>
            <Campo label="Observación 1" value={resguardo.observacion} />
            <Campo label="Observación 2" value={resguardo.observacion2} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Estatus
              </Typography>
              <Chip label={estatusCfg.label} color={estatusCfg.color} size="small" />
            </Box>
          </Stack>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1.5} alignItems="stretch">
            {acciones.map((tipo) => {
              const { label, icon: Icon } = ACCION_CONFIG[tipo]
              return (
                <Button
                  key={tipo}
                  variant="outlined"
                  size="small"
                  startIcon={<Icon fontSize="small" />}
                  onClick={() => onAccion(tipo)}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  {label}
                </Button>
              )
            })}
          </Stack>
        </Grid>

      </Grid>
    </AppModal>
  )
}
