'use client'

// React Imports
import { createContext } from 'react'
import type { HTMLProps } from 'react'

type HorizontalSubMenuContextProps = {
  getItemProps: (userProps?: HTMLProps<HTMLElement>) => Record<string, unknown>
}

export const HorizontalSubMenuContext = createContext<HorizontalSubMenuContextProps>({ getItemProps: () => ({}) })
