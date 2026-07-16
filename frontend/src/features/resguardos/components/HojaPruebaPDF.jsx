import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { W, H, GAP, PAD_TOP, PAD_BOTTOM, PAD_LEFT, PAD_RIGHT, COLS, ROWS, RADIO } from './etiquetaLayout'

const CM = 72 / 2.54   // puntos por centímetro
const REF_CM = 5       // longitud de la regla de referencia

/**
 * Hoja de calibración: dibuja el contorno de las 30 etiquetas de una Janel J5260 en sus
 * posiciones exactas, sin contenido.
 *
 * Sirve para imprimir en papel normal y contrastar a contraluz contra una hoja de etiquetas
 * real: si los recuadros coinciden con el troquelado, la impresora no está escalando y las
 * etiquetas de verdad saldrán alineadas.
 *
 * Usa las mismas constantes que EtiquetasPDF a propósito: si la hoja de prueba tuviera sus
 * propias medidas podría cuadrar mientras las etiquetas reales no, y no serviría de nada.
 */

const s = StyleSheet.create({
  page: {
    paddingTop: PAD_TOP,
    paddingBottom: PAD_BOTTOM,
    paddingLeft: PAD_LEFT,
    paddingRight: PAD_RIGHT,
  },
  row:    { flexDirection: 'row', height: H },
  colGap: { width: GAP },

  // El borde se dibuja hacia dentro, así que el recuadro ocupa exactamente W x H: el trazo
  // no agranda la etiqueta ni desplaza a las de al lado.
  etiqueta: {
    width: W,
    height: H,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
    borderRadius: RADIO,
  },

  /* Regla de referencia dentro del primer recuadro: permite detectar si la impresora
     escaló la hoja, que es la causa habitual de que las etiquetas salgan corridas. */
  refWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refTexto: {
    fontSize: 6,
    marginBottom: 2,
  },
  refRegla: {
    width: REF_CM * CM,
    height: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
  },
})

export default function HojaPruebaPDF() {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {Array.from({ length: ROWS }).map((_, fila) => (
          <View key={fila} style={s.row}>
            {Array.from({ length: COLS }).flatMap((_, col) => {
              const celdas = []
              if (col > 0) celdas.push(<View key={`g${fila}-${col}`} style={s.colGap} />)
              celdas.push(
                <View key={`e${fila}-${col}`} style={s.etiqueta}>
                  {fila === 0 && col === 0 && (
                    <View style={s.refWrap}>
                      <Text style={s.refTexto}>{REF_CM.toFixed(2)} cm exactos</Text>
                      <View style={s.refRegla} />
                    </View>
                  )}
                </View>
              )
              return celdas
            })}
          </View>
        ))}
      </Page>
    </Document>
  )
}
