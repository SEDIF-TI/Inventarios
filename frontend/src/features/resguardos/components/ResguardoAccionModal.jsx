import { useState, useEffect } from 'react'
import { Stack, TextField, Autocomplete, Button } from '@mui/material'
import AppModal from '@/components/ui/AppModal'
import { notify } from '@/lib/notify'
import api from '@/services/api'

const TITULOS = {
  asignar:    'Asignar bien',
  reasignar:  'Reasignar bien',
  baja:       'Dar de baja',
  disponible: 'Marcar como disponible',
}

export default function ResguardoAccionModal({ open, onClose, tipo, resguardo, areas, empleados, onSuccess }) {
  const [idEmpleado,        setIdEmpleado]        = useState('')
  const [idAreaAdscripcion, setIdAreaAdscripcion]  = useState('')
  const [motivo,            setMotivo]             = useState('')
  const [loading,           setLoading]            = useState(false)

  useEffect(() => {
    if (!open) return
    setIdEmpleado('')
    setIdAreaAdscripcion('')
    setMotivo('')
  }, [open, tipo, resguardo])

  const necesitaEmpleado = tipo === 'asignar' || tipo === 'reasignar'
  const necesitaArea     = tipo === 'asignar'

  const handleSubmit = () => {
    if (!resguardo) return

    let request
    if (tipo === 'asignar') {
      request = api.put(`/resguardos/${resguardo.id}/asignar`, { idEmpleado, idAreaAdscripcion, motivo })
    } else if (tipo === 'reasignar') {
      request = api.put(`/resguardos/${resguardo.id}/reasignar`, { idNuevoEmpleado: idEmpleado, motivo })
    } else if (tipo === 'baja') {
      request = api.put(`/resguardos/${resguardo.id}/baja`, { motivo })
    } else {
      request = api.put(`/resguardos/${resguardo.id}/disponible`, { motivo })
    }

    setLoading(true)
    notify.promise(request, {
      loading: { title: 'Procesando...' },
      success: { title: 'Listo', description: TITULOS[tipo] },
      error: (err) => ({
        title: 'No se pudo completar',
        description: err?.response?.data?.message || 'Ocurrió un error, intenta de nuevo.',
      }),
    })

    request
      .then(() => { onSuccess(); onClose() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const areaSeleccionada     = areas.find(a => a.id === idAreaAdscripcion) ?? null
  const empleadoSeleccionado = empleados.find(e => e.id === idEmpleado)    ?? null

  const disabled = loading
    || (necesitaEmpleado && !idEmpleado)
    || (necesitaArea && !idAreaAdscripcion)
    || !motivo.trim()

  const actions = (
    <>
      <Button variant="text" onClick={onClose} disabled={loading}>Cancelar</Button>
      <Button variant="contained" onClick={handleSubmit} disabled={disabled}>
        {loading ? 'Procesando...' : 'Confirmar'}
      </Button>
    </>
  )

  return (
    <AppModal open={open} onClose={onClose} title={TITULOS[tipo] ?? ''} actions={actions}>
      <Stack spacing={2.5} sx={{ pt: 0.5 }}>
        {necesitaEmpleado && (
          <Autocomplete
            options={empleados}
            getOptionLabel={(e) =>
              [e.apellidoPaternoEmpleado, e.apellidoMaternoEmpleado, e.nombreEmpleado]
                .filter(Boolean).join(' ')
            }
            value={empleadoSeleccionado}
            onChange={(_, v) => setIdEmpleado(v?.id ?? '')}
            renderInput={(params) => (
              <TextField {...params} label={tipo === 'reasignar' ? 'Nuevo empleado' : 'Empleado'} />
            )}
            noOptionsText="Sin resultados"
          />
        )}

        {necesitaArea && (
          <Autocomplete
            options={areas}
            getOptionLabel={(a) => a.descripcion ?? ''}
            value={areaSeleccionada}
            onChange={(_, v) => setIdAreaAdscripcion(v?.id ?? '')}
            renderInput={(params) => <TextField {...params} label="Área de adscripción" />}
            noOptionsText="Sin resultados"
          />
        )}

        <TextField
          label="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />
      </Stack>
    </AppModal>
  )
}
