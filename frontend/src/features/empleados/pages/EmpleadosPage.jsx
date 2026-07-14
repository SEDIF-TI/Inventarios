import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, InputAdornment, Stack, Chip,
} from '@mui/material'
import SearchIcon    from '@mui/icons-material/Search'
import AddIcon       from '@mui/icons-material/Add'
import EditIcon      from '@mui/icons-material/Edit'
import AppTable      from '@/components/ui/AppTable'
import EmpleadoDetalleModal from '../components/EmpleadoDetalleModal'
import EmpleadoFormModal    from '../components/EmpleadoFormModal'
import api from '@/services/api'
import useDebounce        from '@/hooks/useDebounce'
import useListadoPaginado from '@/hooks/useListadoPaginado'

const TAM_PAGINA = 12

const COLUMNS = (onEdit) => [
  { key: 'noControlEmpleado', label: 'No. Control', width: 130 },
  {
    key: 'apellidoPaternoEmpleado',
    label: 'Apellido Paterno',
    render: (row) => row.apellidoPaternoEmpleado || '—',
  },
  {
    key: 'apellidoMaternoEmpleado',
    label: 'Apellido Materno',
    render: (row) => row.apellidoMaternoEmpleado || '—',
  },
  {
    key: 'nombreEmpleado',
    label: 'Nombre',
    render: (row) => row.nombreEmpleado || '—',
  },
  {
    key: 'areaAdscripcion',
    label: 'Área',
    render: (row) => row.areaAdscripcion || '—',
  },
  {
    key: 'empleadoActivo',
    label: 'Activo',
    width: 100,
    render: (row) => (
      <Chip
        label={row.empleadoActivo ? 'Activo' : 'Inactivo'}
        color={row.empleadoActivo ? 'success' : 'default'}
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

export default function EmpleadosPage() {
  const [areas,  setAreas]  = useState([])
  const [search, setSearch] = useState('')
  const q = useDebounce(search)

  const [detalle, setDetalle] = useState({ open: false, empleado: null })
  const [form,    setForm]    = useState({ open: false, mode: 'crear', empleado: null })

  const { rows: empleados, page, setPage, totalPages, total, loading, recargar } =
    useListadoPaginado('/empleados', { q }, TAM_PAGINA)

  // Catálogo para el select del formulario: se pide una sola vez y no se pagina.
  useEffect(() => {
    api.get('/areas/listarActivas').then(r => setAreas(r.data)).catch(() => setAreas([]))
  }, [])

  const refresh = () => { setSearch(''); return recargar() }

  const openEdit    = (row) => setForm({ open: true, mode: 'editar', empleado: row })
  const openDetalle = (row) => setDetalle({ open: true, empleado: row })
  const closeDetalle = () => setDetalle({ open: false, empleado: null })
  const closeForm    = () => setForm({ open: false, mode: 'crear', empleado: null })

  return (
    <>
    <Stack spacing={3} sx={{ pb: 10 }}>

        {/* Cabecera */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" fontWeight={700} sx={{ color: '#db2777' }}>
            Empleados
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setForm({ open: true, mode: 'crear', empleado: null })}
          >
            Agregar empleado
          </Button>
        </Box>

        {/* Buscador */}
        <TextField
          placeholder="Buscar por No. de Control, apellidos, nombre o área..."
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
          rows={empleados}
          onRowClick={openDetalle}
          page={page}
          pageCount={totalPages}
          onPageChange={setPage}
          totalElements={total}
          isLoading={loading}
        />

      </Stack>

      <EmpleadoDetalleModal
        open={detalle.open}
        onClose={closeDetalle}
        empleado={detalle.empleado}
      />

      <EmpleadoFormModal
        open={form.open}
        onClose={closeForm}
        mode={form.mode}
        empleado={form.empleado}
        areas={areas}
        onSuccess={refresh}
      />
    </>
  )
}
