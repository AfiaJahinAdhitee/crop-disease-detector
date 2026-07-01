'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // The inline script in layout.js already set data-theme on <html>.
    // Read it back so React state matches without re-deriving.
    const applied = document.documentElement.getAttribute('data-theme')
    if (applied === 'light' || applied === 'dark') {
      setTheme(applied)
    }

    // Keep state in sync if the OS preference changes while the tab is open
    // and the user hasn't made an explicit choice.
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    function onOsChange(e) {
      if (!localStorage.getItem('leaflineTheme')) {
        apply(e.matches ? 'light' : 'dark', false)
      }
    }
    mq.addEventListener('change', onOsChange)
    return () => mq.removeEventListener('change', onOsChange)
  }, [])

  function apply(next, persist = true) {
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    if (persist) localStorage.setItem('leaflineTheme', next)
    else localStorage.removeItem('leaflineTheme')
  }

  function toggle() {
    apply(theme === 'dark' ? 'light' : 'dark', true)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
