import { Box } from '@mui/material'
import Sidebar from './Sidebar'

const SIDEBAR_CLOSED = 74
const MARGIN         = 12

export default function AppLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${SIDEBAR_CLOSED + MARGIN * 2}px`,
          p: 3,
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
