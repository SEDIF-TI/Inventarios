import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, InputAdornment, Stack, Chip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon    from '@mui/icons-material/Add'
import EditIcon   from '@mui/icons-material/Edit'
import AppTable   from '@/components/ui/AppTable'
import AreaDetalleModal from '../components/AreaDetalleModal'
import AreaFormModal    from '../components/AreaFormModal'
import api from '@/services/api'
import { useLoading } from '@/context/LoadingContext'

const COLUMNS = (onEdit) => [
  { key: 'codigo', label: 'Código', width: 140 },
  {
    key: 'descripcion',
    label: 'Descripción',
    render: (row) => row.descripcion || '—',
  },
  {
    key: 'responsable',
    label: 'Responsable',
    render: (row) => row.responsable || '—',
  },
  {
    key: 'areaActiva',
    label: 'Activa',
    width: 110,
    render: (row) => (
      <Chip
        label={row.areaActiva ? 'Activa' : 'Inactiva'}
        color={row.areaActiva ? 'success' : 'default'}
        size="small"
      />
    ),
  },
  {
    key: 'acciones',
    label: '',
    width: 120,
    render: (row) => (
      <Button
        variant="outlined"
        size="small"
        startIcon={<EditIcon fontSize="small" />}
        onClick={(e) => { e.stopPropagation(); onEdit(row) }}
        sx={{ borderRadius: 2 }}
      >
        Editar
      </Button>
    ),
  },
]

export default function AreasPage() {
  const [allAreas, setAllAreas] = useState([])
  const [areas,    setAreas]    = useState([])
  const [search,   setSearch]   = useState('')

  const [detalle, setDetalle] = useState({ open: false, area: null })
  const [form,    setForm]    = useState({ open: false, mode: 'crear', area: null })

  const { setLoading } = useLoading()

  useEffect(() => {
    setLoading(true)
    api.get('/areas/listarTodas')
      .then(r => { setAllAreas(r.data); setAreas(r.data) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()
    if (!q) { setAreas(allAreas); return }
    setAreas(allAreas.filter(a =>
      (a.codigo      || '').toLowerCase().includes(q) ||
      (a.descripcion || '').toLowerCase().includes(q) ||
      (a.responsable || '').toLowerCase().includes(q)
    ))
  }, [search, allAreas])

  const refresh = () =>
    api.get('/areas/listarTodas').then(r => {
      setAllAreas(r.data)
      setAreas(r.data)
      setSearch('')
    })

  const openEdit    = (row) => setForm({ open: true, mode: 'editar', area: row })
  const openDetalle = (row) => setDetalle({ open: true, area: row })
  const closeDetalle = () => setDetalle({ open: false, area: null })
  const closeForm    = () => setForm({ open: false, mode: 'crear', area: null })

  return (
    <>
      <Stack spacing={3} sx={{ pb: 10 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#db2777' }}>
            Áreas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setForm({ open: true, mode: 'crear', area: null })}
          >
            Agregar área
          </Button>
        </Box>

        <TextField
          placeholder="Buscar por código o descripción..."
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
          columns={COLUMNS(openEdit)}
          rows={areas}
          onRowClick={openDetalle}
          rowsPerPage={12}
          resetKey={search}
        />

      </Stack>

      <AreaDetalleModal
        open={detalle.open}
        onClose={closeDetalle}
        area={detalle.area}
      />

      <AreaFormModal
        open={form.open}
        onClose={closeForm}
        mode={form.mode}
        area={form.area}
        onSuccess={refresh}
      />
    </>
  )
}
