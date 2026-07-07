import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function leerUsuario() {
  const raw = sessionStorage.getItem('userInfo')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuarioState] = useState(leerUsuario)

  const setUsuario = (userInfo) => {
    if (userInfo) {
      sessionStorage.setItem('userInfo', JSON.stringify(userInfo))
    } else {
      sessionStorage.removeItem('userInfo')
    }
    setUsuarioState(userInfo)
  }

  const logout = () => {
    sessionStorage.removeItem('accessToken')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
