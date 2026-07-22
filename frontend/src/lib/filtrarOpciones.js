/** Quita acentos y normaliza a minúsculas, para que "área" encuentre "AREA" y viceversa. */
const normalizar = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/**
 * Escapa lo que va dentro de una expresión regular.
 *
 * No es cosmético: hay áreas como "DELEGACION PUEBLA (10)", así que en cuanto alguien
 * teclea un paréntesis, sin escapar esto revienta con "Invalid regular expression".
 */
const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * filterOptions para Autocomplete que filtra Y ordena por relevancia.
 *
 * MUI filtra correctamente, pero devuelve las coincidencias en el orden original del
 * catálogo. Con listas largas eso deja lo que buscabas hasta el fondo: al teclear
 * "procura" salían primero varias "COORDINACION..." y "PROCURADURIA" quedaba abajo,
 * obligando a escribir casi el nombre completo. Aquí lo más parecido sube primero.
 *
 * @param getLabel cómo sacar el texto de cada opción
 */
export const filtrarOpciones = (getLabel) => (opciones, { inputValue }) => {
  const q = normalizar(inputValue)
  if (!q) return opciones

  const inicioDePalabra = new RegExp(`\\b${escaparRegex(q)}`)

  const relevancia = (opcion) => {
    const texto = normalizar(getLabel(opcion))
    if (!texto.includes(q)) return -1        // no coincide: fuera
    if (texto.startsWith(q)) return 0        // el nombre empieza con lo tecleado
    if (inicioDePalabra.test(texto)) return 1 // alguna palabra empieza con lo tecleado
    return 2                                  // coincide en medio de una palabra
  }

  // sort es estable, así que dentro del mismo nivel se respeta el orden del catálogo.
  return opciones
    .map((opcion) => ({ opcion, nivel: relevancia(opcion) }))
    .filter((x) => x.nivel >= 0)
    .sort((a, b) => a.nivel - b.nivel)
    .map((x) => x.opcion)
}
