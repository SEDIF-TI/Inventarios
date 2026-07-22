import PersonAddAlt1Icon        from '@mui/icons-material/PersonAddAlt1'
import SwapHorizIcon           from '@mui/icons-material/SwapHoriz'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import Inventory2Icon          from '@mui/icons-material/Inventory2'

/**
 * Qué acciones admite un resguardo según su estatus.
 *
 * Vive aquí y no en cada componente porque la usan el modal de detalle y la columna de
 * acciones de la tabla: con una copia en cada lado, cambiar la regla en un sitio y
 * olvidar el otro dejaría botones que el backend rechaza.
 */
export function accionesDisponibles(estatus) {
  if (estatus === 'ACTIVO')     return ['baja', 'reasignar', 'disponible']
  if (estatus === 'DISPONIBLE') return ['asignar', 'baja']
  return []   // BAJA es terminal
}

export const ACCION_CONFIG = {
  asignar:    { label: 'Asignar',           icon: PersonAddAlt1Icon,        color: 'success' },
  reasignar:  { label: 'Reasignar',         icon: SwapHorizIcon,            color: 'primary' },
  baja:       { label: 'Dar de baja',       icon: RemoveCircleOutlineIcon,  color: 'error'   },
  disponible: { label: 'Marcar disponible', icon: Inventory2Icon,           color: 'info'    },
}
