import { useContext } from "react"

import { AbilityContext } from "@/components/provider/AbilityProvider"

export function useAbility() {
  const ability = useContext(AbilityContext)

  if (!ability) throw new Error('AbilityProvider is missing')

  return ability
}
