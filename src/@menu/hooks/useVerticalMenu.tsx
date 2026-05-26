// React Imports
import { useContext } from 'react'

// Type Imports
import type { VerticalMenuContextProps } from '../components/vertical-menu/verticalMenuContext'

// Context Imports
import { VerticalMenuContext } from '../components/vertical-menu/verticalMenuContext'

const useVerticalMenu = (): VerticalMenuContextProps => {
  // Hooks
  const context = useContext(VerticalMenuContext)

  if (context === undefined) {
    //TODO: set better error message
    throw new Error('Menu Component is required!')
  }

  return context
}

export default useVerticalMenu
