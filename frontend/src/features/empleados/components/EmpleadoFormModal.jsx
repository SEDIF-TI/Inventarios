import { useState, useEffect } from 'react'
import { nombreEmpleado } from '@/lib/empleados'
import {
  Stack, TextField, Autocomplete,
  FormControlLabel, Switch, Button,
} from '@mui/material'
import AppModal from '@/components/ui/AppModal'
import { notify } from '@/lib/notify'
import { labelArea, filterArea } from '@/lib/filtrosCatalogo'
import api from '@/services/api'

const EMPTY = {
  noControlEmpleado:        '',
  nombreEmpleado:           '',
  apellidoPaternoEmpleado:  '',
  apellidoMaternoEmpleado:  '',
  idAreaAdscripcion:        '',
  empleadoActivo:           true,
}

export default function EmpleadoFormModal({ open, onClose, mode, empleado, areas, onSuccess }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'editar' && empleado) {
      const area = areas.find(a => a.descripcion === empleado.areaAdscripcion)
      setForm({
        noControlEmpleado:       empleado.noControlEmpleado       ?? '',
        nombreEmpleado:          empleado.nombreEmpleado          ?? '',
        apellidoPaternoEmpleado: empleado.apellidoPaternoEmpleado ?? '',
        apellidoMaternoEmpleado: empleado.apellidoMaternoEmpleado ?? '',
        idAreaAdscripcion:       area?.id ?? '',
        empleadoActivo:          empleado.empleadoActivo          ?? true,
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, mode, empleado, areas])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    const payload = { ...form, idAreaAdscripcion: form.idAreaAdscripcion || null }
    const request = mode === 'editar'
      ? api.put(`/empleados/actualizar/${empleado.id}`, payload)
      : api.post('/empleados/crear', payload)

    const nombreCompleto = nombreEmpleado(form)

    const area = areas.find(a => a.id === form.idAreaAdscripcion)

    setLoading(true)
    notify.promise(request, {
      loading: {
        title: mode === 'editar' ? 'Actualizando...' : 'Guardando...',
      },
      success: mode === 'editar'
        ? {
            title: 'Empleado actualizado',
            description: `${nombreCompleto} — ${area?.descripcion ?? 'Sin área'}`,
          }
        : {
            title: 'Empleado registrado',
            description: `Se dio de alta a ${nombreCompleto}`,
          },
      error: {
        title: 'Ocurrió un error',
        description: 'No se pudo guardar. Intenta de nuevo.',
      },
    })

    request
      .then(() => { onSuccess(); onClose() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const areaSeleccionada = areas.find(a => a.id === form.idAreaAdscripcion) ?? null

  const actions = (
    <>
      <Button variant="text" onClick={onClose} disabled={loading}>
        Cancelar
      </Button>
      <Button variant="contained" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </>
  )

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === 'editar' ? 'Editar empleado' : 'Nuevo empleado'}
      actions={actions}
    >
      <Stack spacing={2.5} sx={{ pt: 0.5 }}>
        <TextField
          label="No. de Control"
          value={form.noControlEmpleado}
          onChange={set('noControlEmpleado')}
          fullWidth
        />
        <TextField
          label="Nombre"
          value={form.nombreEmpleado}
          onChange={set('nombreEmpleado')}
          fullWidth
        />
        <TextField
          label="Apellido Paterno"
          value={form.apellidoPaternoEmpleado}
          onChange={set('apellidoPaternoEmpleado')}
          fullWidth
        />
        <TextField
          label="Apellido Materno"
          value={form.apellidoMaternoEmpleado}
          onChange={set('apellidoMaternoEmpleado')}
          fullWidth
        />

        <Autocomplete
          autoHighlight
          options={areas}
          getOptionLabel={labelArea}
          filterOptions={filterArea}
          value={areaSeleccionada}
          onChange={(_, newVal) =>
            setForm(prev => ({ ...prev, idAreaAdscripcion: newVal?.id ?? '' }))
          }
          renderInput={(params) => (
            <TextField {...params} label="Área de adscripción" />
          )}
          noOptionsText="Sin resultados"
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.empleadoActivo}
              onChange={(e) => setForm(prev => ({ ...prev, empleadoActivo: e.target.checked }))}
              color="primary"
            />
          }
          label="Empleado activo"
        />
      </Stack>
    </AppModal>
  )
}
