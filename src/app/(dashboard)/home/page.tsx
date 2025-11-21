'use client'

import { useSession } from 'next-auth/react'

import { useAbility } from '@/hooks/casl/useAbility'

export default function Page() {
  const { data: session } = useSession()
  const ability = useAbility()

  console.log(ability.rules)
  console.log(ability.can('delete', 'User'))

  return <h1>Home page! {session?.user?.name}</h1>
}
