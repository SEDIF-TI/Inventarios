import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Box, Typography, Button, TextField, Stack, Chip,
  Checkbox, Autocomplete, IconButton, Tooltip,
  FormControlLabel, Switch,
} from '@mui/material'
import AddIcon         from '@mui/icons-material/Add'
import EditIcon        from '@mui/icons-material/Edit'
import PrintIcon       from '@mui/icons-material/Print'
import DownloadIcon    from '@mui/icons-material/Download'
import CloseIcon       from '@mui/icons-material/Close'
import SwapHorizIcon   from '@mui/icons-material/SwapHoriz'
import DeselectIcon    from '@mui/icons-material/Deselect'
import SelectAllIcon   from '@mui/icons-material/SelectAll'
import AppTable      from '@/components/ui/AppTable'
import AppDatePicker from '@/components/ui/AppDatePicker'
import FiltroAutocomplete from '@/components/ui/FiltroAutocomplete'
import { nombreEmpleado } from '@/lib/empleados'
import { accionesDisponibles, ACCION_CONFIG } from '../acciones'
import pngGobUrl      from '@/assets/logos/png-gob.png'
import familiasDifUrl from '@/assets/logos/familias-dif.png'
import ResguardoDetalleModal from '../components/ResguardoDetalleModal'
import ResguardoFormModal    from '../components/ResguardoFormModal'
import ResguardoAccionModal  from '../components/ResguardoAccionModal'
import ImprimirModal         from '../components/ImprimirModal'
import ReasignarLoteModal    from '../components/ReasignarLoteModal'
import { labelArea, filterArea, filterEmpleado } from '@/lib/filtrosCatalogo'
import api             from '@/services/api'
import { notify } from '@/lib/notify'
import useDebounce        from '@/hooks/useDebounce'
import useListadoPaginado from '@/hooks/useListadoPaginado'
import useFiltrosColumna  from '@/hooks/useFiltrosColumna'
import useSugerencias     from '@/hooks/useSugerencias'

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

// Igual que checkCol, pero respeta el candado por empleado: una fila de otra persona
// se ve deshabilitada. Lo que ya está marcado siempre se puede desmarcar.
const checkColBloqueable = (seleccionados, toggle, seleccionable) => ({
  key: 'check',
  label: '',
  width: 52,
  render: (row) => {
    const checked = seleccionados.has(row.id)
    return (
      <Checkbox
        checked={checked}
        disabled={!checked && !seleccionable(row)}
        size="small"
        onClick={e => e.stopPropagation()}
        onChange={() => toggle(row)}
        sx={{ p: 0.5 }}
      />
    )
  },
})

function SwitchMostrarTodos({ valor, onChange }) {
  return (
    <Tooltip title="Trae el inventario completo. Sin esto, la tabla solo consulta cuando filtras.">
      <FormControlLabel
        sx={{ ml: 0 }}
        control={
          <Switch
            size="small"
            checked={valor}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={<Typography variant="body2">Mostrar todos</Typography>}
      />
    </Tooltip>
  )
}

const ESTATUS_CHIP = {
  ACTIVO:     { label: 'Activo',     color: 'success' },
  DISPONIBLE: { label: 'Disponible', color: 'info' },
  BAJA:       { label: 'Baja',       color: 'error' },
}

// `sortKey` es la propiedad de la entidad del backend (no la del record): las relaciones
// se ordenan por un campo suyo, p. ej. empleado.nombreEmpleado.
// `filterKey` es el query param del backend. COG y Estado solo se ordenan: el backend no
// expone un filtro para ellos.
const COLS_NORMAL = (onEdit, onAccion) => [
  { key: 'noInventarioBien', label: 'No. Inventario', width: 140, sortKey: 'noInventarioBien', filterKey: 'noInventario' },
  { key: 'cogBien',          label: 'COG',            width: 90,  sortKey: 'cogBien'          },
  { key: 'descripcionBien',  label: 'Descripción',                sortKey: 'descripcionBien',  filterKey: 'descripcion'  },
  { key: 'empleado',         label: 'Empleado',       width: 200, sortKey: 'empleado.nombreEmpleado', filterKey: 'empleado' },
  { key: 'areaAdscripcion',  label: 'Área',                       sortKey: 'areaAdscripcion.descripcionAreaAdscripcion', filterKey: 'area' },
  { key: 'estadoBien',       label: 'Estado',         width: 110, sortKey: 'estadoBien'       },
  {
    key: 'estatus', label: 'Estatus', width: 120, sortKey: 'estatusResguardo',
    filterKey: 'estatus',
    filterTipo: 'opciones',
    filterOpciones: [
      { value: 'ACTIVO',     label: 'Activo'     },
      { value: 'DISPONIBLE', label: 'Disponible' },
      { value: 'BAJA',       label: 'Baja'       },
    ],
    render: (row) => {
      const cfg = ESTATUS_CHIP[row.estatus] ?? { label: row.estatus ?? '—', color: 'default' }
      return <Chip label={cfg.label} color={cfg.color} size="small" />
    },
  },
  {
    // Las acciones que aplican dependen del estatus (ver features/resguardos/acciones.js).
    // stopPropagation en cada botón: si no, el clic también abriría el modal de detalle.
    key: 'acciones', label: 'Acciones', width: 190,
    render: (row) => (
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        <Tooltip title="Editar">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(row) }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {accionesDisponibles(row.estatus).map((tipo) => {
          const { label, icon: Icon, color } = ACCION_CONFIG[tipo]
          return (
            <Tooltip key={tipo} title={label}>
              <IconButton
                size="small"
                color={color}
                onClick={(e) => { e.stopPropagation(); onAccion(tipo, row) }}
              >
                <Icon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        })}
      </Box>
    ),
  },
]

// Marca, Modelo, No. Serie y Fecha solo se ordenan: el backend no expone un filtro de
// texto para ellos (la fecha sí, pero es coincidencia exacta y va en la barra de arriba).
const COLS_ETIQUETAS = (seleccionados, toggle) => [
  { key: 'noInventarioBien',    label: 'No. Inventario',  width: 140, sortKey: 'noInventarioBien', filterKey: 'noInventario' },
  { key: 'descripcionBien',     label: 'Descripción',                 sortKey: 'descripcionBien',  filterKey: 'descripcion'  },
  { key: 'marcaBien',           label: 'Marca',           width: 120, sortKey: 'marcaBien'   },
  { key: 'modeloBien',          label: 'Modelo',          width: 120, sortKey: 'modeloBien'  },
  { key: 'noSerieBien',         label: 'No. Serie',       width: 150, sortKey: 'noSerieBien' },
  { key: 'areaAdscripcion',     label: 'Área',                        sortKey: 'areaAdscripcion.descripcionAreaAdscripcion', filterKey: 'area' },
  { key: 'fechaAsignacionBien', label: 'Fecha Asignación',width: 150, sortKey: 'fechaAsignacionBien' },
  checkCol(seleccionados, toggle),
]

const COLS_FORMATOS = (seleccionados, toggle) => [
  { key: 'noInventarioBien',    label: 'No. Inventario',  width: 140, sortKey: 'noInventarioBien', filterKey: 'noInventario' },
  { key: 'cogBien',             label: 'COG',             width: 90,  sortKey: 'cogBien'    },
  { key: 'descripcionBien',     label: 'Descripción',                 sortKey: 'descripcionBien',  filterKey: 'descripcion'  },
  { key: 'empleado',            label: 'Empleado',                    sortKey: 'empleado.nombreEmpleado', filterKey: 'empleado' },
  { key: 'areaAdscripcion',     label: 'Área',                        sortKey: 'areaAdscripcion.descripcionAreaAdscripcion', filterKey: 'area' },
  { key: 'estadoBien',          label: 'Estado',          width: 110, sortKey: 'estadoBien' },
  { key: 'fechaAsignacionBien', label: 'Fecha Asignación',width: 150, sortKey: 'fechaAsignacionBien' },
  {
    key: 'activo', label: 'Activo', width: 100, sortKey: 'activo',
    render: (row) => (
      <Chip label={row.activo ? 'Activo' : 'Inactivo'} color={row.activo ? 'success' : 'default'} size="small" />
    ),
  },
  checkCol(seleccionados, toggle),
]

const COLS_REASIGNAR = (seleccionados, toggle, seleccionable) => [
  { key: 'noInventarioBien', label: 'No. Inventario', width: 140 },
  { key: 'descripcionBien',  label: 'Descripción'                },
  {
    key: 'empleado', label: 'Empleado', width: 220,
    render: (row) => {
      const activo = seleccionados.has(row.id) || seleccionable(row)
      return (
        <Typography variant="body2" sx={{ opacity: activo ? 1 : 0.4 }}>
          {row.empleado || 'Sin asignar'}
        </Typography>
      )
    },
  },
  { key: 'areaAdscripcion', label: 'Área'                },
  { key: 'estadoBien',      label: 'Estado', width: 110  },
  checkColBloqueable(seleccionados, toggle, seleccionable),
]

export default function ResguardosPage() {
  const [areas,     setAreas]     = useState([])
  const [empleados, setEmpleados] = useState([])
  const [search,    setSearch]    = useState('')

  const [detalle,        setDetalle]        = useState({ open: false, resguardo: null })
  const [form,           setForm]           = useState({ open: false, mode: 'crear', resguardo: null })
  const [accion,         setAccion]         = useState({ open: false, tipo: null, resguardo: null })
  const [modalImprimir,  setModalImprimir]  = useState(false)

  const [modalReasignar, setModalReasignar] = useState(false)

  // null | 'etiquetas' | 'formatos' | 'reasignar'
  const [modo, setModo] = useState(null)
  const modoImpresion = modo === 'etiquetas' || modo === 'formatos' ? modo : null
  const modoReasignar = modo === 'reasignar'

  const [seleccionados, setSeleccionados] = useState(new Map()) // id -> fila
  const [filtroArea,     setFiltroArea]     = useState(null)   // objeto área, no su descripción
  const [filtroFecha,    setFiltroFecha]    = useState('')
  const [filtroEmpleado, setFiltroEmpleado] = useState(null)   // objeto empleado del catálogo

  // Filtros específicos del modo normal (se combinan con AND entre sí y con el buscador)
  const [fEmpleado,    setFEmpleado]    = useState(null)   // objeto empleado del catálogo
  const [fArea,        setFArea]        = useState(null)   // objeto área del catálogo
  const [fDescripcion, setFDescripcion] = useState('')

  const q            = useDebounce(search)
  const qDescripcion = useDebounce(fDescripcion)

  // Filtros puestos desde el menú de cada columna
  const filtrosCol = useFiltrosColumna()

  // Resguardos son decenas de miles: traerlos todos al entrar es una carga cara que casi
  // nunca se aprovecha. La tabla arranca vacía y solo consulta cuando hay algún filtro
  // o cuando el usuario pide explícitamente verlos todos.
  const [mostrarTodos, setMostrarTodos] = useState(false)

  // El modo impresión filtra por área y fecha; el modo normal, por el buscador. Se envía solo
  // lo que aplica al modo activo para no arrastrar filtros invisibles al cambiar de uno a otro.
  // `empleado` se manda con el nombre en el orden del backend (ver lib/empleados): allá se
  // compara con LIKE contra concat(nombre, apPaterno, apMaterno).
  const filtros = modoImpresion
    ? {
        idArea:          filtroArea?.id ?? '',
        fechaAsignacion: filtroFecha,
        empleado:        filtroEmpleado ? nombreEmpleado(filtroEmpleado) : '',
        ...filtrosCol.filtros,
      }
    : {
        q,
        empleado:    fEmpleado ? nombreEmpleado(fEmpleado) : '',
        idArea:      fArea?.id ?? '',
        descripcion: qDescripcion,
        // El menú de columna va al final: si filtras la misma cosa por los dos lados,
        // gana lo que pusiste en la columna (es lo más cercano a lo que estás viendo).
        ...filtrosCol.filtros,
      }

  // Se miran los valores ya debounceados: son los que de verdad se envían, así no se
  // dispara una consulta a media palabra.
  const filtrosActivos = modoImpresion
    ? Boolean(filtroArea || filtroFecha || filtroEmpleado) || filtrosCol.hayFiltros
    : Boolean(q || fEmpleado || fArea || qDescripcion) || filtrosCol.hayFiltros

  const debeCargar = mostrarTodos || filtrosActivos

  const { rows: resguardos, page, setPage, totalPages, total, loading, recargar,
          orden, alternarOrden, fijarOrden } =
    useListadoPaginado('/resguardos', filtros, TAM_PAGINA, { habilitado: debeCargar })

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

  // Sugerencias pedidas al servidor conforme se escribe (ver hooks/useSugerencias).
  const sugerenciasGenerales = useSugerencias(
    '/resguardos', 'q',
    ['descripcionBien', 'noInventarioBien', 'empleado', 'areaAdscripcion'],
    search,
  )

  const sugerenciasDescripcion = useSugerencias(
    '/resguardos', 'descripcion', ['descripcionBien'], fDescripcion,
  )

  const hayFiltros = Boolean(search || fEmpleado || fArea || fDescripcion) || filtrosCol.hayFiltros

  const limpiarFiltros = () => {
    setSearch('')
    setFEmpleado(null)
    setFArea(null)
    setFDescripcion('')
    filtrosCol.limpiar()
  }

  // Vacía solo la selección; los filtros y el modo se quedan como están.
  const limpiarSeleccion = () => setSeleccionados(new Map())

  /**
   * Filas de la hoja actual que se agregarían con la selección masiva.
   *
   * Solo la hoja visible, y siempre sumando: lo ya marcado en otras hojas se respeta.
   * En modo reasignar hay que aplicar el candado sobre la marcha, no con el empleado
   * bloqueado del render: si la selección arranca vacía, la primera fila que entra es la
   * que fija la persona, y sin esto se colarían bienes de todos los empleados de la hoja.
   */
  const filasAAgregar = () => {
    let bloqueado = seleccionados.size > 0
      ? seleccionados.values().next().value.idEmpleado
      : null

    const pendientes = []
    for (const row of resguardos) {
      if (seleccionados.has(row.id)) continue
      if (modoReasignar) {
        if (row.idEmpleado == null) continue
        if (bloqueado != null && row.idEmpleado !== bloqueado) continue
        if (bloqueado == null) bloqueado = row.idEmpleado
      }
      pendientes.push(row)
    }
    return pendientes
  }

  // Solo tiene sentido donde hay checkboxes (impresión o reasignar) y con algo filtrado:
  // es el flujo de "acoté a un área / persona, ahora márcame todo lo que salió".
  const puedeSeleccionarHoja = Boolean(modo) && filtrosActivos && filasAAgregar().length > 0

  const seleccionarHoja = () => {
    const pendientes = filasAAgregar()
    setSeleccionados(prev => {
      const next = new Map(prev)
      for (const row of pendientes) next.set(row.id, row)
      return next
    })
  }

  const openEdit     = (row) => setForm({ open: true, mode: 'editar', resguardo: row })
  const openDetalle  = (row) => setDetalle({ open: true, resguardo: row })
  const closeDetalle = ()    => setDetalle({ open: false, resguardo: null })
  const closeForm    = ()    => setForm({ open: false, mode: 'crear', resguardo: null })

  // Las acciones se disparan desde la columna "Acciones" de la tabla, que pasa la fila.
  const abrirAccion = (tipo, row) => setAccion({ open: true, tipo, resguardo: row })
  const closeAccion = ()          => setAccion({ open: false, tipo: null, resguardo: null })
  const onAccionExitosa = () => { refresh(); closeDetalle() }

  // Un lote de reasignación tiene que ser de una sola persona: la primera fila marcada
  // "bloquea" su empleado y a partir de ahí solo se pueden marcar los suyos. El Map
  // conserva el orden de inserción, así que el primer valor es la primera selección.
  const empleadoBloqueado = seleccionados.size > 0
    ? seleccionados.values().next().value.idEmpleado
    : null

  const empleadoBloqueadoNombre = seleccionados.size > 0
    ? seleccionados.values().next().value.empleado
    : null

  const seleccionable = (row) => {
    if (!modoReasignar) return true
    if (row.idEmpleado == null) return false            // sin empleado no hay a quién agrupar
    if (empleadoBloqueado == null) return true
    return row.idEmpleado === empleadoBloqueado
  }

  // La selección sobrevive al cambio de página: se guarda la fila completa, no solo el id.
  const toggleSelect = (row) => {
    // Desmarcar siempre se permite; marcar solo si la fila pasa el candado.
    if (!seleccionados.has(row.id) && !seleccionable(row)) return
    setSeleccionados(prev => {
      const next = new Map(prev)
      next.has(row.id) ? next.delete(row.id) : next.set(row.id, row)
      return next
    })
  }

  const entrarModo = (tipo) => {
    setModo(tipo)
    setSeleccionados(new Map())
    setFiltroArea(null)
    setFiltroFecha('')
    setFiltroEmpleado(null)
    filtrosCol.limpiar()
  }

  const salirModo = () => {
    setModo(null)
    setSeleccionados(new Map())
    setFiltroArea(null)
    setFiltroFecha('')
    setFiltroEmpleado(null)
    filtrosCol.limpiar()
  }

  const onReasignarLoteExito = () => { salirModo(); recargar() }

  // Pulsar "Resguardos" en el sidebar estando ya aquí no cambia la ruta ni remonta la
  // página, así que el modo (etiquetas / formatos / reasignar) sobreviviría y parecería
  // que el botón no hace nada. location.key cambia en cada navegación —incluida la que
  // apunta a la ruta actual—, así que sirve para detectar que se pidió entrar de nuevo.
  const { key: navKey } = useLocation()
  useEffect(() => { salirModo() }, [navKey])   // eslint-disable-line react-hooks/exhaustive-deps

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

      // Los ids van en el cuerpo, no en la query string: en la URL una selección grande
      // superaba el límite de cabecera de Tomcat y la petición ni llegaba al controller.
      const promise = Promise.all([
        api.post('/resguardos/formato', { ids }),
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

      notify.promise(promise, {
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
        noSerieBien:           r.noSerieBien            ?? '',
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

      notify.promise(promise, {
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
    : modoReasignar
    ? COLS_REASIGNAR(seleccionados, toggleSelect, seleccionable)
    : COLS_NORMAL(openEdit, abrirAccion)

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
              {modo && (
                <motion.div {...FADE}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    Modo: {modo}
                    {modoReasignar && empleadoBloqueadoNombre && ` — solo bienes de ${empleadoBloqueadoNombre}`}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <AnimatePresence mode="wait">
            {!modo ? (
              <motion.div key="btns-normal" {...FADE} style={{ display: 'flex', gap: 12 }}>
                <Button
                  variant="outlined"
                  startIcon={<SwapHorizIcon />}
                  onClick={() => entrarModo('reasignar')}
                >
                  Reasignar
                </Button>
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
            ) : modoReasignar ? (
              <motion.div key="btns-reasignar" {...FADE} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AnimatePresence>
                  {seleccionados.size > 0 && (
                    <motion.div {...FADE}>
                      <Button
                        variant="contained"
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setModalReasignar(true)}
                      >
                        Reasignar ({seleccionados.size})
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button variant="outlined" startIcon={<CloseIcon />} onClick={salirModo}>
                  Salir
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
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FiltroAutocomplete
                  conIcono
                  label="Búsqueda general"
                  placeholder="Empleado, área, No. de inventario o descripción..."
                  value={search}
                  onChange={setSearch}
                  opciones={sugerenciasGenerales.opciones}
                  cargando={sugerenciasGenerales.cargando}
                  sx={{ width: 360 }}
                />

                <Autocomplete
                  autoHighlight
                  options={empleados}
                  getOptionLabel={nombreEmpleado}
                  filterOptions={filterEmpleado}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  value={fEmpleado}
                  onChange={(_, v) => setFEmpleado(v)}
                  renderInput={(params) => <TextField {...params} label="Empleado" />}
                  noOptionsText="Sin resultados"
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
                  sx={{ width: 280 }}
                />

                <FiltroAutocomplete
                  label="Descripción"
                  placeholder="Descripción del bien..."
                  value={fDescripcion}
                  onChange={setFDescripcion}
                  opciones={sugerenciasDescripcion.opciones}
                  cargando={sugerenciasDescripcion.cargando}
                  sx={{ width: 280 }}
                />

                {hayFiltros && (
                  <Button variant="text" startIcon={<CloseIcon />} onClick={limpiarFiltros}>
                    Limpiar
                  </Button>
                )}

                <SwitchMostrarTodos valor={mostrarTodos} onChange={setMostrarTodos} />

                {/* Solo el modo reasignar tiene checks en esta barra. */}
                {modoReasignar && seleccionados.size > 0 && (
                  <Button
                    variant="text"
                    color="secondary"
                    startIcon={<DeselectIcon />}
                    onClick={limpiarSeleccion}
                  >
                    Quitar selección ({seleccionados.size})
                  </Button>
                )}
              </Box>
            </motion.div>
          ) : (
            <motion.div key="filter-impresion" {...FADE}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete
                  autoHighlight
                  options={empleados}
                  getOptionLabel={nombreEmpleado}
                  filterOptions={filterEmpleado}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  value={filtroEmpleado}
                  onChange={(_, v) => setFiltroEmpleado(v)}
                  renderInput={(params) => <TextField {...params} label="Empleado" placeholder="Buscar persona..." />}
                  noOptionsText="Sin resultados"
                  sx={{ width: 300 }}
                />

                <Autocomplete
                  autoHighlight
                  options={areas}
                  getOptionLabel={labelArea}
                  filterOptions={filterArea}
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

                {(filtroEmpleado || filtroArea || filtroFecha) && (
                  <Button
                    variant="text"
                    startIcon={<CloseIcon />}
                    onClick={() => { setFiltroEmpleado(null); setFiltroArea(null); setFiltroFecha('') }}
                  >
                    Limpiar
                  </Button>
                )}

                <SwitchMostrarTodos valor={mostrarTodos} onChange={setMostrarTodos} />

                {puedeSeleccionarHoja && (
                  <Button
                    variant="outlined"
                    startIcon={<SelectAllIcon />}
                    onClick={seleccionarHoja}
                  >
                    Seleccionar esta hoja ({filasAAgregar().length})
                  </Button>
                )}

                {seleccionados.size > 0 && (
                  <Button
                    variant="text"
                    color="secondary"
                    startIcon={<DeselectIcon />}
                    onClick={limpiarSeleccion}
                  >
                    Quitar selección ({seleccionados.size})
                  </Button>
                )}
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
              onRowClick={modo ? toggleSelect : openDetalle}
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
              mensajeVacio={debeCargar
                ? 'Sin resultados'
                : 'Usa un filtro para buscar, o activa "Mostrar todos" para ver el inventario completo.'}
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

      <ReasignarLoteModal
        open={modalReasignar}
        onClose={() => setModalReasignar(false)}
        seleccionados={seleccionados}
        empleados={empleados}
        onSuccess={onReasignarLoteExito}
      />
    </>
  )
}
