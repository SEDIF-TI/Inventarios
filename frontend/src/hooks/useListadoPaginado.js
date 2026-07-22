import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../services/api'

export const TAM_PAGINA = 15

/**
 * Listado paginado contra el servidor.
 *
 * El backend devuelve { content, page, size, totalElements, totalPages } y pagina con
 * índice 0; la UI trabaja con índice 1 porque es lo que espera el Pagination de MUI, así
 * que la conversión se hace aquí y en un solo sitio.
 *
 * @param url       ruta relativa al baseURL de api (p. ej. '/resguardos')
 * @param filtros   objeto de query params; las claves con valor null/'' se omiten
 * @param size      tamaño de página
 * @param opciones  { habilitado } — con habilitado en false no se consulta nada y la
 *                  lista queda vacía. Sirve para tablas grandes que no deben cargarse
 *                  enteras al entrar, sino solo cuando el usuario filtra o lo pide.
 */
export default function useListadoPaginado(url, filtros = {}, size = TAM_PAGINA, opciones = {}) {
  const { habilitado = true } = opciones
  const [page, setPage]       = useState(1)
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  // { campo, dir } | null — el campo es la propiedad de la ENTIDAD del backend, no la del
  // record. Va como `sort=campo,dir`, que es lo que Spring enlaza al Pageable.
  const [orden, setOrden] = useState(null)

  // Se serializan los filtros para poder usarlos como dependencia: el objeto se recrea en
  // cada render y como dependencia directa provocaría un bucle de peticiones.
  const filtrosKey = JSON.stringify(filtros)
  const ordenKey   = orden ? `${orden.campo},${orden.dir}` : ''

  // Al cambiar los filtros o el orden hay que volver a la página 1. Se ajusta durante el
  // render (patrón documentado de React) y no en un efecto, para que la petición salga ya
  // con la página correcta: si estás en la 7 y filtras hasta dejar 2, pedir la 7 da vacío.
  const clavePrevia = useRef(`${filtrosKey}|${ordenKey}`)
  if (clavePrevia.current !== `${filtrosKey}|${ordenKey}`) {
    clavePrevia.current = `${filtrosKey}|${ordenKey}`
    if (page !== 1) setPage(1)
  }

  /**
   * Alterna el orden de una columna: ascendente → descendente → sin orden (vuelve al
   * que aplica el backend por defecto).
   */
  const alternarOrden = (campo) => {
    setOrden(prev => {
      if (!prev || prev.campo !== campo) return { campo, dir: 'asc' }
      if (prev.dir === 'asc') return { campo, dir: 'desc' }
      return null
    })
  }

  /**
   * Fija el orden de forma directa. Lo usa el menú de columna, que pide una dirección
   * concreta ("A → Z") en vez de ciclar como el clic en el encabezado.
   */
  const fijarOrden = (campo, dir) => setOrden(dir ? { campo, dir } : null)

  const recargar = useCallback(() => {
    // En pausa: ni se pide nada ni se deja el esqueleto de carga puesto.
    if (!habilitado) {
      setRows([])
      setTotal(0)
      setTotalPages(0)
      setLoading(false)
      return Promise.resolve()
    }

    setLoading(true)

    const params = { page: page - 1, size }
    if (ordenKey) params.sort = ordenKey
    for (const [clave, valor] of Object.entries(JSON.parse(filtrosKey))) {
      if (valor !== null && valor !== undefined && valor !== '') params[clave] = valor
    }

    return api.get(url, { params })
      .then((r) => {
        setRows(r.data.content ?? [])
        setTotal(r.data.totalElements ?? 0)
        setTotalPages(r.data.totalPages ?? 0)
      })
      .catch(() => {
        setRows([])
        setTotal(0)
        setTotalPages(0)
      })
      .finally(() => setLoading(false))
  }, [url, filtrosKey, ordenKey, page, size, habilitado])

  useEffect(() => { recargar() }, [recargar])

  return {
    rows, page, setPage, totalPages, total, loading, recargar,
    orden, alternarOrden, fijarOrden,
  }
}
