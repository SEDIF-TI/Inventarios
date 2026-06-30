import { useState, useEffect } from 'react'
import {
  Box, Typography, TextField, InputAdornment, Stack, Chip, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AppTable from '@/components/ui/AppTable'
import api from '@/services/api'
import { useLoading } from '@/context/LoadingContext'

const MOVIMIENTO_CONFIG = {
  ALTA:        { label: 'Alta',        color: 'success' },
  BAJA:        { label: 'Baja',        color: 'error'   },
  DISPONIBLE:  { label: 'Disponible',  color: 'info'    },
  REASIGNACIÓN:{ label: 'Reasignación',color: 'warning' },
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
]

export default function HistorialPage() {
  const [allHistorial, setAllHistorial] = useState([])
  const [historial,    setHistorial]    = useState([])
  const [search,       setSearch]       = useState('')
  const [filtroTipo,   setFiltroTipo]   = useState('')
  const { setLoading } = useLoading()

  useEffect(() => {
    setLoading(true)
    api.get('/Historial')
      .then((r) => {
        setAllHistorial(r.data)
        setHistorial(r.data)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()
    setHistorial(
      allHistorial.filter((h) => {
        const matchTipo = !filtroTipo || h.tipoMovimiento === filtroTipo
        const matchText = !q ||
          (h.descripcionBien  || '').toLowerCase().includes(q) ||
          (h.empleado         || '').toLowerCase().includes(q) ||
          (h.areaAdscripcion  || '').toLowerCase().includes(q) ||
          (h.observacion      || '').toLowerCase().includes(q)
        return matchTipo && matchText
      })
    )
  }, [search, filtroTipo, allHistorial])

  return (
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
        rowsPerPage={12}
        resetKey={search + filtroTipo}
      />

    </Stack>
  )
}
