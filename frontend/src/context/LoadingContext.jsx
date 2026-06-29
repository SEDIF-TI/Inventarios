import { createContext, useContext, useState } from 'react'
import { Fade } from '@mui/material'
import LoadingScreen from '@/components/ui/LoadingScreen'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      {children}
      <Fade in={loading} timeout={{ enter: 150, exit: 350 }} unmountOnExit>
        <div>
          <LoadingScreen />
        </div>
      </Fade>
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
