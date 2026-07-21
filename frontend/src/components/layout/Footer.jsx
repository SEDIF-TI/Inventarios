import { Box, Stack } from '@mui/material'

import familiasDif  from '@/assets/logos/familias-dif.png'
import pensarGrande from '@/assets/logos/pensargrande.png'

const SIDEBAR_CLOSED = 74
const MARGIN         = 12

export const FOOTER_HEIGHT = 60

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: `${SIDEBAR_CLOSED + MARGIN * 2}px`,
        height: `${FOOTER_HEIGHT}px`,
        zIndex: 1100,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -2px 12px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 3, sm: 5 }}
        alignItems="center"
        justifyContent="center"
      >
        <Box
          component="img"
          src={familiasDif}
          alt="Familias DIF"
          sx={{ height: { xs: 28, sm: 36 }, width: 'auto', objectFit: 'contain', opacity: 0.9 }}
        />
        <Box
          component="img"
          src={pensarGrande}
          alt="Pensar en Grande"
          sx={{ height: { xs: 24, sm: 32 }, width: 'auto', objectFit: 'contain', opacity: 0.9 }}
        />
      </Stack>
    </Box>
  )
}
