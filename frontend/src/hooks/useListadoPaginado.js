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
 * @param url      ruta relativa al baseURL de api (p. ej. '/resguardos')
 * @param filtros  objeto de query params; las claves con valor null/'' se omiten
 */
export default function useListadoPaginado(url, filtros = {}, size = TAM_PAGINA) {
  const [page, setPage]       = useState(1)
  const [rows, setRows]       = useState([])
  const [total, setTotal]     = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  // Se serializan los filtros para poder usarlos como dependencia: el objeto se recrea en
  // cada render y como dependencia directa provocaría un bucle de peticiones.
  const filtrosKey = JSON.stringify(filtros)

  // Al cambiar los filtros hay que volver a la página 1. Se ajusta durante el render (patrón
  // documentado de React) y no en un efecto, para que la petición salga ya con la página
  // correcta: si estás en la 7 y filtras hasta dejar 2 páginas, pedir la 7 devuelve vacío.
  const filtrosPrevios = useRef(filtrosKey)
  if (filtrosPrevios.current !== filtrosKey) {
    filtrosPrevios.current = filtrosKey
    if (page !== 1) setPage(1)
  }

  const recargar = useCallback(() => {
    setLoading(true)

    const params = { page: page - 1, size }
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
  }, [url, filtrosKey, page, size])

  useEffect(() => { recargar() }, [recargar])

  return { rows, page, setPage, totalPages, total, loading, recargar }
}
