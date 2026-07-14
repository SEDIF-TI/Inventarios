import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Box, Typography, Button, TextField, InputAdornment, Stack, Chip,
  Checkbox, Autocomplete,
} from '@mui/material'
import SearchIcon      from '@mui/icons-material/Search'
import AddIcon         from '@mui/icons-material/Add'
import EditIcon        from '@mui/icons-material/Edit'
import PrintIcon       from '@mui/icons-material/Print'
import DownloadIcon    from '@mui/icons-material/Download'
import CloseIcon       from '@mui/icons-material/Close'
import AppTable      from '@/components/ui/AppTable'
import AppDatePicker from '@/components/ui/AppDatePicker'
import pngGobUrl      from '@/assets/logos/png-gob.png'
import familiasDifUrl from '@/assets/logos/familias-dif.png'
import ResguardoDetalleModal from '../components/ResguardoDetalleModal'
import ResguardoFormModal    from '../components/ResguardoFormModal'
import ResguardoAccionModal  from '../components/ResguardoAccionModal'
import ImprimirModal         from '../components/ImprimirModal'
import api             from '@/services/api'
import { sileo }       from 'sileo'
import useDebounce        from '@/hooks/useDebounce'
import useListadoPaginado from '@/hooks/useListadoPaginado'

const TAM_PAGINA = 12

const FADE = {
  initial:    { opacity: 0, y: -8 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.18    },
}

// Recibe la fila entera, no solo el id: con la tabla paginada las filas de otras páginas ya
// no están en memoria, así que la selección tiene que guardarse consigo misma para poder
// generar las etiquetas de bienes que ya no se están mostrando.
const checkCol = (seleccionados, toggle) => ({
  key: 'check',
  label: '',
  width: 52,
  render: (row) => (
    <Checkbox
      checked={seleccionados.has(row.id)}
      size="small"
      onClick={e => e.stopPropagation()}
      onChange={() => toggle(row)}
      sx={{ p: 0.5 }}
    />
  ),
})

const ESTATUS_CHIP = {
  ACTIVO:     { label: 'Activo',     color: 'success' },
  DISPONIBLE: { label: 'Disponible', color: 'info' },
  BAJA:       { label: 'Baja',       color: 'error' },
}

const COLS_NORMAL = (onEdit) => [
  { key: 'noInventarioBien', label: 'No. Inventario', width: 140 },
  { key: 'cogBien',          label: 'COG',            width: 90  },
  { key: 'descripcionBien',  label: 'Descripción'                },
  { key: 'empleado',         label: 'Empleado',       width: 200 },
  { key: 'areaAdscripcion',  label: 'Área'                       },
  { key: 'estadoBien',       label: 'Estado',         width: 110 },
  {
    key: 'estatus', label: 'Estatus', width: 120,
    render: (row) => {
      const cfg = ESTATUS_CHIP[row.estatus] ?? { label: row.estatus ?? '—', color: 'default' }
      return <Chip label={cfg.label} color={cfg.color} size="small" />
    },
  },
  {
    key: 'acciones', label: '', width: 120,
    render: (row) => (
      <Button variant="outlined" size="small" startIcon={<EditIcon fontSize="small" />}
        onClick={(e) => { e.stopPropagation(); onEdit(row) }} sx={{ borderRadius: 2 }}>
        Editar
      </Button>
    ),
  },
]

const COLS_ETIQUETAS = (seleccionados, toggle) => [
  { key: 'noInventarioBien',    label: 'No. Inventario',  width: 140 },
  { key: 'descripcionBien',     label: 'Descripción'                 },
  { key: 'marcaBien',           label: 'Marca',           width: 120 },
  { key: 'modeloBien',          label: 'Modelo',          width: 120 },
  { key: 'noSerieBien',         label: 'No. Serie',       width: 150 },
  { key: 'areaAdscripcion',     label: 'Área'                        },
  { key: 'fechaAsignacionBien', label: 'Fecha Asignación',width: 150 },
  checkCol(seleccionados, toggle),
]

const COLS_FORMATOS = (seleccionados, toggle) => [
  { key: 'noInventarioBien',    label: 'No. Inventario',  width: 140 },
  { key: 'cogBien',             label: 'COG',             width: 90  },
  { key: 'descripcionBien',     label: 'Descripción'                 },
  { key: 'empleado',            label: 'Empleado'                    },
  { key: 'areaAdscripcion',     label: 'Área'                        },
  { key: 'estadoBien',          label: 'Estado',          width: 110 },
  { key: 'fechaAsignacionBien', label: 'Fecha Asignación',width: 150 },
  {
    key: 'activo', label: 'Activo', width: 100,
    render: (row) => (
      <Chip label={row.activo ? 'Activo' : 'Inactivo'} color={row.activo ? 'success' : 'default'} size="small" />
    ),
  },
  checkCol(seleccionados, toggle),
]

export default function ResguardosPage() {
  const [areas,     setAreas]     = useState([])
  const [empleados, setEmpleados] = useState([])
  const [search,    setSearch]    = useState('')

  const [detalle,        setDetalle]        = useState({ open: false, resguardo: null })
  const [form,           setForm]           = useState({ open: false, mode: 'crear', resguardo: null })
  const [accion,         setAccion]         = useState({ open: false, tipo: null, resguardo: null })
  const [modalImprimir,  setModalImprimir]  = useState(false)

  const [modoImpresion, setModoImpresion] = useState(null)
  const [seleccionados, setSeleccionados] = useState(new Map()) // id -> fila
  const [filtroArea,    setFiltroArea]    = useState(null)      // objeto área, no su descripción
  const [filtroFecha,   setFiltroFecha]   = useState('')

  const q = useDebounce(search)

  // El modo impresión filtra por área y fecha; el modo normal, por el buscador. Se envía solo
  // lo que aplica al modo activo para no arrastrar filtros invisibles al cambiar de uno a otro.
  const filtros = modoImpresion
    ? { idArea: filtroArea?.id ?? '', fechaAsignacion: filtroFecha }
    : { q }

  const { rows: resguardos, page, setPage, totalPages, total, loading, recargar } =
    useListadoPaginado('/resguardos', filtros, TAM_PAGINA)

  // Catálogos para los selects del formulario: se piden una vez y no se paginan.
  useEffect(() => {
    Promise.all([
      api.get('/areas/listarActivas'),
      api.get('/empleados/listarActivos'),
    ])
      .then(([a, e]) => { setAreas(a.data); setEmpleados(e.data) })
      .catch(() => { setAreas([]); setEmpleados([]) })
  }, [])

  const refresh = () => { setSearch(''); return recargar() }

  const openEdit     = (row) => setForm({ open: true, mode: 'editar', resguardo: row })
  const openDetalle  = (row) => setDetalle({ open: true, resguardo: row })
  const closeDetalle = ()    => setDetalle({ open: false, resguardo: null })
  const closeForm    = ()    => setForm({ open: false, mode: 'crear', resguardo: null })

  const openAccion  = (tipo) => setAccion({ open: true, tipo, resguardo: detalle.resguardo })
  const closeAccion = ()     => setAccion({ open: false, tipo: null, resguardo: null })
  const onAccionExitosa = () => { refresh(); closeDetalle() }

  // La selección sobrevive al cambio de página: se guarda la fila completa, no solo el id.
  const toggleSelect = (row) =>
    setSeleccionados(prev => {
      const next = new Map(prev)
      next.has(row.id) ? next.delete(row.id) : next.set(row.id, row)
      return next
    })

  const entrarModo = (tipo) => {
    setModoImpresion(tipo)
    setSeleccionados(new Map())
    setFiltroArea(null)
    setFiltroFecha('')
  }

  const salirModo = () => {
    setModoImpresion(null)
    setSeleccionados(new Map())
    setFiltroArea(null)
    setFiltroFecha('')
  }

  const toBase64 = (url) =>
    fetch(url).then(r => r.blob()).then(b => new Promise(res => {
      const fr = new FileReader()
      fr.onloadend = () => res(fr.result)
      fr.readAsDataURL(b)
    }))

  const abrirPDF = (blob) => {
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href   = url
    a.target = '_blank'
    a.rel    = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }

  const handleDescargar = async () => {
    if (modoImpresion === 'formatos') {
      const ids = Array.from(seleccionados.keys())

      const promise = Promise.all([
        api.get('/resguardos/formato', { params: { ids } }),
        toBase64(pngGobUrl),
        toBase64(familiasDifUrl),
        import('@react-pdf/renderer'),
        import('../components/FormatosPDF'),
      ]).then(async ([res, logoPuebla, logoFamilias, { pdf }, { default: FormatosPDF }]) => {
        const formatos = res.data.map(f => ({
          ...f,
          fechaEmision: f.fechaEmision
            ? f.fechaEmision.split('-').reverse().join('/')
            : '',
        }))
        const { createElement } = await import('react')
        const blob = await pdf(
          createElement(FormatosPDF, { formatos, logoPuebla, logoFamilias })
        ).toBlob()
        abrirPDF(blob)
        return formatos.length
      }).catch(err => {
        console.error('[Formatos] Error generando PDF:', err)
        throw err
      })

      sileo.promise(promise, {
        loading: { title: 'Generando formatos...' },
        success: (n) => ({ title: 'Formatos generados', description: `${n} formato(s) listos` }),
        error:   { title: 'Error', description: 'No se pudieron generar los formatos' },
      })
      return
    }

    if (modoImpresion === 'etiquetas') {
      const etiquetas = Array.from(seleccionados.values()).map(r => ({
        codigoAreaAdscripcion: r.codigoAreaAdscripcion ?? '',
        areaAdscripcion:       r.areaAdscripcion       ?? '',
        descripcionBien:       r.descripcionBien        ?? '',
        marcaBien:             r.marcaBien              ?? '',
        modeloBien:            r.modeloBien             ?? '',
        empleado:              r.empleado               ?? '',
        noInventarioBien:      r.noInventarioBien       ?? '',
        mesAnioAsignacion:     r.fechaAsignacionBien
          ? new Date(r.fechaAsignacionBien + 'T00:00:00')
              .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
              .toUpperCase()
          : '',
      }))

      const promise = Promise.all([
        toBase64(pngGobUrl),
        toBase64(familiasDifUrl),
        import('@react-pdf/renderer'),
        import('../components/EtiquetasPDF'),
      ]).then(async ([logoPuebla, logoFamilias, { pdf }, { default: EtiquetasPDF }]) => {
        const { createElement } = await import('react')
        const blob = await pdf(
          createElement(EtiquetasPDF, { etiquetas, logoPuebla, logoFamilias })
        ).toBlob()
        abrirPDF(blob)
        return etiquetas.length
      }).catch(err => {
        console.error('[Etiquetas] Error generando PDF:', err)
        throw err
      })

      sileo.promise(promise, {
        loading: { title: 'Generando etiquetas...' },
        success: (n) => ({ title: 'Etiquetas generadas', description: `${n} etiqueta(s) listas` }),
        error:   { title: 'Error', description: 'No se pudieron generar las etiquetas' },
      })
      return
    }
  }

  const columns = modoImpresion === 'etiquetas'
    ? COLS_ETIQUETAS(seleccionados, toggleSelect)
    : modoImpresion === 'formatos'
    ? COLS_FORMATOS(seleccionados, toggleSelect)
    : COLS_NORMAL(openEdit)

  return (
    <>
      <Stack spacing={3} sx={{ pb: 10 }}>

        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
          bgcolor: 'background.default', pt: 3, pb: 2, mt: -3,
        }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#db2777' }}>
              Resguardos
            </Typography>
            <AnimatePresence>
              {modoImpresion && (
                <motion.div {...FADE}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    Modo: {modoImpresion}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <AnimatePresence mode="wait">
            {!modoImpresion ? (
              <motion.div key="btns-normal" {...FADE} style={{ display: 'flex', gap: 12 }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={() => setModalImprimir(true)}
                >
                  Imprimir
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setForm({ open: true, mode: 'crear', resguardo: null })}
                >
                  Agregar resguardo
                </Button>
              </motion.div>
            ) : (
              <motion.div key="btns-impresion" {...FADE} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AnimatePresence>
                  {seleccionados.size > 0 && (
                    <motion.div {...FADE}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDescargar}
                      >
                        Descargar ({seleccionados.size})
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button variant="outlined" startIcon={<CloseIcon />} onClick={salirModo}>
                  Salir
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Filtros */}
        <AnimatePresence mode="wait">
          {!modoImpresion ? (
            <motion.div key="filter-normal" {...FADE}>
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
            </motion.div>
          ) : (
            <motion.div key="filter-impresion" {...FADE}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Autocomplete
                  options={areas}
                  getOptionLabel={(a) => a.descripcion ?? ''}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  value={filtroArea}
                  onChange={(_, v) => setFiltroArea(v)}
                  renderInput={(params) => <TextField {...params} label="Área" placeholder="Buscar área..." />}
                  noOptionsText="Sin resultados"
                  sx={{ width: 340 }}
                />

                <AppDatePicker
                  label="Fecha de asignación"
                  value={filtroFecha}
                  onChange={setFiltroFecha}
                  sx={{ width: 220 }}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={modoImpresion ?? 'normal'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <AppTable
              columns={columns}
              rows={resguardos}
              onRowClick={modoImpresion ? toggleSelect : openDetalle}
              page={page}
              pageCount={totalPages}
              onPageChange={setPage}
              totalElements={total}
              isLoading={loading}
            />
          </motion.div>
        </AnimatePresence>

      </Stack>

      <ResguardoDetalleModal
        open={detalle.open}
        onClose={closeDetalle}
        resguardo={detalle.resguardo}
        onAccion={openAccion}
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

      <ResguardoAccionModal
        open={accion.open}
        onClose={closeAccion}
        tipo={accion.tipo}
        resguardo={accion.resguardo}
        areas={areas}
        empleados={empleados}
        onSuccess={onAccionExitosa}
      />

      <ImprimirModal
        open={modalImprimir}
        onClose={() => setModalImprimir(false)}
        onSelect={entrarModo}
      />
    </>
  )
}
