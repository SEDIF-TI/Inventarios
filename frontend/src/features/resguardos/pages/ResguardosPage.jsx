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
import ImprimirModal         from '../components/ImprimirModal'
import api             from '@/services/api'
import { useLoading }  from '@/context/LoadingContext'
import { sileo }       from 'sileo'

const FADE = {
  initial:    { opacity: 0, y: -8 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -8 },
  transition: { duration: 0.18    },
}

const checkCol = (selectedIds, toggle) => ({
  key: 'check',
  label: '',
  width: 52,
  render: (row) => (
    <Checkbox
      checked={selectedIds.has(row.id)}
      size="small"
      onClick={e => e.stopPropagation()}
      onChange={() => toggle(row.id)}
      sx={{ p: 0.5 }}
    />
  ),
})

const COLS_NORMAL = (onEdit) => [
  { key: 'noInventarioBien', label: 'No. Inventario', width: 140 },
  { key: 'cogBien',          label: 'COG',            width: 90  },
  { key: 'descripcionBien',  label: 'Descripción'                },
  { key: 'empleado',         label: 'Empleado',       width: 200 },
  { key: 'areaAdscripcion',  label: 'Área'                       },
  { key: 'estadoBien',       label: 'Estado',         width: 110 },
  {
    key: 'activo', label: 'Activo', width: 100,
    render: (row) => (
      <Chip label={row.activo ? 'Activo' : 'Inactivo'} color={row.activo ? 'success' : 'default'} size="small" />
    ),
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

const COLS_ETIQUETAS = (selectedIds, toggle) => [
  { key: 'noInventarioBien',    label: 'No. Inventario',  width: 140 },
  { key: 'descripcionBien',     label: 'Descripción'                 },
  { key: 'marcaBien',           label: 'Marca',           width: 120 },
  { key: 'modeloBien',          label: 'Modelo',          width: 120 },
  { key: 'noSerieBien',         label: 'No. Serie',       width: 150 },
  { key: 'areaAdscripcion',     label: 'Área'                        },
  { key: 'fechaAsignacionBien', label: 'Fecha Asignación',width: 150 },
  checkCol(selectedIds, toggle),
]

const COLS_FORMATOS = (selectedIds, toggle) => [
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
  checkCol(selectedIds, toggle),
]

export default function ResguardosPage() {
  const [allResguardos, setAllResguardos] = useState([])
  const [resguardos,    setResguardos]    = useState([])
  const [areas,         setAreas]         = useState([])
  const [empleados,     setEmpleados]     = useState([])
  const [search,        setSearch]        = useState('')

  const [detalle,        setDetalle]        = useState({ open: false, resguardo: null })
  const [form,           setForm]           = useState({ open: false, mode: 'crear', resguardo: null })
  const [modalImprimir,  setModalImprimir]  = useState(false)

  const [modoImpresion, setModoImpresion] = useState(null)
  const [selectedIds,   setSelectedIds]   = useState(new Set())
  const [filtroArea,    setFiltroArea]    = useState('')
  const [filtroFecha,   setFiltroFecha]   = useState('')

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
    let filtered = allResguardos
    if (modoImpresion) {
      if (filtroArea)  filtered = filtered.filter(r => r.areaAdscripcion === filtroArea)
      if (filtroFecha) filtered = filtered.filter(r => r.fechaAsignacionBien === filtroFecha)
    } else {
      const q = search.trim().toLowerCase()
      if (q) filtered = filtered.filter(r =>
        (r.empleado         || '').toLowerCase().includes(q) ||
        (r.areaAdscripcion  || '').toLowerCase().includes(q) ||
        (r.noInventarioBien || '').toLowerCase().includes(q) ||
        (r.descripcionBien  || '').toLowerCase().includes(q)
      )
    }
    setResguardos(filtered)
  }, [search, filtroArea, filtroFecha, modoImpresion, allResguardos])

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

  const toggleSelect = (id) =>
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const entrarModo = (tipo) => {
    setModoImpresion(tipo)
    setSelectedIds(new Set())
    setFiltroArea('')
    setFiltroFecha('')
  }

  const salirModo = () => {
    setModoImpresion(null)
    setSelectedIds(new Set())
    setFiltroArea('')
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

  const formatearFecha = (d) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${d.getFullYear()}`
  }

  const handleDescargar = async () => {
    if (modoImpresion === 'formatos') {
      const seleccionados = allResguardos.filter(r => selectedIds.has(r.id))

      const porEmpleado = new Map()
      seleccionados.forEach(r => {
        const key = r.idEmpleado
        if (!porEmpleado.has(key)) porEmpleado.set(key, [])
        porEmpleado.get(key).push(r)
      })

      const fechaEmision = formatearFecha(new Date())

      const formatos = Array.from(porEmpleado.values()).map(bienesEmpleado => {
        const primero = bienesEmpleado[0]

        const bienesPatrimoniales    = bienesEmpleado.filter(r => !(r.noInventarioBien || '').startsWith('NP-'))
        const bienesNoPatrimoniales  = bienesEmpleado.filter(r => (r.noInventarioBien || '').startsWith('NP-'))

        const observaciones = [...new Set(
          bienesEmpleado
            .flatMap(r => [r.observacion, r.observacion2])
            .filter(o => o && o.trim())
        )].join('; ')

        return {
          fechaEmision,
          codigoArea:        primero.codigoAreaAdscripcion ?? '',
          area:              primero.areaAdscripcion       ?? '',
          noControlEmpleado: primero.noControlEmpleado     ?? '',
          nombreEmpleado:    primero.empleado              ?? '',
          bienesPatrimoniales,
          bienesNoPatrimoniales,
          observaciones,
        }
      })

      const promise = Promise.all([
        toBase64(pngGobUrl),
        toBase64(familiasDifUrl),
        import('@react-pdf/renderer'),
        import('../components/FormatosPDF'),
      ]).then(async ([logoPuebla, logoFamilias, { pdf }, { default: FormatosPDF }]) => {
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
      const seleccionados = allResguardos.filter(r => selectedIds.has(r.id))
      const etiquetas = seleccionados.map(r => ({
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
    ? COLS_ETIQUETAS(selectedIds, toggleSelect)
    : modoImpresion === 'formatos'
    ? COLS_FORMATOS(selectedIds, toggleSelect)
    : COLS_NORMAL(openEdit)

  return (
    <>
      <Stack spacing={3} sx={{ pb: 10 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  {selectedIds.size > 0 && (
                    <motion.div {...FADE}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDescargar}
                      >
                        Descargar ({selectedIds.size})
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
                  value={areas.find(a => a.descripcion === filtroArea) ?? null}
                  onChange={(_, v) => setFiltroArea(v?.descripcion ?? '')}
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
              onRowClick={modoImpresion ? (row) => toggleSelect(row.id) : openDetalle}
              rowsPerPage={12}
              resetKey={search + modoImpresion + filtroArea + filtroFecha}
            />
          </motion.div>
        </AnimatePresence>

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

      <ImprimirModal
        open={modalImprimir}
        onClose={() => setModalImprimir(false)}
        onSelect={entrarModo}
      />
    </>
  )
}
