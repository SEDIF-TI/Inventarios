import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { CssBaseline, ThemeProvider, Box, GlobalStyles } from '@mui/material'
import { Toaster } from 'sileo'
import { LoadingProvider } from './context/LoadingContext'
import theme from './app/theme/theme'
import Sidebar from './components/layout/Sidebar'
import { Fade } from '@mui/material'
import LoadingScreen from './components/ui/LoadingScreen'
import { useLoading } from './context/LoadingContext'
import LoginPage     from './features/auth/pages/LoginPage'
import HomePage      from './pages/HomePage'
import EmpleadosPage from './features/empleados/pages/EmpleadosPage'
import AreasPage        from './features/areas/pages/AreasPage'
import ResguardosPage   from './features/resguardos/pages/ResguardosPage'
import HistorialPage    from './features/historial/pages/HistorialPage'

const SIDEBAR_CLOSED = 74
const MARGIN         = 12

function ProtectedLayout() {
  const token = sessionStorage.getItem('accessToken')
  const { loading } = useLoading()
  if (!token) return <Navigate to="/login" replace />
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${SIDEBAR_CLOSED + MARGIN * 2}px`,
          p: 3,
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Fade in={loading} timeout={{ enter: 150, exit: 350 }} unmountOnExit>
          <div><LoadingScreen /></div>
        </Fade>
        <Outlet />
      </Box>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        '[data-sileo-viewport]': { zIndex: '1400 !important' },
        'html, body': { overflowX: 'hidden' },
      }} />
      <Toaster position="top-center" theme="light" duration={4000} />
      <LoadingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/home"      element={<HomePage />} />
              <Route path="/areas"       element={<AreasPage />} />
              <Route path="/resguardos" element={<ResguardosPage />} />
              <Route path="/empleados" element={<EmpleadosPage />} />
              <Route path="/historial" element={<HistorialPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
    </ThemeProvider>
  )
}

export default App
