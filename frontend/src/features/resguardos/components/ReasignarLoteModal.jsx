import { useState, useEffect } from 'react'
import { Stack, TextField, Button, Alert, Typography } from '@mui/material'
import AppModal from '@/components/ui/AppModal'
import CatalogoAutocomplete from '@/components/ui/CatalogoAutocomplete'
import { notify } from '@/lib/notify'
import { filterEmpleado } from '@/lib/filtrosCatalogo'
import api from '@/services/api'
import { nombreEmpleado } from '@/lib/empleados'

export default function ReasignarLoteModal({ open, onClose, seleccionados, empleados, onSuccess }) {
  const [idEmpleado, setIdEmpleado] = useState('')
  const [motivo,     setMotivo]     = useState('')
  const [loading,    setLoading]    = useState(false)

  useEffect(() => {
    if (!open) return
    setIdEmpleado('')
    setMotivo('')
  }, [open])

  const bienes = Array.from(seleccionados.values())

  // Todos los bienes del lote son de la misma persona (lo garantiza el candado de la
  // tabla), así que basta con leer el empleado actual del primero.
  const empleadoActual   = bienes[0]?.empleado   ?? '—'
  const idEmpleadoActual = bienes[0]?.idEmpleado ?? null

  // Reasignar a quien ya los tiene no hace nada: se saca de las opciones.
  const opciones = empleados.filter(e => e.id !== idEmpleadoActual)
  const empleadoSeleccionado = opciones.find(e => e.id === idEmpleado) ?? null

  const handleSubmit = () => {
    const ids = bienes.map(b => b.id)
    const request = api.put('/resguardos/reasignar-lote', {
      ids,
      idNuevoEmpleado: idEmpleado,
      motivo,
    })

    setLoading(true)
    notify.promise(request, {
      loading: { title: `Reasignando ${ids.length} bien(es)...` },
      success: (res) => {
        const { exitosos = [], errores = [] } = res?.data ?? {}
        return errores.length === 0
          ? { title: 'Reasignación completada',
              description: `${exitosos.length} bien(es) reasignados correctamente` }
          : { title: 'Reasignación parcial',
              description: `${exitosos.length} correcto(s), ${errores.length} con error` }
      },
      error: (err) => ({
        title: 'No se pudo reasignar',
        description: err?.response?.data?.message || 'Ocurrió un error, intenta de nuevo.',
      }),
    })

    request
      .then(() => { onSuccess(); onClose() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const disabled = loading || !idEmpleado || !motivo.trim()

  const actions = (
    <>
      <Button variant="text" onClick={onClose} disabled={loading}>Cancelar</Button>
      <Button variant="contained" onClick={handleSubmit} disabled={disabled}>
        {loading ? 'Procesando...' : `Reasignar ${bienes.length} bien(es)`}
      </Button>
    </>
  )

  return (
    <AppModal open={open} onClose={onClose} title="Reasignar bienes" actions={actions}>
      <Stack spacing={2.5} sx={{ pt: 0.5 }}>
        <Alert severity="info">
          Se reasignarán <strong>{bienes.length}</strong> bien(es) que actualmente tiene{' '}
          <strong>{empleadoActual}</strong>.
        </Alert>

        <CatalogoAutocomplete
          label="Nuevo empleado"
          options={opciones}
          getLabel={nombreEmpleado}
          filterFn={filterEmpleado}
          value={empleadoSeleccionado}
          onChange={(v) => setIdEmpleado(v?.id ?? '')}
        />

        <TextField
          label="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        <Typography variant="caption" color="text.secondary">
          Si algún bien no se puede reasignar, el resto sí se procesa y se te indicará
          cuántos fallaron.
        </Typography>
      </Stack>
    </AppModal>
  )
}
