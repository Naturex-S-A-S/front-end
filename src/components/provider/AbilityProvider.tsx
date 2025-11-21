'use client'

import { createContext } from 'react'

import { useSession } from 'next-auth/react'

import type { AppAbility } from '@/utils/ability'
import defineAbilityFor from '@/utils/ability'

export const AbilityContext = createContext<AppAbility | null>(null)

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data: session }: any = useSession()

  const ability = defineAbilityFor(session?.permissions)

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
}
