import { useMutation, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useAbility } from '@/hooks/casl/useAbility'
import CustomCard from '@/@core/components/mui/Card'
import { postCategory } from '@/api/general-parameters'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import { categorySchema } from '@/utils/schemas/generalParameters'
import Form from './form'
import { alertMessageErrors } from '@/utils/messages'

const Create = () => {
  const queryClient = useQueryClient()
  const ability = useAbility()

  const methods = useForm({
    defaultValues: {
      name: undefined,
      type: undefined
    },
    resolver: yupResolver(categorySchema)
  })

  const { handleSubmit, reset } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: postCategory,
    onSuccess: () => {
      toast.success('Categoria creada con éxito')
      queryClient.invalidateQueries({ queryKey: ['getCategories'] })
      reset()
    },
    onError: (error: any) => {
      alertMessageErrors(error, 'Error al crear la categoria')
    }
  })

  if (!ability.can(ABILITY_ACTIONS.CREATE as any, ABILITY_SUBJECT.GENERAL_PARAMETERS, ABILITY_FIELDS.CATEGORIES))
    return null

  const onSubmit = (data: any) => {
    mutate({
      name: data.name,
      idType: data.type.id
    })
  }

  return (
    <CustomCard title='Crear Categoria'>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form isPending={isPending} />
        </form>
      </FormProvider>
    </CustomCard>
  )
}

export default Create
