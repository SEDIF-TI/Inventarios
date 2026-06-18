import { Container, Typography, Box } from '@mui/material'
import InventoryIcon from '@mui/icons-material/Inventory'

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <InventoryIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant="h3" fontWeight={700}>
          Sistema de Inventarios
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Bienvenido al sistema de gestión de inventarios
        </Typography>
      </Box>
    </Container>
  )
}
