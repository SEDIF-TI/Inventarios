import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, Tooltip, Typography } from '@mui/material'
import { Player } from '@lordicon/react'
import api from '@/services/api'
import corazon       from '@/assets/logos/corazon.png'
import { ROUTES }   from '@/constants/routes'
import icAreas       from '@/assets/icons/areas.json'
import icEmpleados   from '@/assets/icons/empleados.json'
import icResguardos  from '@/assets/icons/resguardos.json'
import icHistorial   from '@/assets/icons/historial.json'
import icImportacion from '@/assets/icons/importacion.json'
import icReportes    from '@/assets/icons/reportes.json'
import icLogout      from '@/assets/icons/logout.json'

const W_CLOSED = 74
const W_OPEN   = 232
const MARGIN   = 12

const NAV_ITEMS = [
  { label: 'Áreas',       icon: icAreas,       path: ROUTES.AREAS       },
  { label: 'Empleados',   icon: icEmpleados,   path: ROUTES.EMPLEADOS   },
  { label: 'Resguardos',  icon: icResguardos,  path: ROUTES.RESGUARDOS  },
  { label: 'Historial',   icon: icHistorial,   path: ROUTES.HISTORIAL   },
  // { label: 'Importación', icon: icImportacion, path: ROUTES.IMPORTACION },
  // { label: 'Reportes',    icon: icReportes,    path: ROUTES.REPORTES    },
]

const navItemSx = (active) => ({
  display: 'flex', alignItems: 'center', gap: 1.5,
  px: 1.5, py: 1.1,
  borderRadius: 2,
  cursor: 'pointer',
  outline: 'none',
  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
  background: active ? 'rgba(219,39,119,0.18)' : 'transparent',
  boxShadow: active ? 'inset 3px 0 0 #db2777' : 'inset 3px 0 0 transparent',
  transition: 'background 160ms, color 160ms, box-shadow 160ms, transform 80ms',
  userSelect: 'none',
  '&:hover': {
    background: active ? 'rgba(219,39,119,0.26)' : 'rgba(255,255,255,0.07)',
    color: '#fff',
  },
  '&:active': {
    transform: 'scale(0.97)',
    background: active ? 'rgba(219,39,119,0.32)' : 'rgba(255,255,255,0.12)',
  },
  '&:focus-visible': {
    outline: '2px solid #db2777',
    outlineOffset: '2px',
  },
})

function NavItem({ label, icon, path, open }) {
  const navigate         = useNavigate()
  const location         = useLocation()
  const playerRef        = useRef(null)
  const [hovered, setHovered] = useState(false)
  const active           = location.pathname === path

  return (
    <Tooltip title={open ? '' : label} placement="right" arrow>
      <Box
        role="button"
        tabIndex={0}
        onClick={() => navigate(path)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(path)}
        onMouseEnter={() => { setHovered(true); playerRef.current?.playFromBeginning() }}
        onMouseLeave={() => setHovered(false)}
        sx={navItemSx(active)}
      >
        <Box sx={{
          width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          opacity: (active || hovered) ? 1 : 0.3,
          transition: 'opacity 160ms',
        }}>
          <Player
            ref={playerRef}
            icon={icon}
            size={34}
            colors="primary:#ffffff,secondary:#ff97bc"
          />
        </Box>
        <Typography
          variant="body2"
          fontWeight={active ? 600 : 400}
          sx={{ whiteSpace: 'nowrap', color: 'inherit', opacity: open ? 1 : 0, transition: 'opacity 180ms' }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

async function handleLogout(navigate) {
  try {
    await api.post('/auth/logout')
  } finally {
    sessionStorage.removeItem('accessToken')
    navigate('/login', { replace: true })
  }
}

export default function Sidebar() {
  const [open, setOpen]               = useState(false)
  const [logoutHovered, setLogoutHovered] = useState(false)
  const navigate                      = useNavigate()
  const logoutRef                     = useRef(null)

  return (
    <Box
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      sx={{
        position: 'fixed',
        top: MARGIN, left: MARGIN, bottom: MARGIN,
        width: open ? W_OPEN : W_CLOSED,
        borderRadius: 3,
        background: '#0f172a',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
        overflow: 'hidden',
        transition: 'width 240ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Logo ── */}
      <Box
        onClick={() => navigate(ROUTES.HOME)}
        sx={{
          px: 1.5, py: 2, display: 'flex', alignItems: 'center', gap: 1.5,
          minHeight: 72, flexShrink: 0, cursor: 'pointer',
          borderRadius: 2, mx: 0.5,
          transition: 'background 160ms',
          '&:hover': { background: 'rgba(255,255,255,0.06)' },
          '&:active': { background: 'rgba(255,255,255,0.1)', transform: 'scale(0.97)' },
        }}
      >
        <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Box
            component="img"
            src={corazon}
            alt="SEDIF"
            sx={{ width: 34, height: 34, objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(219,39,119,0.5))' }}
          />
        </Box>
        <Box sx={{ overflow: 'hidden', opacity: open ? 1 : 0, transition: 'opacity 180ms' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
            SEDIF
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
            Inventarios
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mx: 1.5, height: '1px', background: 'rgba(255,255,255,0.07)', mb: 1, flexShrink: 0 }} />

      {/* ── Nav ── */}
      <Box sx={{ flex: 1, py: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} {...item} open={open} />
        ))}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ flexShrink: 0 }}>
        <Box sx={{ mx: 1.5, height: '1px', background: 'rgba(255,255,255,0.07)', mb: 1 }} />

        <Tooltip title={open ? '' : 'Cerrar sesión'} placement="right" arrow>
          <Box
            role="button"
            tabIndex={0}
            onClick={() => handleLogout(navigate)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogout(navigate)}
            onMouseEnter={() => { setLogoutHovered(true); logoutRef.current?.playFromBeginning() }}
            onMouseLeave={() => setLogoutHovered(false)}
            sx={{
              ...navItemSx(false),
              mx: 1, mb: 1,
              color: 'rgba(255,255,255,0.4)',
              '&:hover': { background: 'rgba(220,38,38,0.12)', color: '#f87171' },
              '&:active': { background: 'rgba(220,38,38,0.2)', transform: 'scale(0.97)' },
            }}
          >
            <Box sx={{
              width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              opacity: logoutHovered ? 1 : 0.3,
              transition: 'opacity 160ms',
            }}>
              <Player
                ref={logoutRef}
                icon={icLogout}
                size={34}
                colors="primary:#f87171,secondary:#ef4444"
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'nowrap', color: 'inherit', opacity: open ? 1 : 0, transition: 'opacity 180ms' }}
            >
              Cerrar sesión
            </Typography>
          </Box>
        </Tooltip>

        <Box sx={{ px: 1.5, pb: 1.5, opacity: open ? 1 : 0, transition: 'opacity 180ms' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap', display: 'block' }}>
            SEDIF Puebla © 2026
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap' }}>
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
