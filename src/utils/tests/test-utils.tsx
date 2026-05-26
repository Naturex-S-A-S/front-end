import type { ReactElement, ReactNode } from 'react'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Toaster } from 'react-hot-toast'
import {
  render as testingLibraryRender,
  screen,
  waitFor,
  type RenderOptions,
} from '@testing-library/react'

function AllProviders({ children }: { children: ReactNode }) {
  const theme = createTheme()

  return (
    <ThemeProvider theme={theme}>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return testingLibraryRender(ui, { wrapper: AllProviders, ...options })
}

export { render, screen, waitFor }
