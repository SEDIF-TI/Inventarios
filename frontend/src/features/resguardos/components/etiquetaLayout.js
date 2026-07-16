/**
 * Geometría de la hoja de etiquetas Janel J5260 (equivalente a Avery 5260).
 *
 * Todo va en puntos PDF (1 pt = 1/72 pulgada), que es la unidad nativa del formato, y las
 * medidas se derivan de las pulgadas fraccionarias de la ficha —no de sus centímetros, que
 * están redondeados: la etiqueta es 2 5/8" = 6.6675 cm, no 6.70.
 *
 * Los totales tienen que dar 612 x 792 pt (8.5" x 11") exactos; si no, las etiquetas salen
 * corridas respecto del troquelado de la hoja. Hay un test que lo comprueba.
 *
 * Este módulo es la única fuente de estas medidas: lo usan tanto las etiquetas reales como
 * la hoja de prueba, para que la hoja de calibración no pueda desincronizarse de lo que
 * realmente se imprime.
 */

export const W = 189   // ancho etiqueta  = 2 5/8"
export const H = 72    // alto etiqueta   = 1"
export const GAP = 9   // separación horizontal entre columnas = 1/8"

export const PAD_TOP = 36      // margen superior = 1/2"
export const PAD_BOTTOM = 36   // margen inferior = 1/2"
export const PAD_LEFT = 13.5   // margen izquierdo = 3/16"
export const PAD_RIGHT = 13.5  // margen derecho   = 3/16"

export const COLS = 3
export const ROWS = 10
export const POR_HOJA = COLS * ROWS

/** Radio del troquelado redondeado de la etiqueta. */
export const RADIO = 6
