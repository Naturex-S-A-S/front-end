'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Box, Typography } from '@mui/material'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import moment from 'moment'

import { useAbility } from '@/hooks/casl/useAbility'
import Form from './form'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import { alertMessageErrors } from '@/utils/messages'
import { orderSchema } from '@/utils/schemas/order'
import { orderDefaultValues } from '@/utils/defaultValues/order'
import { getOrderSupplyCalculate, postOrderSupply } from '@/api/order'

const Create = () => {
  const [isChanged, setIsChanged] = useState(false)

  const router = useRouter()
  const ability = useAbility()

  const canCreateProvisioning = ability.can(
    ABILITY_ACTIONS.CREATE as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.PROVISIONING
  )

  const methods = useForm({
    defaultValues: orderDefaultValues,
    resolver: yupResolver(orderSchema) as any
  })

  const { handleSubmit, setValue, getValues }: any = methods

  const { isPending, mutateAsync: createOrder } = useMutation({
    mutationFn: postOrderSupply,
    onSuccess: response => {
      router.replace(`/produccion/aprovisionamiento/${response.id}`)
    },
    onError: (error: any) => {
      alertMessageErrors(error?.response?.data?.message, 'Error al crear la orden')
    }
  })

  const { mutateAsync: mutateOrderSupplyCalculate, isPending: isPendingOrderCalculate } = useMutation({
    mutationFn: getOrderSupplyCalculate,
    onSuccess: (res: any) => {
      setValue('calculatedData', res)
      toast.success('Cálculo realizado con éxito')
    },
    onError: () => {
      toast.error('Error al realizar el cálculo')
    }
  })

  const orderCalculate = useCallback(() => {
    const { presentations } = getValues()

    mutateOrderSupplyCalculate({
      productIds: presentations.map((p: any) => p.id).join(','),
      quantities: presentations.map((p: any) => p.quantityG).join(',')
    })
    setIsChanged(false)
  }, [mutateOrderSupplyCalculate, getValues])

  const onSubmit = (values: any) => {
    const quantityExpected = values.presentations.reduce(
      (acc: number, presentation: any) => acc + presentation.quantityG,
      0
    )

    const req = {
      quantityExpected,
      batch: values.batch,
      date_expiration: moment(values.expirationDate1).format('YYYY-MM-DD'),
      products: values.presentations.map((product: any, index: number) => ({
        id: product.id,
        quantity: product.quantityG,
        base: index === 0
      }))
    }

    createOrder(req)
  }

  if (!canCreateProvisioning) return null

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4 }}>
        Generar nuevo aprovisionamiento
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form
            isPending={isPending}
            isChanged={isChanged}
            setIsChanged={setIsChanged}
            orderCalculate={orderCalculate}
            isPendingOrderCalculate={isPendingOrderCalculate}
          />
        </form>
      </FormProvider>
    </Box>
  )
}

export default Create
