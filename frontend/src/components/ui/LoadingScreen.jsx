import { Box, Typography, keyframes } from '@mui/material'
import corazon from '@/assets/logos/corazon.png'

const heartbeat = keyframes`
  0%   { transform: scale(1); }
  14%  { transform: scale(1.25); }
  28%  { transform: scale(1); }
  42%  { transform: scale(1.18); }
  60%  { transform: scale(1); }
  100% { transform: scale(1); }
`

const fadeText = keyframes`
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 1; }
`

export default function LoadingScreen() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Box
        component="img"
        src={corazon}
        alt="cargando"
        sx={{
          width: 80,
          height: 80,
          objectFit: 'contain',
          animation: `${heartbeat} 1.2s ease-in-out infinite`,
        }}
      />
      <Typography
        variant="body1"
        fontWeight={500}
        sx={{
          color: '#db2777',
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontSize: '0.85rem',
          animation: `${fadeText} 1.5s ease-in-out infinite`,
        }}
      >
        Cargando...
      </Typography>
    </Box>
  )
}
