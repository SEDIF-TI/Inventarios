import { Box, Typography } from '@mui/material'

export default function HomePage() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Typography variant="h3" fontWeight={700}>
        Welcome
      </Typography>
    </Box>
  )
}
