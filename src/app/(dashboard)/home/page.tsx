'use client'

import { useSession } from 'next-auth/react'

export default function Page() {
  const { data: session } = useSession()

  return <h1>Home page! {session?.user?.name}</h1>
}
