import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, InputAdornment, Stack, Chip,
  IconButton, Tooltip,
} from '@mui/material'
import SearchIcon      from '@mui/icons-material/Search'
import AddIcon         from '@mui/icons-material/Add'
import EditIcon        from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AppTable       from '@/components/ui/AppTable'
import UsuarioFormModal from '../components/UsuarioFormModal'
import api             from '@/services/api'
import { useLoading }  from '@/context/LoadingContext'
import { sileo }       from 'sileo'

const ROL_CHIP = {
  SUPERADMIN: { label: 'Superadmin', color: 'error'   },
  ADMIN:      { label: 'Admin',      color: 'warning' },
  ANALISTA:   { label: 'Analista',   color: 'info'     },
}

const COLUMNS = (onEdit, onEliminar) => [
  { key: 'nombreUsuario', label: 'Usuario' },
  {
    key: 'rol', label: 'Rol', width: 140,
    render: (row) => {
      const cfg = ROL_CHIP[row.rol] ?? { label: row.rol, color: 'default' }
      return <Chip label={cfg.label} color={cfg.color} size="small" />
    },
  },
  {
    key: 'activo', label: 'Activo', width: 100,
    render: (row) => (
      <Chip label={row.activo ? 'Activo' : 'Inactivo'} color={row.activo ? 'success' : 'default'} size="small" />
    ),
  },
  {
    key: 'acciones', label: '', width: 100,
    render: (row) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(row) }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onEliminar(row) }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
]

export default function UsuariosPage() {
  const [allUsuarios, setAllUsuarios] = useState([])
  const [usuarios,    setUsuarios]    = useState([])
  const [search,      setSearch]      = useState('')
  const [form,        setForm]        = useState({ open: false, mode: 'crear', usuario: null })

  const { setLoading } = useLoading()

  const cargar = () =>
    api.get('/usuarios').then(r => {
      setAllUsuarios(r.data)
      setUsuarios(r.data)
    })

  useEffect(() => {
    setLoading(true)
    cargar().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()
    if (!q) { setUsuarios(allUsuarios); return }
    setUsuarios(allUsuarios.filter(u =>
      (u.nombreUsuario || '').toLowerCase().includes(q) ||
      (u.rol           || '').toLowerCase().includes(q)
    ))
  }, [search, allUsuarios])

  const refresh = () => cargar().then(() => setSearch(''))

  const openEdit  = (row) => setForm({ open: true, mode: 'editar', usuario: row })
  const closeForm = ()    => setForm({ open: false, mode: 'crear', usuario: null })

  const handleEliminar = (row) => {
    if (!window.confirm(`¿Desactivar al usuario "${row.nombreUsuario}"? Podrás reactivarlo después editándolo.`)) return

    const request = api.put(`/usuarios/actualizar/${row.id}`, { activo: false })

    sileo.promise(request, {
      loading: { title: 'Desactivando...' },
      success: { title: 'Usuario desactivado', description: row.nombreUsuario },
      error: (err) => ({
        title: 'Ocurrió un error',
        description: err?.response?.data?.message || 'No se pudo desactivar el usuario.',
      }),
    })

    request.then(refresh).catch(() => {})
  }

  return (
    <>
      <Stack spacing={3} sx={{ pb: 10 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#db2777' }}>
            Usuarios
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setForm({ open: true, mode: 'crear', usuario: null })}
          >
            Agregar usuario
          </Button>
        </Box>

        <TextField
          placeholder="Buscar por nombre de usuario o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 480 }}
        />

        <AppTable
          columns={COLUMNS(openEdit, handleEliminar)}
          rows={usuarios}
          rowsPerPage={12}
          resetKey={search}
        />

      </Stack>

      <UsuarioFormModal
        open={form.open}
        onClose={closeForm}
        mode={form.mode}
        usuario={form.usuario}
        onSuccess={refresh}
      />
    </>
  )
}
