import { useState, useCallback } from 'react'

/**
 * Filtros aplicados desde el menú de cada columna de la tabla.
 *
 * Las claves son nombres de query param del backend (los `filterKey` de las columnas),
 * así que el objeto se puede pasar tal cual a useListadoPaginado.
 */
export default function useFiltrosColumna() {
  const [filtros, setFiltros] = useState({})

  const setFiltro = useCallback((clave, valor) => {
    setFiltros(prev => {
      // Un valor vacío se quita del objeto en lugar de quedarse como '': así el
      // "hay filtros activos" es un simple conteo de claves.
      if (valor === '' || valor === null || valor === undefined) {
        const { [clave]: _, ...resto } = prev
        return resto
      }
      return { ...prev, [clave]: valor }
    })
  }, [])

  const limpiar = useCallback(() => setFiltros({}), [])

  return { filtros, setFiltro, limpiar, hayFiltros: Object.keys(filtros).length > 0 }
}
