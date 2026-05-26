// React Imports
import { useContext } from 'react'

// Type Imports
import type { HorizontalMenuContextProps } from '../components/horizontal-menu/horizontalMenuContext'

// Context Imports
import { HorizontalMenuContext } from '../components/horizontal-menu/horizontalMenuContext'

const useHorizontalMenu = (): HorizontalMenuContextProps => {
  // Hooks
  const context = useContext(HorizontalMenuContext)

  if (context === undefined) {
    //TODO: set better error message
    throw new Error('Menu Component is required!')
  }

  return context
}

export default useHorizontalMenu
