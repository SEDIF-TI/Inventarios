import { useState, useEffect } from 'react'
import { Stack, TextField, FormControlLabel, Switch, Button } from '@mui/material'
import AppModal from '@/components/ui/AppModal'
import { sileo } from 'sileo'
import api from '@/services/api'

const EMPTY = {
  codigoAreaAdscripcion:       '',
  descripcionAreaAdscripcion:  '',
  responsable:                 '',
  areaActiva:                  true,
}

export default function AreaFormModal({ open, onClose, mode, area, onSuccess }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'editar' && area) {
      setForm({
        codigoAreaAdscripcion:      area.codigo      ?? '',
        descripcionAreaAdscripcion: area.descripcion ?? '',
        responsable:                area.responsable ?? '',
        areaActiva:                 area.areaActiva  ?? true,
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, mode, area])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    const request = mode === 'editar'
      ? api.put(`/areas/actualizar/${area.id}`, form)
      : api.post('/areas/crear', form)

    setLoading(true)
    sileo.promise(request, {
      loading: { title: mode === 'editar' ? 'Actualizando...' : 'Guardando...' },
      success: mode === 'editar'
        ? { title: 'Área actualizada', description: form.descripcionAreaAdscripcion }
        : { title: 'Área registrada', description: `Se creó: ${form.descripcionAreaAdscripcion}` },
      error: { title: 'Ocurrió un error', description: 'No se pudo guardar. Intenta de nuevo.' },
    })

    request
      .then(() => { onSuccess(); onClose() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

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
      title={mode === 'editar' ? 'Editar área' : 'Nueva área'}
      actions={actions}
    >
      <Stack spacing={2.5} sx={{ pt: 0.5 }}>
        <TextField
          label="Código"
          value={form.codigoAreaAdscripcion}
          onChange={set('codigoAreaAdscripcion')}
          fullWidth
        />
        <TextField
          label="Descripción"
          value={form.descripcionAreaAdscripcion}
          onChange={set('descripcionAreaAdscripcion')}
          fullWidth
        />
        <TextField
          label="Responsable"
          value={form.responsable}
          onChange={set('responsable')}
          fullWidth
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.areaActiva}
              onChange={(e) => setForm(prev => ({ ...prev, areaActiva: e.target.checked }))}
              color="primary"
            />
          }
          label="Área activa"
        />
      </Stack>
    </AppModal>
  )
}
