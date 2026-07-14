import { useEffect, useState } from 'react'

/**
 * Retrasa la propagación de un valor.
 *
 * Ahora que buscar significa ir al servidor, sin esto cada tecla dispararía una petición:
 * escribir "laptop" serían seis consultas y solo la última importa.
 */
export default function useDebounce(valor, ms = 350) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const t = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(t)
  }, [valor, ms])

  return retrasado
}
