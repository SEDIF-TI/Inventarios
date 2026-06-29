import { useState, useEffect } from 'react'
import { Box, Typography, Stack, Divider } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { motion } from 'motion/react'
import corazon      from '@/assets/logos/corazon.png'
import familiasDif  from '@/assets/logos/familias-dif.png'
import pensarGrande from '@/assets/logos/pensargrande.png'
import api from '@/services/api'

const ORBES = [
  {
    size: 420, opacity: 0.07, blur: 0,
    initial: { top: -140, right: -140 },
    animate: { x: [0, 60, -30, 80, 20, 0], y: [0, 40, -60, 20, -40, 0] },
    duration: 28,
  },
  {
    size: 300, opacity: 0.06, blur: 0,
    initial: { bottom: -100, left: -100 },
    animate: { x: [0, -40, 60, -20, 50, 0], y: [0, -50, 30, -70, 20, 0] },
    duration: 34,
  },
  {
    size: 200, opacity: 0.09, blur: 6,
    initial: { top: '30%', left: -80 },
    animate: { x: [0, 70, 20, 90, 40, 0], y: [0, -30, 60, 10, -50, 0] },
    duration: 26,
  },
  {
    size: 160, opacity: 0.09, blur: 8,
    initial: { bottom: '25%', right: -50 },
    animate: { x: [0, -60, -20, -80, -30, 0], y: [0, 50, -40, 80, 20, 0] },
    duration: 31,
  },
  {
    size: 100, opacity: 0.13, blur: 12,
    initial: { top: '55%', left: '40%' },
    animate: { x: [0, 50, -40, 60, -20, 0], y: [0, -60, 40, -80, 30, 0] },
    duration: 22,
  },
]

const DIAS    = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MESES   = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function getGreeting(h) {
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}


const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: 'easeOut' },
})

export default function HomePage() {
  const theme   = useTheme()
  const now     = useClock()

  const [stats, setStats] = useState([
    { label: 'Resguardos',  value: '—' },
    { label: 'Empleados',   value: '—' },
    { label: 'Áreas',       value: '—' },
    { label: 'Movimientos', value: '—' },
  ])

  useEffect(() => {
    Promise.allSettled([
      api.get('/empleados'),
      api.get('/areas/listarTodas'),
    ]).then(([empleados, areas]) => {
      setStats([
        { label: 'Resguardos',  value: '—' },
        { label: 'Empleados',   value: empleados.status === 'fulfilled' ? empleados.value.data.length : '—' },
        { label: 'Áreas',       value: areas.status     === 'fulfilled' ? areas.value.data.length     : '—' },
        { label: 'Movimientos', value: '—' },
      ])
    })
  }, [])

  const hh     = String(now.getHours()).padStart(2, '0')
  const mm     = String(now.getMinutes()).padStart(2, '0')
  const ss     = String(now.getSeconds()).padStart(2, '0')
  const fecha  = `${DIAS[now.getDay()]}, ${now.getDate()} de ${MESES[now.getMonth()]} de ${now.getFullYear()}`
  const saludo = getGreeting(now.getHours())

  // TODO: obtener nombre real del AuthContext cuando esté implementado
  const nombre = 'Marlen'

  return (
    <Box
        sx={{
          minHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 6,
          position: 'relative',
        }}
      >
        {/* Orbes animadas */}
        {ORBES.map((orb, i) => (
          <motion.div
            key={i}
            animate={orb.animate}
            transition={{ duration: orb.duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `rgba(219,39,119,${orb.opacity})`,
              filter: orb.blur ? `blur(${orb.blur}px)` : 'none',
              pointerEvents: 'none',
              ...orb.initial,
            }}
          />
        ))}
        {/* ── Bloque principal ── */}
        <Box />

        <Stack alignItems="center" spacing={5} sx={{ width: '100%', maxWidth: 600 }}>

          {/* Corazón palpitando */}
          <motion.div {...fadeUp(0)}>
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{
                  position: 'absolute',
                  width: 320, height: 320, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(219,39,119,0.08) 0%, transparent 70%)',
                }} />
                <Box sx={{
                  position: 'absolute',
                  width: 220, height: 220, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(219,39,119,0.13) 0%, transparent 70%)',
                }} />
                <Box
                  component="img"
                  src={corazon}
                  alt="SEDIF"
                  sx={{
                    width: 192, height: 192,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 36px rgba(219,39,119,0.38))',
                    position: 'relative',
                  }}
                />
              </Box>
          </motion.div>

          {/* Título del sistema */}
          <motion.div {...fadeUp(0.15)} style={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                background: theme.brand.gradiente,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: -0.5,
              }}
            >
              Sistema de Control de Inventarios
            </Typography>
          </motion.div>

          {/* Saludo + reloj + fecha */}
          <motion.div {...fadeUp(0.28)} style={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="h6" fontWeight={400} color="text.secondary" sx={{ mb: 0.5 }}>
              {saludo},{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {nombre}
              </Box>
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 1 }}>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{ color: 'text.primary', letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}
              >
                {hh}
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                    animation: 'blink 1s step-end infinite',
                    '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
                  }}
                >
                  :
                </Box>
                {mm}
                <Typography
                  component="span"
                  variant="h6"
                  sx={{ color: 'text.secondary', fontWeight: 400, ml: 0.5, fontVariantNumeric: 'tabular-nums' }}
                >
                  :{ss}
                </Typography>
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, letterSpacing: 0.3 }}>
              {fecha}
            </Typography>
          </motion.div>

          {/* Estadísticas */}
          <motion.div {...fadeUp(0.42)} style={{ width: '100%' }}>
            <Divider sx={{ mb: 4 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
                textAlign: 'center',
              }}
            >
              {stats.map(({ label, value }) => (
                <Box key={label}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: 'primary.main', lineHeight: 1 }}
                  >
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ mt: 4 }} />
          </motion.div>

        </Stack>

        {/* ── Logos institucionales ── */}
        <motion.div {...fadeUp(0.56)} style={{ width: '100%', maxWidth: 600 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 4, pt: 2,
            }}
          >
            <Box
              component="img"
              src={familiasDif}
              alt="Familias DIF"
              sx={{ height: 36, width: 'auto', opacity: 0.55 }}
            />
            <Box
              component="img"
              src={pensarGrande}
              alt="Pensar en Grande"
              sx={{ height: 36, width: 'auto', opacity: 0.55 }}
            />
          </Box>
        </motion.div>

      </Box>
  )
}
