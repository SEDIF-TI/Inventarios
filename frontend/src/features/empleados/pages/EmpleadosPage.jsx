import { useState, useEffect } from 'react'
import {
  Box, Typography, Button, TextField, Stack, Chip, Autocomplete,
} from '@mui/material'
import AddIcon       from '@mui/icons-material/Add'
import EditIcon      from '@mui/icons-material/Edit'
import CloseIcon     from '@mui/icons-material/Close'
import AppTable      from '@/components/ui/AppTable'
import FiltroAutocomplete from '@/components/ui/FiltroAutocomplete'
import EmpleadoDetalleModal from '../components/EmpleadoDetalleModal'
import EmpleadoFormModal    from '../components/EmpleadoFormModal'
import { labelArea, filterArea } from '@/lib/filtrosCatalogo'
import api from '@/services/api'
import useDebounce        from '@/hooks/useDebounce'
import useListadoPaginado from '@/hooks/useListadoPaginado'
import useFiltrosColumna  from '@/hooks/useFiltrosColumna'
import useSugerencias     from '@/hooks/useSugerencias'

const TAM_PAGINA = 12

const COLUMNS = (onEdit) => [
  { key: 'noControlEmpleado', label: 'No. Control', width: 130, sortKey: 'noControlEmpleado', filterKey: 'noControl' },
  {
    key: 'apellidoPaternoEmpleado',
    label: 'Apellido Paterno',
    sortKey: 'apellidoPaternoEmpleado',
    filterKey: 'apellidoPaterno',
    render: (row) => row.apellidoPaternoEmpleado || '—',
  },
  {
    key: 'apellidoMaternoEmpleado',
    label: 'Apellido Materno',
    sortKey: 'apellidoMaternoEmpleado',
    filterKey: 'apellidoMaterno',
    render: (row) => row.apellidoMaternoEmpleado || '—',
  },
  {
    key: 'nombreEmpleado',
    label: 'Nombre',
    sortKey: 'nombreEmpleado',
    filterKey: 'nombre',
    render: (row) => row.nombreEmpleado || '—',
  },
  {
    key: 'areaAdscripcion',
    label: 'Área',
    sortKey: 'areaAdscripcion.descripcionAreaAdscripcion',
    filterKey: 'area',
    render: (row) => row.areaAdscripcion || '—',
  },
  {
    key: 'empleadoActivo',
    label: 'Activo',
    sortKey: 'empleadoActivo',
    filterKey: 'activo',
    filterTipo: 'opciones',
    filterOpciones: [{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }],

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
  const [fNombre, setFNombre] = useState('')
  const [fArea,   setFArea]   = useState(null)   // objeto área del catálogo

  const q       = useDebounce(search)
  const qNombre = useDebounce(fNombre)

  const [detalle, setDetalle] = useState({ open: false, empleado: null })
  const [form,    setForm]    = useState({ open: false, mode: 'crear', empleado: null })

  // El backend filtra el área del empleado por descripción (LIKE), no por id.
  const filtrosCol = useFiltrosColumna()

  const { rows: empleados, page, setPage, totalPages, total, loading, recargar,
          orden, alternarOrden, fijarOrden } =
    useListadoPaginado(
      '/empleados',
      { q, nombre: qNombre, area: fArea?.descripcion ?? '', ...filtrosCol.filtros },
      TAM_PAGINA,
    )

  // Catálogo para el select del formulario: se pide una sola vez y no se pagina.
  useEffect(() => {
    api.get('/areas/listarActivas').then(r => setAreas(r.data)).catch(() => setAreas([]))
  }, [])

  const refresh = () => { setSearch(''); return recargar() }

  // Sugerencias pedidas al servidor conforme se escribe (ver hooks/useSugerencias).
  const sugerenciasGenerales = useSugerencias(
    '/empleados', 'q',
    ['noControlEmpleado', 'nombreEmpleado', 'apellidoPaternoEmpleado', 'areaAdscripcion'],
    search,
  )

  const sugerenciasNombre = useSugerencias(
    '/empleados', 'nombre', ['nombreEmpleado'], fNombre,
  )

  const hayFiltros = Boolean(search || fNombre || fArea) || filtrosCol.hayFiltros

  const limpiarFiltros = () => {
    setSearch('')
    setFNombre('')
    setFArea(null)
    filtrosCol.limpiar()
  }

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

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FiltroAutocomplete
            conIcono
            label="Búsqueda general"
            placeholder="No. de Control, apellidos, nombre o área..."
            value={search}
            onChange={setSearch}
            opciones={sugerenciasGenerales.opciones}
            cargando={sugerenciasGenerales.cargando}
            sx={{ width: 360 }}
          />

          <FiltroAutocomplete
            label="Nombre"
            placeholder="Nombre del empleado..."
            value={fNombre}
            onChange={setFNombre}
            opciones={sugerenciasNombre.opciones}
            cargando={sugerenciasNombre.cargando}
            sx={{ width: 280 }}
          />

          <Autocomplete
            autoHighlight
            options={areas}
            getOptionLabel={labelArea}
            filterOptions={filterArea}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={fArea}
            onChange={(_, v) => setFArea(v)}
            renderInput={(params) => <TextField {...params} label="Área" />}
            noOptionsText="Sin resultados"
            sx={{ width: 300 }}
          />

          {hayFiltros && (
            <Button variant="text" startIcon={<CloseIcon />} onClick={limpiarFiltros}>
              Limpiar
            </Button>
          )}
        </Box>

        <AppTable
          columns={COLUMNS(openEdit)}
          rows={empleados}
          onRowClick={openDetalle}
          page={page}
          pageCount={totalPages}
          onPageChange={setPage}
          totalElements={total}
          isLoading={loading}
          orden={orden}
          onOrdenChange={alternarOrden}
              onFijarOrden={fijarOrden}
          filtrosColumna={filtrosCol.filtros}
          onFiltroColumna={filtrosCol.setFiltro}
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
