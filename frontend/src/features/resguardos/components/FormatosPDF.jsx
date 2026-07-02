import { Document, Page, View, Text, Image, StyleSheet, Font, Svg, Line } from '@react-pdf/renderer'
import oswaldLight   from '@/assets/fonts/Oswald-Light.ttf'
import oswaldRegular from '@/assets/fonts/Oswald-Regular.ttf'
import oswaldMedium  from '@/assets/fonts/Oswald-Medium.ttf'
import oswaldBold    from '@/assets/fonts/Oswald-Bold.ttf'

Font.register({
  family: 'Oswald',
  fonts: [
    { src: oswaldLight,   fontWeight: 300 },
    { src: oswaldRegular, fontWeight: 400 },
    { src: oswaldMedium,  fontWeight: 500 },
    { src: oswaldBold,    fontWeight: 700 },
  ],
})

const FONT = 'Oswald'

const NOTA = 'NOTA: Manifiesto que los bienes muebles antes mencionados se reciben de acuerdo al estado físico marcado en el listado a partir de la fecha de la firma del resguardo; está bajo mi responsabilidad el darle el uso adecuado para el desempeño de mis actividades y devolverlo cuando me lo soliciten, concluya mi comisión y/o cese mis actividades por cualquier otra causa, en las mismas condiciones en la que lo recibí, salvo el deterioro normal por el uso, haciéndome responsable de los daños, perjuicios, robo o pérdida parcial o total que pudiera sufrir el bien mueble (informando inmediatamente a la sección de almacén e inventarios); en caso de que esto sucediera, me comprometo a devolver otro bien de similares características y condiciones, o en su caso pagar el valor del mercado, en término de lo dispuesto por la normativa en materia de responsabilidad administrativa. -'

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 34,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: FONT,
    fontWeight: 300,
    fontSize: 8,
  },

  /* header institucional */
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 140,
    minHeight: 75,
    marginBottom: 8,
  },
  logoLeft: {
    position: 'absolute',
    left: 35.3,
    top: 46.6,
    width: 87.2,
    height: 68.4,
    objectFit: 'contain',
  },
  logoRight: {
    position: 'absolute',
    right: 35.3,
    top: 46.6,
    width: 87.2,
    height: 68.4,
    objectFit: 'contain',
  },
  headerLine2: { fontSize: 14, fontWeight: 500, color: '#7f7f7f', marginTop: 1 },
  headerLine3: { fontSize: 12, fontWeight: 500, color: '#7f7f7f', marginTop: 1 },
  headerLine4: { fontSize: 10, fontWeight: 500, color: '#7f7f7f' },

  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#7f7f7f',
    textAlign: 'center',
    marginBottom: 8,
  },

  intro: {
    fontSize: 11,
    fontWeight: 300,
    color: '#7f7f7f',
    lineHeight: 1.3,
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  fechaEmision: {
    fontSize: 7.5,
    fontWeight: 400,
    textAlign: 'right',
    marginBottom: 3,
  },

  unidadRow: { flexDirection: 'row', marginBottom: 4 },
  fieldLabel: { fontSize: 10, fontWeight: 400, color: '#7f7f7f', marginRight: 4 },
  fieldValue: { fontSize: 10, fontWeight: 400, color: '#404040' },

  /* tabla */
  dashedLine: { marginTop: 6, marginBottom: 6 },
  tableHeaderRow: {
    flexDirection: 'row',
  },
  th: { fontSize: 10, fontWeight: 500, color: '#7f7f7f' },

  responsableRow: { flexDirection: 'row', marginTop: 4, marginBottom: 2 },

  groupBar: {
    backgroundColor: '#bfbfbf',
    paddingVertical: 2,
    paddingHorizontal: 3,
    marginTop: 3,
  },
  groupBarText: { fontSize: 10, fontWeight: 500, color: '#ffffff' },

  tr: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  td: { fontSize: 10, fontWeight: 300, color: '#404040', textTransform: 'uppercase' },

  colNo:        { flexGrow: 0.35, flexBasis: 0, paddingRight: 2 },
  colInv:       { flexGrow: 1.1,  flexBasis: 0, paddingRight: 2 },
  colDesc:      { flexGrow: 2.3,  flexBasis: 0, paddingRight: 2 },
  colEstado:    { flexGrow: 0.75, flexBasis: 0, paddingRight: 2 },
  colMarca:     { flexGrow: 0.95, flexBasis: 0, paddingRight: 2 },
  colModelo:    { flexGrow: 0.95, flexBasis: 0, paddingRight: 2 },
  colSerie:     { flexGrow: 1.3,  flexBasis: 0, paddingRight: 2 },
  colMaterial:  { flexGrow: 1.3,  flexBasis: 0 },

  nota: {
    fontSize: 8,
    fontWeight: 300,
    color: '#000000',
    lineHeight: 1.3,
    marginTop: 8,
    textAlign: 'justify',
  },

  observacionesLabel: { fontFamily: 'Helvetica', fontSize: 7.5, marginTop: 8 },
  observacionesValue: { fontFamily: 'Helvetica', fontSize: 7.5, marginTop: 2 },

  firmasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  firmaCol: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  firmaLabel: { fontSize: 7.5, fontWeight: 500, color: '#7f7f7f', marginBottom: 24 },
  firmaLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '90%',
    marginBottom: 3,
  },
  firmaNombre: { fontSize: 7.5, fontWeight: 500, color: '#7f7f7f', textAlign: 'center' },
  firmaCargo: { fontSize: 6, fontWeight: 500, color: '#7f7f7f', textAlign: 'center', marginTop: 2 },

  footerPagina: {
    position: 'absolute',
    bottom: 14,
    right: 40,
    fontSize: 7,
    fontWeight: 300,
  },
})

const CONTENT_W = 712

function DashedLine() {
  return (
    <Svg height={2} width={CONTENT_W} style={s.dashedLine}>
      <Line x1={0} y1={1} x2={CONTENT_W} y2={1} strokeWidth={1} stroke="#7f7f7f" strokeDasharray="7 5" />
    </Svg>
  )
}

function TableHeader() {
  return (
    <View>
      <DashedLine />
      <View style={s.tableHeaderRow}>
        <Text style={[s.th, s.colNo]}>No.</Text>
        <Text style={[s.th, s.colInv]}>No. Inventario</Text>
        <Text style={[s.th, s.colDesc]}>Descripción</Text>
        <Text style={[s.th, s.colEstado]}>Estado</Text>
        <Text style={[s.th, s.colMarca]}>Marca</Text>
        <Text style={[s.th, s.colModelo]}>Modelo</Text>
        <Text style={[s.th, s.colSerie]}>No Serie</Text>
        <Text style={[s.th, s.colMaterial]}>Material,Color</Text>
      </View>
      <DashedLine />
    </View>
  )
}

function BienRow({ bien, index }) {
  const bg = index % 2 === 0 ? '#ffffff' : '#f4f4f4'
  return (
    <View style={[s.tr, { backgroundColor: bg }]} wrap={false}>
      <Text style={[s.td, s.colNo]}>{String(index + 1).padStart(3, '0')}</Text>
      <Text style={[s.td, s.colInv]}>{bien.noInventario}</Text>
      <Text style={[s.td, s.colDesc]}>{bien.descripcionBien}</Text>
      <Text style={[s.td, s.colEstado]}>{bien.estadoBien}</Text>
      <Text style={[s.td, s.colMarca]}>{bien.marca}</Text>
      <Text style={[s.td, s.colModelo]}>{bien.modelo}</Text>
      <Text style={[s.td, s.colSerie]}>{bien.noSerie}</Text>
      <Text style={[s.td, s.colMaterial]}>{bien.materialColor}</Text>
    </View>
  )
}

function Formato({ data, logoPuebla, logoFamilias }) {
  const { fechaEmision, codigoArea, area, noControlEmpleado, nombreEmpleado,
          unidad, direccion, seccion, departamentoRecursosMateriales,
          bienesPatrimoniales, bienesNoPatrimoniales, observaciones } = data

  return (
    <Page size="LETTER" orientation="landscape" style={s.page} wrap>

      <Image src={logoPuebla}   style={s.logoLeft}  fixed />
      <Image src={logoFamilias} style={s.logoRight} fixed />

      <View style={s.header} fixed>
        <Text style={s.headerLine2}>{unidad}</Text>
        <Text style={s.headerLine3}>{direccion}</Text>
        <Text style={s.headerLine4}>{departamentoRecursosMateriales?.nombre}</Text>
        <Text style={s.headerLine4}>{seccion?.nombre}</Text>
      </View>

      <Text style={s.title}>Resguardo de Bienes Muebles</Text>

      <Text style={s.intro}>
        Recibí del Departamento de Recursos Materiales y Servicios Generales, a través de la Sección de Almacén e Inventarios,
        para mi resguardo y custodia los bienes que se describen a continuación.
      </Text>

      <Text style={s.fechaEmision}>Fecha de emisión: {fechaEmision}</Text>

      <View style={s.unidadRow}>
        <Text style={s.fieldLabel}>Unidad Administrativa:</Text>
        <Text style={s.fieldValue}>{codigoArea} {area}</Text>
      </View>

      <TableHeader />

      <View style={s.responsableRow}>
        <Text style={s.fieldLabel}>Responsable:</Text>
        <Text style={s.fieldValue}>{noControlEmpleado} {nombreEmpleado}</Text>
      </View>

      {bienesPatrimoniales.length > 0 && (
        <>
          <View style={s.groupBar}>
            <Text style={s.groupBarText}>RELACIÓN DE BIENES PATRIMONIALES</Text>
          </View>
          {bienesPatrimoniales.map((b, i) => (
            <BienRow key={b.noInventario ?? i} bien={b} index={i} />
          ))}
        </>
      )}

      {bienesNoPatrimoniales.length > 0 && (
        <>
          <View style={s.groupBar}>
            <Text style={s.groupBarText}>RELACIÓN DE BIENES NO PATRIMONIALES</Text>
          </View>
          {bienesNoPatrimoniales.map((b, i) => (
            <BienRow key={b.noInventario ?? i} bien={b} index={i} />
          ))}
        </>
      )}

      <Text style={s.nota}>{NOTA}</Text>

      <Text style={s.observacionesLabel}>Observaciones</Text>
      <Text style={s.observacionesValue}>{observaciones}</Text>

      <View style={s.firmasRow} wrap={false}>
        <View style={s.firmaCol}>
          <Text style={s.firmaLabel}>RECIBÍ DE CONFORMIDAD</Text>
          <View style={s.firmaLine} />
          <Text style={s.firmaNombre}>{nombreEmpleado}</Text>
        </View>

        <View style={s.firmaCol}>
          <Text style={s.firmaLabel}>ENTREGA</Text>
          <View style={s.firmaLine} />
          <Text style={s.firmaNombre}>{seccion?.responsable}</Text>
          <Text style={s.firmaCargo}>{seccion?.nombre}</Text>
        </View>

        <View style={s.firmaCol}>
          <Text style={s.firmaLabel}>AUTORIZA</Text>
          <View style={s.firmaLine} />
          <Text style={s.firmaNombre}>{departamentoRecursosMateriales?.responsable}</Text>
          <Text style={s.firmaCargo}>{departamentoRecursosMateriales?.nombre}</Text>
        </View>
      </View>

      <Text
        style={s.footerPagina}
        fixed
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </Page>
  )
}

export default function FormatosPDF({ formatos, logoPuebla, logoFamilias }) {
  return (
    <Document>
      {formatos.map((data, i) => (
        <Formato
          key={data.noControlEmpleado ?? i}
          data={data}
          logoPuebla={logoPuebla}
          logoFamilias={logoFamilias}
        />
      ))}
    </Document>
  )
}
