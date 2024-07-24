'use client'

import { mutate } from 'swr'

import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Button from '@mui/material/Button'
import Drawer, { drawerClasses } from '@mui/material/Drawer'
import { Alert, alpha, Box, Dialog, MenuItem, Paper } from '@mui/material'

import { enqueueSnackbar } from 'notistack'

import { paper } from '@/theme/css'

import { Iconify } from '@/components/iconify'

import { useRequest } from '@/hooks/use-request'

import { endpoints, userCurrencyStorage, userNamesStorage } from '@/constants/config'

import { useForm } from 'react-hook-form'

import { axios } from '@/utils/axios'

import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import { useBoolean } from '@/hooks/use-boolean'
import FormProvider, { RHFTextField } from '@/components/hook-form'

import { priorityValues, PriorityValues } from '@/shared/priorityValues'
import { Notification } from '@/types/Notification'

type Props = {
  taskId: string
  openAddNotification: ReturnType<typeof useBoolean>
}

export const NotificationAdd = ({ taskId, openAddNotification }: Props) => {
  const CreateNotificationSchema = Yup.object().shape({
    title: Yup.string().required(),
    description: Yup.string().required(),
    reporter: Yup.string().required(),
    view: Yup.boolean().required(),
    taskId: Yup.string().required(),
    assignee: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required(),
      })
    ),
    priority: Yup.mixed<PriorityValues>().oneOf(priorityValues).required(),
  })

  const methods = useForm<Omit<Notification, '_id'>>({
    defaultValues: {
      taskId,
      view: false,
      priority: priorityValues[0],
      reporter: userCurrencyStorage,
    },
    resolver: yupResolver(CreateNotificationSchema),
  })

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods

  const handleCreateUser = async (userData: Omit<Notification, '_id'>) => {
    await axios.post(endpoints.user.createUser, userData).then(() => {
      enqueueSnackbar('Notificaão criado com sucesso!', {
        variant: 'success',
        preventDuplicate: true,
      })

      mutate(endpoints.user.getAllUsers)
    })
  }

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      title="Adicionar Notificação"
      disablePortal={false}
      open={openAddNotification.value}
      onClose={openAddNotification.onFalse}
    >
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit((data) => handleCreateUser(data))}>
          <Stack direction="column" spacing={1}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <RHFTextField name="name" label="Nome" />
            </Stack>

            <Stack justifyContent="flex-end" spacing={1}>
              <Button type="submit" variant="contained" color="inherit" disabled={!isDirty}>
                Criar
              </Button>
            </Stack>
          </Stack>
        </FormProvider>
      </Paper>
    </Dialog>
  )
}
