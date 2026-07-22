import { filtrarOpciones } from './filtrarOpciones'
import { nombreEmpleado } from './empleados'

/**
 * getOptionLabel / filterOptions estables para los Autocomplete de catálogo (Área,
 * Empleado) que se repiten en varias páginas y modales.
 *
 * MUI Autocomplete usa la IDENTIDAD de estas props en dependencias de sus propios
 * efectos internos (p. ej. el que resetea el texto escrito cuando cambia el valor
 * seleccionado). Si se crean inline —`getOptionLabel={(a) => a.descripcion}`— cada
 * render del componente padre genera una función nueva, y un re-render ajeno mientras
 * se está escribiendo (llega una sugerencia de otro campo, cambia la página, etc.)
 * puede disparar esos efectos internos en momentos que no corresponden. Exportar una
 * sola referencia por catálogo evita esa clase de comportamiento errático.
 */
export const labelArea  = (a) => a.descripcion ?? ''
export const filterArea = filtrarOpciones(labelArea)

export const filterEmpleado = filtrarOpciones(nombreEmpleado)
