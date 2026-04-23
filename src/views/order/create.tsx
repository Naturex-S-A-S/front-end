'use client'

import { useRouter } from 'next/navigation'

import CreateButton from '@/components/layout/shared/CreateButton'
import { useAbility } from '@/hooks/casl/useAbility'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'

const Create = () => {
  const router = useRouter()
  const ability = useAbility()

  const canCreateFormulation = ability.can(
    ABILITY_ACTIONS.CREATE as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.ORDERS
  )

  const handleCreate = () => {
    router.push('/produccion/ordenes/crear')
  }

  if (!canCreateFormulation) return null

  return <CreateButton onClick={handleCreate} />
}

export default Create
