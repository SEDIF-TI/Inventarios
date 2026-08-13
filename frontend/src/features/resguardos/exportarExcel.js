import writeExcelFile from 'write-excel-file/browser'
import api from '@/services/api'

// Mismo tope que `spring.data.web.pageable.max-page-size` en el backend: no se puede pedir
// una sola página con todo, así que se recorren páginas de 500 hasta juntar el área completa.
const TAM_PAGINA_EXPORT = 500

const ESTATUS_LABEL = {
  ACTIVO:     'Activo',
  DISPONIBLE: 'Disponible',
  BAJA:       'Baja',
}

const fechaDDMMYYYY = (v) => (v ? v.split('-').reverse().join('/') : null)
const moneda = (v) => (v == null ? null : `$${Number(v).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
const siNo = (v) => (v == null ? null : (v ? 'Sí' : 'No'))

// Mismos colores del tema (frontend/src/app/theme/theme.js): rosa primario, fondo gris y
// borde suave, para que el Excel se vea como la tabla de la app.
const ROSA   = '#db2777'
const GRIS   = '#f8fafc'
const BLANCO = '#ffffff'
const BORDE  = '#e2e8f0'

// Todos los campos que devuelve ResguardoRecord (backend), no solo los que se ven en la
// tabla: el Excel es para trabajar los datos fuera de la app, así que va completo.
const COLUMNAS = [
  { header: 'ID',                  key: 'id',                  width: 8  },
  { header: 'No. Inventario',      key: 'noInventarioBien',    width: 18 },
  { header: 'No. Interno',         key: 'noInternoBien',       width: 14 },
  { header: 'COG',                 key: 'cogBien',             width: 10 },
  { header: 'Descripción',         key: 'descripcionBien',     width: 42 },
  { header: 'Estado',              key: 'estadoBien',          width: 12 },
  { header: 'Marca',               key: 'marcaBien',           width: 18 },
  { header: 'Modelo',              key: 'modeloBien',          width: 18 },
  { header: 'No. Serie',           key: 'noSerieBien',         width: 20 },
  { header: 'Material',            key: 'materialBien',        width: 16 },
  { header: 'Color',               key: 'colorBien',           width: 14 },
  { header: 'Factura',             key: 'facturaBien',         width: 16 },
  { header: 'Entrada',             key: 'entradaBien',         width: 16 },
  { header: 'Pedido',              key: 'pedidoBien',          width: 16 },
  { header: 'Proveedor',           key: 'proveedorBien',       width: 22 },
  { header: 'Costo',               key: 'costoBien',           width: 14, map: moneda },
  { header: 'ID Empleado',         key: 'idEmpleado',          width: 10 },
  { header: 'Empleado',            key: 'empleado',            width: 28 },
  { header: 'No. Control Empleado',key: 'noControlEmpleado',   width: 16 },
  { header: 'ID Área',             key: 'idAreaAdscripcion',   width: 10 },
  { header: 'Código Área',         key: 'codigoAreaAdscripcion', width: 14 },
  { header: 'Área',                key: 'areaAdscripcion',     width: 30 },
  { header: 'Fecha Asignación',    key: 'fechaAsignacionBien', width: 16, map: fechaDDMMYYYY },
  { header: 'Estatus',             key: 'estatus',             width: 14, map: (v) => ESTATUS_LABEL[v] ?? v },
  { header: 'Activo',              key: 'activo',              width: 10, map: siNo },
  { header: 'Observación',         key: 'observacion',         width: 32 },
  { header: 'Observación 2',       key: 'observacion2',        width: 32 },
]

async function traerResguardosDeArea(idArea) {
  const filas = []
  let pagina = 0
  let totalPaginas = 1

  while (pagina < totalPaginas) {
    const { data } = await api.get('/resguardos', {
      params: { page: pagina, size: TAM_PAGINA_EXPORT, idArea },
    })
    filas.push(...(data.content ?? []))
    totalPaginas = data.totalPages ?? 1
    pagina += 1
  }

  return filas
}

const celdaEncabezado = (texto) => ({
  value: texto,
  fontWeight: 'bold',
  textColor: BLANCO,
  backgroundColor: ROSA,
  align: 'center',
  alignVertical: 'center',
  borderColor: ROSA,
  borderStyle: 'thin',
})

const celdaDato = (valor, filaPar) => ({
  value: valor ?? '—',
  backgroundColor: filaPar ? GRIS : BLANCO,
  borderColor: BORDE,
  borderStyle: 'thin',
  alignVertical: 'center',
})

/**
 * Genera un .xlsx con todos los resguardos de un área (recorriendo el backend paginado
 * hasta traerlos todos), con todos los campos del backend y el mismo esquema de colores
 * de la tabla en pantalla.
 *
 * @param area { id, descripcion } — el objeto que entrega /areas/listarActivas
 * @returns { blob, fileName, total }
 */
export async function exportarResguardosExcel(area) {
  const filas = await traerResguardosDeArea(area.id)

  const encabezado = COLUMNAS.map((c) => celdaEncabezado(c.header))
  const cuerpo = filas.map((row, i) =>
    COLUMNAS.map((c) => celdaDato(c.map ? c.map(row[c.key]) : row[c.key], i % 2 === 1))
  )

  const fecha = new Date().toISOString().slice(0, 10)
  const nombreArea = (area.descripcion || 'area').replace(/[^\p{L}\p{N}]+/gu, '_')

  const blob = await writeExcelFile([encabezado, ...cuerpo], {
    columns: COLUMNAS.map((c) => ({ width: c.width })),
    sheet: 'Resguardos',
    stickyRowsCount: 1,
  }).toBlob()

  return { blob, fileName: `Resguardos_${nombreArea}_${fecha}.xlsx`, total: filas.length }
}
