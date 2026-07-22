import { useState } from 'react'
import {
  Box, Typography, Button, Stack, Chip,
} from '@mui/material'
import AddIcon    from '@mui/icons-material/Add'
import EditIcon   from '@mui/icons-material/Edit'
import CloseIcon  from '@mui/icons-material/Close'
import AppTable   from '@/components/ui/AppTable'
import FiltroAutocomplete from '@/components/ui/FiltroAutocomplete'
import AreaDetalleModal from '../components/AreaDetalleModal'
import AreaFormModal    from '../components/AreaFormModal'
import useDebounce        from '@/hooks/useDebounce'
import useListadoPaginado from '@/hooks/useListadoPaginado'
import useFiltrosColumna  from '@/hooks/useFiltrosColumna'

const COLUMNS = (onEdit) => [
  { key: 'codigo', label: 'Código', width: 140, sortKey: 'codigoAreaAdscripcion', filterKey: 'codigo' },
  {
    key: 'descripcion',
    label: 'Descripción',
    sortKey: 'descripcionAreaAdscripcion',
    filterKey: 'descripcion',
    render: (row) => row.descripcion || '—',
  },
  {
    key: 'responsable',
    label: 'Responsable',
    sortKey: 'responsable',
    render: (row) => row.responsable || '—',
  },
  {
    key: 'areaActiva',
    label: 'Activa',
    sortKey: 'areaActiva',
    filterKey: 'activa',
    filterTipo: 'opciones',
    filterOpciones: [{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }],

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

const TAM_PAGINA = 12

export default function AreasPage() {
  const [search,       setSearch]       = useState('')
  const [fCodigo,      setFCodigo]      = useState('')
  const [fDescripcion, setFDescripcion] = useState('')

  const q            = useDebounce(search)
  const qCodigo      = useDebounce(fCodigo)
  const qDescripcion = useDebounce(fDescripcion)

  const [detalle, setDetalle] = useState({ open: false, area: null })
  const [form,    setForm]    = useState({ open: false, mode: 'crear', area: null })

  const filtrosCol = useFiltrosColumna()

  const { rows: areas, page, setPage, totalPages, total, loading, recargar,
          orden, alternarOrden, fijarOrden } =
    useListadoPaginado(
      '/areas',
      { q, codigo: qCodigo, descripcion: qDescripcion, ...filtrosCol.filtros },
      TAM_PAGINA,
    )

  const refresh = () => { setSearch(''); return recargar() }

  // Sugerencias tomadas de lo que ya está cargado en pantalla.
  const unicos = (valores) => [...new Set(valores.filter(Boolean))]

  const sugerenciasCodigo      = unicos(areas.map(a => a.codigo))
  const sugerenciasDescripcion = unicos(areas.map(a => a.descripcion))
  const sugerenciasGenerales   = [...sugerenciasCodigo, ...sugerenciasDescripcion]

  const hayFiltros = Boolean(search || fCodigo || fDescripcion) || filtrosCol.hayFiltros

  const limpiarFiltros = () => {
    setSearch('')
    setFCodigo('')
    setFDescripcion('')
    filtrosCol.limpiar()
  }

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

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FiltroAutocomplete
            conIcono
            label="Búsqueda general"
            placeholder="Código o descripción..."
            value={search}
            onChange={setSearch}
            opciones={sugerenciasGenerales}
            sx={{ width: 360 }}
          />

          <FiltroAutocomplete
            label="Código"
            placeholder="Código del área..."
            value={fCodigo}
            onChange={setFCodigo}
            opciones={sugerenciasCodigo}
            sx={{ width: 220 }}
          />

          <FiltroAutocomplete
            label="Descripción"
            placeholder="Descripción del área..."
            value={fDescripcion}
            onChange={setFDescripcion}
            opciones={sugerenciasDescripcion}
            sx={{ width: 320 }}
          />

          {hayFiltros && (
            <Button variant="text" startIcon={<CloseIcon />} onClick={limpiarFiltros}>
              Limpiar
            </Button>
          )}
        </Box>

        <AppTable
          columns={COLUMNS(openEdit)}
          rows={areas}
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
