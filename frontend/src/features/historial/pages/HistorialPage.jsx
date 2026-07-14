import { useState } from 'react'
import {
  Box, Typography, TextField, InputAdornment, Stack, Chip, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AppTable from '@/components/ui/AppTable'
import HistorialDetalleModal from '../components/HistorialDetalleModal'
import useDebounce        from '@/hooks/useDebounce'
import useListadoPaginado from '@/hooks/useListadoPaginado'

// Las claves deben coincidir carácter a carácter con el enum Movimiento del backend: ahora
// viajan como filtro en la query string. La clave de reasignación llevaba tilde y por eso
// ese filtro nunca casaba con nada; ASIGNACION faltaba directamente.
const MOVIMIENTO_CONFIG = {
  ALTA:         { label: 'Alta',         color: 'success' },
  BAJA:         { label: 'Baja',         color: 'error'   },
  DISPONIBLE:   { label: 'Disponible',   color: 'info'    },
  ASIGNACION:   { label: 'Asignación',   color: 'primary' },
  REASIGNACION: { label: 'Reasignación', color: 'warning' },
}

function formatFecha(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const COLUMNS = [
  {
    key: 'fechaMovimiento',
    label: 'Fecha',
    width: 150,
    render: (row) => (
      <Typography variant="body2" color="text.secondary" noWrap>
        {formatFecha(row.fechaMovimiento)}
      </Typography>
    ),
  },
  {
    key: 'tipoMovimiento',
    label: 'Movimiento',
    width: 130,
    render: (row) => {
      const cfg = MOVIMIENTO_CONFIG[row.tipoMovimiento] ?? { label: row.tipoMovimiento, color: 'default' }
      return <Chip label={cfg.label} color={cfg.color} size="small" />
    },
  },
  { key: 'descripcionBien', label: 'Bien'     },
  { key: 'empleado',        label: 'Empleado' },
  { key: 'areaAdscripcion', label: 'Área'     },
  { key: 'observacion',     label: 'Observación' },
  {
    key: 'nombreUsuario', label: 'Realizado por', width: 160,
    render: (row) => row.nombreUsuario || '—',
  },
]

const TAM_PAGINA = 12

export default function HistorialPage() {
  const [search,     setSearch]     = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [detalle,    setDetalle]    = useState({ open: false, movimiento: null })

  const q = useDebounce(search)

  const openDetalle  = (row) => setDetalle({ open: true, movimiento: row })
  const closeDetalle = ()    => setDetalle({ open: false, movimiento: null })

  // La ruta iba con H mayúscula («/Historial») y el enrutado de Spring distingue
  // mayúsculas: devolvía 404 y la tabla salía siempre vacía.
  const { rows: historial, page, setPage, totalPages, total, loading } =
    useListadoPaginado('/historial', { q, tipoMovimiento: filtroTipo }, TAM_PAGINA)

  return (
    <>
    <Stack spacing={3} sx={{ pb: 10 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: '#db2777' }}>
          Historial
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por bien, empleado, área u observación..."
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
          sx={{ flex: 1, minWidth: 260, maxWidth: 480 }}
        />

        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel shrink>Tipo de movimiento</InputLabel>
          <Select
            value={filtroTipo}
            label="Tipo de movimiento"
            onChange={(e) => setFiltroTipo(e.target.value)}
            displayEmpty
            notched
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(MOVIMIENTO_CONFIG).map(([key, cfg]) => (
              <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <AppTable
        columns={COLUMNS}
        rows={historial}
        onRowClick={openDetalle}
        page={page}
        pageCount={totalPages}
        onPageChange={setPage}
        totalElements={total}
        isLoading={loading}
      />

    </Stack>

    <HistorialDetalleModal
      open={detalle.open}
      onClose={closeDetalle}
      movimiento={detalle.movimiento}
    />
    </>
  )
}
