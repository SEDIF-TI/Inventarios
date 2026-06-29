import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, InputAdornment, Stack, Chip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon    from '@mui/icons-material/Add'
import EditIcon   from '@mui/icons-material/Edit'
import AppTable from '@/components/ui/AppTable'
import ResguardoDetalleModal from '../components/ResguardoDetalleModal'
import ResguardoFormModal    from '../components/ResguardoFormModal'
import api from '@/services/api'
import { useLoading } from '@/context/LoadingContext'

const COLUMNS = (onEdit) => [
  { key: 'noInventarioBien', label: 'No. Inventario', width: 140 },
  { key: 'cogBien',          label: 'COG',            width: 90  },
  { key: 'descripcionBien',  label: 'Descripción'                },
  { key: 'empleado',         label: 'Empleado'                   },
  { key: 'areaAdscripcion',  label: 'Área'                       },
  { key: 'estadoBien',       label: 'Estado',         width: 110 },
  {
    key: 'activo',
    label: 'Activo',
    width: 100,
    render: (row) => (
      <Chip
        label={row.activo ? 'Activo' : 'Inactivo'}
        color={row.activo ? 'success' : 'default'}
        size="small"
      />
    ),
  },
  {
    key: 'acciones',
    label: '',
    width: 90,
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

export default function ResguardosPage() {
  const [allResguardos, setAllResguardos] = useState([])
  const [resguardos,    setResguardos]    = useState([])
  const [areas,         setAreas]         = useState([])
  const [empleados,     setEmpleados]     = useState([])
  const [search,        setSearch]        = useState('')

  const [detalle, setDetalle] = useState({ open: false, resguardo: null })
  const [form,    setForm]    = useState({ open: false, mode: 'crear', resguardo: null })

  const { setLoading } = useLoading()

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/resguardos'),
      api.get('/areas/listarActivas'),
      api.get('/empleados'),
    ])
      .then(([r, a, e]) => {
        setAllResguardos(r.data)
        setResguardos(r.data)
        setAreas(a.data)
        setEmpleados(e.data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()
    if (!q) { setResguardos(allResguardos); return }
    setResguardos(allResguardos.filter(r =>
      (r.empleado         || '').toLowerCase().includes(q) ||
      (r.areaAdscripcion  || '').toLowerCase().includes(q) ||
      (r.noInventarioBien || '').toLowerCase().includes(q) ||
      (r.descripcionBien  || '').toLowerCase().includes(q)
    ))
  }, [search, allResguardos])

  const refresh = () =>
    api.get('/resguardos').then(r => {
      setAllResguardos(r.data)
      setResguardos(r.data)
      setSearch('')
    })

  const openEdit     = (row) => setForm({ open: true, mode: 'editar', resguardo: row })
  const openDetalle  = (row) => setDetalle({ open: true, resguardo: row })
  const closeDetalle = ()    => setDetalle({ open: false, resguardo: null })
  const closeForm    = ()    => setForm({ open: false, mode: 'crear', resguardo: null })

  return (
    <>
      <Stack spacing={3} sx={{ pb: 10 }}>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#db2777' }}>
            Resguardos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setForm({ open: true, mode: 'crear', resguardo: null })}
          >
            Agregar resguardo
          </Button>
        </Box>

        <TextField
          placeholder="Buscar por empleado, área, No. de inventario o descripción..."
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
          rows={resguardos}
          onRowClick={openDetalle}
          rowsPerPage={12}
          resetKey={search}
        />

      </Stack>

      <ResguardoDetalleModal
        open={detalle.open}
        onClose={closeDetalle}
        resguardo={detalle.resguardo}
      />

      <ResguardoFormModal
        open={form.open}
        onClose={closeForm}
        mode={form.mode}
        resguardo={form.resguardo}
        areas={areas}
        empleados={empleados}
        onSuccess={refresh}
      />
    </>
  )
}
