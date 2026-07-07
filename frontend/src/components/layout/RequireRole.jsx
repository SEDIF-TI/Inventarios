import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'

export default function RequireRole({ roles, children }) {
  const { usuario } = useAuth()

  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to={ROUTES.RESGUARDOS} replace />
  }

  return children
}
