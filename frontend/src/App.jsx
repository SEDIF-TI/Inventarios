import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { CssBaseline, ThemeProvider, Box, GlobalStyles } from '@mui/material'
import { Notifier } from './lib/notify'
import { AuthProvider } from './context/AuthContext'
import theme from './app/theme/theme'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import RequireRole from './components/layout/RequireRole'
import LoginPage     from './features/auth/pages/LoginPage'
import HomePage      from './pages/HomePage'
import EmpleadosPage from './features/empleados/pages/EmpleadosPage'
import AreasPage        from './features/areas/pages/AreasPage'
import ResguardosPage   from './features/resguardos/pages/ResguardosPage'
import HistorialPage    from './features/historial/pages/HistorialPage'
import UsuariosPage     from './features/usuarios/pages/UsuariosPage'

const SIDEBAR_CLOSED = 74
const MARGIN         = 12

function ProtectedLayout() {
  const token = sessionStorage.getItem('accessToken')
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
          minHeight: 'calc(100vh - 60px)',
          position: 'relative',
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        'html, body': { overflowX: 'hidden' },
      }} />
      <Notifier />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/home"       element={<HomePage />} />
              <Route path="/resguardos" element={<ResguardosPage />} />
              <Route path="/historial"  element={<HistorialPage />} />
              <Route path="/areas" element={
                <RequireRole roles={['SUPERADMIN', 'ADMIN']}><AreasPage /></RequireRole>
              } />
              <Route path="/empleados" element={
                <RequireRole roles={['SUPERADMIN', 'ADMIN']}><EmpleadosPage /></RequireRole>
              } />
              <Route path="/usuarios" element={
                <RequireRole roles={['SUPERADMIN', 'ADMIN']}><UsuariosPage /></RequireRole>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
