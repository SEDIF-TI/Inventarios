import { useState, useEffect } from 'react'
import api from '../services/api'
import useDebounce from './useDebounce'

const MIN_LETRAS = 2
const MAX_SUGERENCIAS = 8

/**
 * Sugerencias de autocompletado pedidas al servidor mientras se escribe.
 *
 * Antes las sugerencias salían de las filas ya cargadas en pantalla, lo que no servía:
 * en tablas que arrancan vacías no hay nada de dónde sacarlas, y aun con datos solo se
 * veía la página actual. Aquí se consulta el propio listado con el texto tecleado y se
 * extraen los valores de los campos indicados.
 *
 * @param url     endpoint del listado (p. ej. '/resguardos')
 * @param param   query param por el que se busca (p. ej. 'q' o 'descripcion')
 * @param campos  campos de la respuesta de los que se sacan las sugerencias
 * @param texto   lo que va escribiendo el usuario
 */
export default function useSugerencias(url, param, campos, texto) {
  const [opciones, setOpciones] = useState([])
  const [cargando, setCargando] = useState(false)
  const consulta = useDebounce(texto)

  useEffect(() => {
    const limpio = (consulta ?? '').trim()
    if (limpio.length < MIN_LETRAS) {
      setOpciones([])
      setCargando(false)
      return
    }

    setCargando(true)

    // Si llega otra respuesta después de que el texto cambió, se descarta: sin esto una
    // petición lenta puede pisar las sugerencias de una búsqueda más reciente.
    let vigente = true

    api.get(url, { params: { [param]: limpio, page: 0, size: MAX_SUGERENCIAS } })
      .then((r) => {
        if (!vigente) return
        const filas = r.data?.content ?? []
        const valores = campos.flatMap(campo => filas.map(f => f[campo]))
        const unicos = [...new Set(valores.filter(Boolean).map(String))]
        setOpciones(
          unicos
            .filter(v => v.toUpperCase().includes(limpio.toUpperCase()))
            .slice(0, MAX_SUGERENCIAS)
        )
      })
      .catch(() => { if (vigente) setOpciones([]) })
      .finally(() => { if (vigente) setCargando(false) })

    return () => { vigente = false }
    // `campos` se serializa: si se pasa un array literal cambiaría de identidad en cada
    // render y dispararía la consulta en bucle.
  }, [url, param, JSON.stringify(campos), consulta])

  return { opciones, cargando }
}
