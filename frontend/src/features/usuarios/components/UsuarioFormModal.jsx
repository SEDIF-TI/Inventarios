import { useState, useEffect } from 'react'
import {
  Stack, TextField, FormControlLabel, Switch, Button,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material'
import AppModal from '@/components/ui/AppModal'
import { notify } from '@/lib/notify'
import api from '@/services/api'

const EMPTY = {
  nombreUsuario: '',
  password:      '',
  rol:           '',
  activo:        true,
}

export default function UsuarioFormModal({ open, onClose, mode, usuario, onSuccess }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (mode === 'editar' && usuario) {
      setForm({
        nombreUsuario: usuario.nombreUsuario ?? '',
        password:      '',
        rol:           usuario.rol           ?? '',
        activo:        usuario.activo        ?? true,
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, mode, usuario])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = () => {
    const payload = {
      nombreUsuario: form.nombreUsuario,
      rol:           form.rol,
      activo:        form.activo,
      ...(form.password.trim() && { password: form.password }),
    }

    const request = mode === 'editar'
      ? api.put(`/usuarios/actualizar/${usuario.id}`, payload)
      : api.post('/usuarios/crear', payload)

    setLoading(true)
    notify.promise(request, {
      loading: { title: mode === 'editar' ? 'Actualizando...' : 'Guardando...' },
      success: mode === 'editar'
        ? { title: 'Usuario actualizado', description: form.nombreUsuario }
        : { title: 'Usuario creado', description: form.nombreUsuario },
      error: (err) => ({
        title: 'Ocurrió un error',
        description: err?.response?.data?.message || 'No se pudo guardar. Intenta de nuevo.',
      }),
    })

    request
      .then(() => { onSuccess(); onClose() })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const disabled = loading
    || !form.nombreUsuario.trim()
    || !form.rol
    || (mode === 'crear' && !form.password.trim())

  const actions = (
    <>
      <Button variant="text" onClick={onClose} disabled={loading}>Cancelar</Button>
      <Button variant="contained" onClick={handleSubmit} disabled={disabled}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </>
  )

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={mode === 'editar' ? 'Editar usuario' : 'Nuevo usuario'}
      actions={actions}
    >
      <Stack spacing={2.5} sx={{ pt: 0.5 }}>
        <TextField
          label="Nombre de usuario"
          value={form.nombreUsuario}
          onChange={set('nombreUsuario')}
          autoComplete="off"
          fullWidth
        />

        <TextField
          label={mode === 'editar' ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          value={form.password}
          onChange={set('password')}
          type="password"
          autoComplete="new-password"
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Rol</InputLabel>
          <Select value={form.rol} label="Rol" onChange={set('rol')}>
            <MenuItem value="SUPERADMIN">Superadmin</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="ANALISTA">Analista</MenuItem>
          </Select>
        </FormControl>

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
