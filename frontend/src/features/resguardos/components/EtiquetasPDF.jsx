import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import oswaldLight   from '@/assets/fonts/Oswald-Light.ttf'
import oswaldRegular from '@/assets/fonts/Oswald-Regular.ttf'
import oswaldBold    from '@/assets/fonts/Oswald-Bold.ttf'
import { W, H, GAP, PAD_TOP, PAD_BOTTOM, PAD_LEFT, PAD_RIGHT, COLS } from './etiquetaLayout'

Font.register({
  family: 'Oswald',
  fonts: [
    { src: oswaldLight,   fontWeight: 300 },
    { src: oswaldRegular, fontWeight: 400 },
    { src: oswaldBold,    fontWeight: 700 },
  ],
})

const FONT   = 'Oswald'
const LOGO_W = 45

const isNA = (v) => !v || v.trim().toUpperCase() === 'N/A'

/* Los números de serie largos desbordarían la etiqueta por la derecha, así que se recortan. */
const MAX_SERIE = 10
const truncarSerie = (v) => (v.length > MAX_SERIE ? v.slice(0, MAX_SERIE) + '…' : v)

const s = StyleSheet.create({
  page: {
    paddingTop: PAD_TOP,
    paddingBottom: PAD_BOTTOM,
    paddingLeft: PAD_LEFT,
    paddingRight: PAD_RIGHT,
    fontFamily: FONT,
    fontWeight: 300,
  },
  row:    { flexDirection: 'row', height: H },
  colGap: { width: GAP },

  label: {
    width: W,
    height: H,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 3,
    paddingRight: 3,
    flexDirection: 'column',
  },

  /* ── logos + texto derecha ── */
  topSection: {
    flexDirection: 'row',
    flex: 1,
  },
  logosCol: {
    width: LOGO_W + 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo:    { width: LOGO_W, objectFit: 'contain' },
  logoSep: { height: 2 },

  infoCol: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingLeft: 2,
  },

  /* área arriba a la derecha */
  areaText: {
    fontSize: 6,
    fontWeight: 300,
    textAlign: 'right',
    marginBottom: 4,
  },

  /* descripción y marca: centrados en infoCol → quedan ligeramente a la dcha del centro del label */
  descripcionText: {
    fontSize: 7,
    fontWeight: 300,
    textAlign: 'center',
    marginBottom: 1,
  },
  /* Desplazada a la izquierda respecto de su posición natural para dejar aire a la derecha:
     es donde termina el no. de serie y donde antes se salía del borde de la etiqueta. */
  marcaText: {
    fontSize: 7,
    fontWeight: 300,
    textAlign: 'center',
    position: 'relative',
    right: 10,
  },

  /* ── sección inferior: ancho completo del label ── */
  bottomSection: {
    flexDirection: 'column',
  },

  /* nombre completo centrado en los 189pt */
  empleadoText: {
    fontSize: 8,
    fontWeight: 300,
    textAlign: 'center',
    marginBottom: 1,
  },

  /* wrapper relativo para centrar no. inventario y pegar fecha a la derecha */
  inventarioWrap: {
    position: 'relative',
  },
  inventarioText: {
    fontSize: 8,
    fontWeight: 400,
    textAlign: 'center',
  },
  /* fecha absolutamente pegada a la derecha, alineada al baseline del inventario */
  fechaText: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    fontSize: 8,
    fontWeight: 300,
  },
})

function Etiqueta({ data, logoPuebla, logoFamilias }) {
  const marcaMod = [data.marcaBien, data.modeloBien]
    .filter(v => !isNA(v))
    .join('  ')

  const serie = isNA(data.noSerieBien) ? '' : truncarSerie(data.noSerieBien.trim())

  // Queda "DELL OPTIPLEX 7010 / A1B2C3D4E5…". El filter evita dejar un "/" suelto cuando
  // falta la marca/modelo o el no. de serie.
  const equipo = [marcaMod, serie].filter(Boolean).join(' / ')

  const empleado = (data.empleado || '').replace(/\s*\/+\s*$/, '').trim()

  return (
    <View style={s.label}>

      {/* logos + área / descripción / marca */}
      <View style={s.topSection}>

        <View style={s.logosCol}>
          <Image src={logoPuebla}   style={s.logo} />
          <View  style={s.logoSep} />
          <Image src={logoFamilias} style={s.logo} />
        </View>

        <View style={s.infoCol}>
          <Text style={s.areaText}>{data.codigoAreaAdscripcion} {data.areaAdscripcion}</Text>
          <Text style={s.descripcionText}>{data.descripcionBien}</Text>
          {equipo ? <Text style={s.marcaText}>{equipo}</Text> : null}
        </View>

      </View>

      {/* nombre + no. inventario (ancho completo) */}
      <View style={s.bottomSection}>
        <Text style={s.empleadoText}>{empleado}</Text>

        <View style={s.inventarioWrap}>
          <Text style={s.inventarioText}>{data.noInventarioBien}</Text>
          {data.mesAnioAsignacion
            ? <Text style={s.fechaText}>{data.mesAnioAsignacion}</Text>
            : null}
        </View>
      </View>

    </View>
  )
}

export default function EtiquetasPDF({ etiquetas, logoPuebla, logoFamilias }) {
  const rows = []
  for (let i = 0; i < etiquetas.length; i += COLS) {
    rows.push(etiquetas.slice(i, i + COLS))
  }

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {rows.map((row, ri) => (
          <View key={ri} style={s.row}>
            {row.flatMap((etiqueta, ci) => {
              const items = []
              if (ci > 0) items.push(<View key={`g${ri}-${ci}`} style={s.colGap} />)
              items.push(
                <Etiqueta
                  key={etiqueta.noInventarioBien ?? `${ri}-${ci}`}
                  data={etiqueta}
                  logoPuebla={logoPuebla}
                  logoFamilias={logoFamilias}
                />
              )
              return items
            })}
          </View>
        ))}
      </Page>
    </Document>
  )
}
