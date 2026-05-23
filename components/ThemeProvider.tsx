'use client'

import { createContext, useContext, useEffect } from 'react'

// Dark-only mode — light theme has been removed. The provider keeps the
// same shape so existing `useTheme()` consumers continue to work without
// changes (they just always see theme === 'dark').
type Theme = 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Force dark on the html element + clear any stale localStorage value
  // from when the toggle existed.
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    try { localStorage.removeItem('theme') } catch { /* SSR / private mode */ }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
