'use client'

import { useCallback, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Box, Typography } from '@mui/material'

import { FormProvider, useForm } from 'react-hook-form'

import { yupResolver } from '@hookform/resolvers/yup'

import { useMutation } from '@tanstack/react-query'

import toast from 'react-hot-toast'

import Swal from 'sweetalert2'

import moment from 'moment'

import { useAbility } from '@/hooks/casl/useAbility'
import Form from './form'
import { ABILITY_ACTIONS, ABILITY_FIELDS, ABILITY_SUBJECT } from '@/utils/constant'
import { alertMessageErrors } from '@/utils/messages'
import { orderSchema } from '@/utils/schemas/order'
import { orderDefaultValues } from '@/utils/defaultValues/order'
import { getOrderCalculate, postOrder } from '@/api/order'

const Create = () => {
  const [isChanged, setIsChanged] = useState(false)

  const router = useRouter()
  const ability = useAbility()

  console.log(ability.rules)

  const canCreateFormulation = ability.can(
    ABILITY_ACTIONS.CREATE as any,
    ABILITY_SUBJECT.PRODUCTION,
    ABILITY_FIELDS.ORDERS
  )

  const methods = useForm({
    defaultValues: orderDefaultValues,
    resolver: yupResolver(orderSchema) as any
  })

  const { handleSubmit, setValue, getValues }: any = methods

  const { isPending, mutateAsync: createOrder } = useMutation({
    mutationFn: postOrder,
    onSuccess: response => {
      router.replace(`/produccion/ordenes/${response.orderId}`)
    },
    onError: (error: any) => {
      alertMessageErrors(error?.response?.data?.message, 'Error al crear la orden')
    }
  })

  const { mutateAsync: mutateOrderCalculate, isPending: isPendingOrderCalculate } = useMutation({
    mutationFn: getOrderCalculate,
    onSuccess: (res: any) => {
      setValue('calculatedData', res)
      toast.success('Cálculo realizado con éxito')
    },
    onError: () => {
      toast.error('Error al realizar el cálculo')
    }
  })

  const orderCalculate = useCallback(() => {
    const { product, presentations } = getValues()

    mutateOrderCalculate({
      baseProductId: product.id,
      productIds: presentations.map((p: any) => p.id).join(','),
      quantities: presentations.map((p: any) => p.quantityG).join(',')
    })
    setIsChanged(false)
  }, [mutateOrderCalculate, getValues])

  const onSubmit = (values: any) => {
    if (values?.calculatedData?.totalQuantityMissing !== 0) {
      Swal.fire({
        title: `No hay material suficiente. ¿Desea calcular con la cantidad disponible?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#009541',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          const presentations = values.presentations

          for (const product of values.calculatedData.possibleProducts) {
            const presentationIndex = presentations.findIndex((p: any) => p.id === product.id)

            if (presentationIndex !== -1) {
              setValue(`presentations.${presentationIndex}.quantityG`, product.units)
              orderCalculate()
            }
          }
        }
      })
    } else {
      const quantityExpected = values.presentations.reduce(
        (acc: number, presentation: any) => acc + presentation.quantityG,
        0
      )

      const req = {
        quantityExpected,
        batch: values.batch,
        date_expiration: moment(values.expirationDate1).format('YYYY-MM-DD'),
        products: values.presentations.map((product: any) => ({
          id: product.id,
          quantity: product.quantityG,
          base: product.id === values.product.id
        }))
      }

      createOrder(req)
    }
  }

  if (!canCreateFormulation) return null

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4 }}>
        Generar nueva orden
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
