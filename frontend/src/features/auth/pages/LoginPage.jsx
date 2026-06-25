import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'
import { Box, Card, TextField, Button, Typography, InputAdornment, IconButton, Stack } from '@mui/material'
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import corazon      from '@/assets/logos/corazon.png'
import familiasDif  from '@/assets/logos/familias-dif.png'
import pensarGrande from '@/assets/logos/pensargrande.png'

const LOGO_WHITE = 'brightness(0) invert(1)'

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: 'easeOut' },
})

// Cada orbe tiene su propio tamaño, posición inicial y ruta de movimiento
const ORBES = [
  {
    size: 420,
    opacity: 0.07,
    blur: 0,
    initial: { top: -140, right: -140 },
    animate: { x: [0, 60, -30, 80, 20, 0], y: [0, 40, -60, 20, -40, 0] },
    duration: 28,
  },
  {
    size: 300,
    opacity: 0.06,
    blur: 0,
    initial: { bottom: -100, left: -100 },
    animate: { x: [0, -40, 60, -20, 50, 0], y: [0, -50, 30, -70, 20, 0] },
    duration: 34,
  },
  {
    size: 200,
    opacity: 0.09,
    blur: 6,
    initial: { top: '30%', left: -80 },
    animate: { x: [0, 70, 20, 90, 40, 0], y: [0, -30, 60, 10, -50, 0] },
    duration: 26,
  },
  {
    size: 160,
    opacity: 0.09,
    blur: 8,
    initial: { bottom: '25%', right: -50 },
    animate: { x: [0, -60, -20, -80, -30, 0], y: [0, 50, -40, 80, 20, 0] },
    duration: 31,
  },
  {
    size: 100,
    opacity: 0.12,
    blur: 12,
    initial: { top: '55%', left: '40%' },
    animate: { x: [0, 50, -40, 60, -20, 0], y: [0, -60, 40, -80, 30, 0] },
    duration: 22,
  },
]

export default function LoginPage() {
  const theme     = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const navigate = useNavigate()

  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Ingresa tu usuario y contraseña.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/login', { username, password })
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Usuario o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: theme.brand.gradienteSuave }}>

      {/* ── Panel izquierdo ── */}
      {isDesktop && (
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ flex: 1, display: 'flex' }}
        >
          <Box
            sx={{
              flex: 1,
              background: theme.brand.gradiente,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 6,
              pt: 8,
              pb: 6,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Orbes animadas */}
            {ORBES.map((orb, i) => (
              <motion.div
                key={i}
                animate={orb.animate}
                transition={{
                  duration: orb.duration,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  width: orb.size,
                  height: orb.size,
                  borderRadius: '50%',
                  background: `rgba(255,255,255,${orb.opacity})`,
                  filter: orb.blur ? `blur(${orb.blur}px)` : 'none',
                  pointerEvents: 'none',
                  ...orb.initial,
                }}
              />
            ))}

            {/* Bloque central: corazón + título */}
            <Stack alignItems="center" sx={{ zIndex: 1, flex: 1, justifyContent: 'center' }}>

              {/* Corazón */}
              <motion.img
                src={corazon}
                alt="SEDIF"
                {...fadeUp(0.25)}
                style={{
                  width: 180,
                  height: 'auto',
                  filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.18))',
                }}
              />

              {/* Título */}
              <motion.div {...fadeUp(0.45)} style={{ marginTop: 36 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#ffffff',
                    textAlign: 'center',
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    lineHeight: 1.2,
                    textShadow: '0 2px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  Sistema de Control
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'rgba(255,255,255,0.75)',
                    textAlign: 'center',
                    fontWeight: 400,
                    letterSpacing: -0.5,
                    lineHeight: 1.2,
                    mt: 0.5,
                  }}
                >
                  de Inventarios
                </Typography>
              </motion.div>
            </Stack>

            {/* Bloque inferior: Familias DIF izq — Pensar Grande der */}
            <motion.div {...fadeUp(0.65)} style={{ width: '100%', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  pt: 3,
                  borderTop: '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <Box
                  component="img"
                  src={familiasDif}
                  alt="Familias Sistema Estatal DIF"
                  sx={{ height: 44, width: 'auto', filter: LOGO_WHITE }}
                />
                <Box
                  component="img"
                  src={pensarGrande}
                  alt="Pensar en Grande"
                  sx={{ height: 44, width: 'auto', filter: LOGO_WHITE }}
                />
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      )}

      {/* ── Panel derecho: formulario ── */}
      <Box
        sx={{
          flex: isDesktop ? '0 0 480px' : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: isDesktop ? 0.2 : 0 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 32px rgba(15,23,42,0.08)',
            }}
          >
            <Stack alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
              {!isDesktop && (
                <Box component="img" src={corazon} alt="SEDIF" sx={{ width: 64, height: 'auto', mb: 1 }} />
              )}
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: theme.brand.gradienteSuave,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Lock sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="text.primary">
                Iniciar sesión
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Ingresa tus credenciales para acceder al sistema
              </Typography>
            </Stack>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                <TextField
                  label="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  fullWidth
                  disabled={loading}
                />

                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  fullWidth
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Typography variant="body2" color="error" textAlign="center">
                        {error}
                      </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    mt: 1,
                    py: 1.4,
                    background: theme.brand.gradiente,
                    '&:hover': { background: 'linear-gradient(135deg, #fc6c9c 0%, #db2777 100%)' },
                    '&:disabled': { background: theme.palette.action.disabledBackground },
                  }}
                >
                  {loading ? 'Verificando…' : 'Entrar'}
                </Button>
              </Stack>
            </Box>
          </Card>

          <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 3 }}>
            SEDIF Puebla · Sistema de Inventarios
          </Typography>
        </motion.div>
      </Box>
    </Box>
  )
}
