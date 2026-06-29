import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from './app/theme/theme'
import LoginPage    from './features/auth/pages/LoginPage'
import HomePage     from './pages/HomePage'
import EmpleadosPage from './features/empleados/pages/EmpleadosPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home"      element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/empleados" element={<ProtectedRoute><EmpleadosPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
