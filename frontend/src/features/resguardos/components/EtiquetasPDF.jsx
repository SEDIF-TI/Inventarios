import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import oswaldLight   from '@/assets/fonts/Oswald-Light.ttf'
import oswaldRegular from '@/assets/fonts/Oswald-Regular.ttf'
import oswaldBold    from '@/assets/fonts/Oswald-Bold.ttf'

Font.register({
  family: 'Oswald',
  fonts: [
    { src: oswaldLight,   fontWeight: 300 },
    { src: oswaldRegular, fontWeight: 400 },
    { src: oswaldBold,    fontWeight: 700 },
  ],
})

const FONT   = 'Oswald'
const W      = 189
const H      = 72
const GAP    = 9
const LOGO_W = 45

const isNA = (v) => !v || v.trim().toUpperCase() === 'N/A'

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 13.5,
    paddingRight: 13.5,
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
  marcaText: {
    fontSize: 7,
    fontWeight: 300,
    textAlign: 'center',
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
          {marcaMod ? <Text style={s.marcaText}>{marcaMod}</Text> : null}
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
  for (let i = 0; i < etiquetas.length; i += 3) {
    rows.push(etiquetas.slice(i, i + 3))
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
