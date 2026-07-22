/**
 * Nombre completo del empleado en el MISMO orden en que lo concatena el backend
 * (nombre + apellido paterno + apellido materno).
 *
 * Que coincida no es cosmético: el filtro `empleado` de /resguardos compara con LIKE
 * contra esa concatenación, así que lo que se muestra en pantalla tiene que ser
 * exactamente lo que se puede filtrar. Si aquí se invirtiera el orden, buscar por el
 * nombre que ve el usuario no devolvería nada.
 */
export const nombreEmpleado = (e) =>
  [e?.nombreEmpleado, e?.apellidoPaternoEmpleado, e?.apellidoMaternoEmpleado]
    .filter(Boolean)
    .join(' ')
