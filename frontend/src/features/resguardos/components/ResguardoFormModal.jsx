import { useState, useEffect } from 'react'
import {
  Stack, TextField, Autocomplete, FormControlLabel, Switch,
  Button, Grid2 as Grid, Typography, Divider, Box,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import AppModal from '@/components/ui/AppModal'
import { sileo } from 'sileo'
import api from '@/services/api'

const SIN_RESGUARDANTE = { id: '', esSinResguardante: true }

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

const EMPTY = {
  idAreaAdscripcion:  '',
  idEmpleado:         '',
  cogBien:            '',
  noInventarioBien:   '',
  noInternoBien:      '',
  descripcionBien:    '',
  estadoBien:         '',
  marcaBien:          '',
  modeloBien:         '',
  noSerieBien:        '',
  materialBien:       '',
  colorBien:          '',
  facturaBien:        '',
  entradaBien:        '',
  pedidoBien:         '',
  proveedorBien:      '',
  costoBien:          '',
  fechaAsignacionBien:'',
  observacion:        '',
  observacion2:       '',
  activo:             true,
}

export default function ResguardoFormModal({ open, onClose, mode, resguardo, areas, empleados, onSuccess }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'editar' && resguardo) {
      setForm({
        idAreaAdscripcion:   resguardo.idAreaAdscripcion   ?? '',
        idEmpleado:          resguardo.idEmpleado          ?? '',
        cogBien:             resguardo.cogBien             ?? '',
        noInventarioBien:    resguardo.noInventarioBien    ?? '',
        noInternoBien:       resguardo.noInternoBien       ?? '',
        descripcionBien:     resguardo.descripcionBien     ?? '',
        estadoBien:          resguardo.estadoBien          ?? '',
        marcaBien:           resguardo.marcaBien           ?? '',
        modeloBien:          resguardo.modeloBien          ?? '',
        noSerieBien:         resguardo.noSerieBien         ?? '',
        materialBien:        resguardo.materialBien        ?? '',
        colorBien:           resguardo.colorBien           ?? '',
        facturaBien:         resguardo.facturaBien         ?? '',
        entradaBien:         resguardo.entradaBien         ?? '',
        pedidoBien:          resguardo.pedidoBien          ?? '',
        proveedorBien:       resguardo.proveedorBien       ?? '',
        costoBien:           resguardo.costoBien           ?? '',
        fechaAsignacionBien: resguardo.fechaAsignacionBien ?? '',
        observacion:         resguardo.observacion         ?? '',
        observacion2:        resguardo.observacion2        ?? '',
        activo:              resguardo.activo              ?? true,
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, mode, resguardo])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    const payload = {
      ...form,
      cogBien:           form.cogBien   ? Number(form.cogBien)   : null,
      costoBien:         form.costoBien ? Number(form.costoBien) : null,
      idAreaAdscripcion: form.idAreaAdscripcion || null,
      idEmpleado:        form.idEmpleado        || null,
      fechaAsignacionBien: form.fechaAsignacionBien || null,
    }

    const request = mode === 'editar'
      ? api.put(`/resguardos/actualizar/${resguardo.id}`, payload)
      : api.post('/resguardos/crear', payload)

    setLoading(true)
    sileo.promise(request, {
      loading: { title: mode === 'editar' ? 'Actualizando...' : 'Guardando...' },
      success: mode === 'editar'
        ? { title: 'Resguardo actualizado', description: form.descripcionBien }
        : { title: 'Resguardo creado', description: form.descripcionBien },
      error: { title: 'Ocurrió un error', description: 'No se pudo guardar. Intenta de nuevo.' },
    })

    request
      .then(() => { onSuccess(); onClose() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const areaSeleccionada     = areas.find(a => a.id === form.idAreaAdscripcion)     ?? null
  const empleadoSeleccionado = form.idEmpleado
    ? (empleados.find(e => e.id === form.idEmpleado) ?? null)
    : SIN_RESGUARDANTE

  const actions = (
    <>
      <Button variant="text" onClick={onClose} disabled={loading}>Cancelar</Button>
      <Button variant="contained" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </>
  )

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === 'editar' ? 'Editar resguardo' : 'Nuevo resguardo'}
      actions={actions}
      maxWidth="md"
    >
      <Stack spacing={2.5} sx={{ pt: 0.5 }}>

        <Seccion label="Asignación" />
        <Grid container spacing={2}>
          <Grid size={6}>
            <Autocomplete
              options={areas}
              getOptionLabel={(a) => a.descripcion ?? ''}
              value={areaSeleccionada}
              onChange={(_, v) => setForm(prev => ({ ...prev, idAreaAdscripcion: v?.id ?? '' }))}
              renderInput={(params) => <TextField {...params} label="Área de adscripción" />}
              noOptionsText="Sin resultados"
            />
          </Grid>
          <Grid size={6}>
            <Autocomplete
              options={[SIN_RESGUARDANTE, ...empleados]}
              getOptionLabel={(e) =>
                e.esSinResguardante
                  ? 'Sin resguardante'
                  : [e.apellidoPaternoEmpleado, e.apellidoMaternoEmpleado, e.nombreEmpleado]
                      .filter(Boolean).join(' ')
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={empleadoSeleccionado}
              onChange={(_, v) => setForm(prev => ({ ...prev, idEmpleado: v?.id ?? '' }))}
              renderInput={(params) => <TextField {...params} label="Empleado" />}
              noOptionsText="Sin resultados"
            />
          </Grid>
        </Grid>

        <Seccion label="Datos del bien" />
        <Grid container spacing={2}>
          <Grid size={3}>
            <TextField label="COG" value={form.cogBien} onChange={set('cogBien')} type="number" fullWidth />
          </Grid>
          <Grid size={4.5}>
            <TextField label="No. Inventario" value={form.noInventarioBien} onChange={set('noInventarioBien')} fullWidth />
          </Grid>
          <Grid size={4.5}>
            <TextField label="No. Interno" value={form.noInternoBien} onChange={set('noInternoBien')} fullWidth />
          </Grid>
          <Grid size={12}>
            <TextField label="Descripción" value={form.descripcionBien} onChange={set('descripcionBien')} fullWidth />
          </Grid>
          <Grid size={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={form.estadoBien}
                label="Estado"
                onChange={set('estadoBien')}
              >
                <MenuItem value="BUENO">Bueno</MenuItem>
                <MenuItem value="MALO">Malo</MenuItem>
                <MenuItem value="REGULAR">Regular</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={3}>
            <TextField label="Marca" value={form.marcaBien} onChange={set('marcaBien')} fullWidth />
          </Grid>
          <Grid size={3}>
            <TextField label="Modelo" value={form.modeloBien} onChange={set('modeloBien')} fullWidth />
          </Grid>
          <Grid size={3}>
            <TextField label="No. Serie" value={form.noSerieBien} onChange={set('noSerieBien')} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Material" value={form.materialBien} onChange={set('materialBien')} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Color" value={form.colorBien} onChange={set('colorBien')} fullWidth />
          </Grid>
        </Grid>

        <Seccion label="Administrativo" />
        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField label="Factura" value={form.facturaBien} onChange={set('facturaBien')} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Entrada" value={form.entradaBien} onChange={set('entradaBien')} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Pedido" value={form.pedidoBien} onChange={set('pedidoBien')} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Proveedor" value={form.proveedorBien} onChange={set('proveedorBien')} fullWidth />
          </Grid>
          <Grid size={6}>
            <TextField label="Costo" value={form.costoBien} onChange={set('costoBien')} type="number" fullWidth
              slotProps={{ input: { startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary' }}>$</Box> } }}
            />
          </Grid>
          <Grid size={6}>
            <TextField label="Fecha de asignación" value={form.fechaAsignacionBien} onChange={set('fechaAsignacionBien')}
              type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Seccion label="Observaciones" />
        <TextField label="Observación 1" value={form.observacion} onChange={set('observacion')} fullWidth multiline rows={2} />
        <TextField label="Observación 2" value={form.observacion2} onChange={set('observacion2')} fullWidth multiline rows={2} />
        <FormControlLabel
          control={
            <Switch
              checked={form.activo}
              onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))}
              color="primary"
            />
          }
          label="Activo"
        />

      </Stack>
    </AppModal>
  )
}
