'use client'

import { mutate } from 'swr'

import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import {
  alpha,
  ButtonBase,
  ButtonGroup,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  styled,
  Tooltip,
} from '@mui/material'

import { enqueueSnackbar } from 'notistack'

import { Iconify } from '@/components/iconify'

import { endpoints, userCurrencyStorage } from '@/constants/config'

import { useFieldArray, useForm } from 'react-hook-form'

import { axios } from '@/utils/axios'

import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import { useBoolean } from '@/hooks/use-boolean'
import FormProvider, { RHFTextField } from '@/components/hook-form'

import { priorityValues, PriorityValues } from '@/shared/priorityValues'
import { Notification } from '@/types/Notification'
import { KanbanContactsDialog } from '@/components/kanban-contacts-dialog'

export const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: '100%',
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}))

type Props = {
  taskId: string
  openAddNotification: ReturnType<typeof useBoolean>
}

export const NotificationAdd = ({ taskId, openAddNotification }: Props) => {
  const viewContacts = useBoolean()

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

  const defaultValues = {
    taskId,
    title: '',
    description: '',
    view: false,
    priority: priorityValues[0],
    reporter: userCurrencyStorage,
  }

  const methods = useForm<Omit<Notification, '_id'>>({
    defaultValues,
    resolver: yupResolver(CreateNotificationSchema),
  })

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { isDirty },
  } = methods

  const assignee = useFieldArray({
    control,
    name: 'assignee',
  })

  const values = watch()

  const [priority] = watch(['priority'])

  const handleClear = () => reset(defaultValues)

  const handleCreateUser = async (data: Omit<Notification, '_id'>) => {
    await axios.post(endpoints.notifications.createNotification, data).then(() => {
      enqueueSnackbar('Notificão criada com sucesso!', {
        variant: 'success',
        preventDuplicate: true,
      })

      mutate(endpoints.notifications.getAllNotifications)
      openAddNotification.onFalse()
    })
  }

  return (
    <Dialog
      fullWidth
      disablePortal
      maxWidth="sm"
      open={openAddNotification.value}
      onClose={openAddNotification.onFalse}
    >
      <DialogTitle sx={{ pb: 2 }}>Adicionar Notificação</DialogTitle>

      <DialogContent>
        <FormProvider methods={methods} onSubmit={handleSubmit(handleCreateUser)}>
          <Paper elevation={1} sx={{ py: 1 }}>
            <Stack direction="column" spacing={2}>
              <Stack direction="column" alignItems="left" spacing={1}>
                <StyledLabel>Responsáveis</StyledLabel>

                <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
                  {values?.assignee?.map((task, index) => (
                    <Chip
                      key={index}
                      label={task.name}
                      variant="soft"
                      onDelete={() => assignee.remove(index)}
                      sx={{
                        color: 'text.primary',
                        borderRadius: 1,
                      }}
                    />
                  ))}

                  <Tooltip title="Adicionar responsável" arrow>
                    <IconButton
                      onClick={viewContacts.onTrue}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                        border: (theme) => `dashed 1px ${theme.palette.divider}`,
                      }}
                    >
                      <Iconify icon="mingcute:add-line" />
                    </IconButton>
                  </Tooltip>

                  <KanbanContactsDialog
                    onRemove={assignee.remove}
                    onAppend={assignee.append}
                    assigneeValues={values.assignee}
                    open={viewContacts.value}
                    onClose={viewContacts.onFalse}
                  />
                </Stack>
              </Stack>

              <Stack direction="column" alignItems="left" spacing={1}>
                <StyledLabel>Prioridade</StyledLabel>

                <Stack direction="row" flexWrap="wrap" spacing={1}>
                  {priorityValues.map((option) => (
                    <ButtonBase
                      key={option}
                      onClick={() => setValue('priority', option)}
                      sx={{
                        p: 1,
                        fontSize: 12,
                        borderRadius: 1,
                        lineHeight: '20px',
                        textTransform: 'capitalize',
                        fontWeight: 'fontWeightBold',
                        boxShadow: (theme) =>
                          `inset 0 0 0 1px ${alpha(theme.palette.grey[500], 0.24)}`,
                        ...(option === priority && {
                          boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.text.primary}`,
                        }),
                      }}
                    >
                      <Iconify
                        icon="line-md:circle-twotone"
                        sx={{
                          mr: 0.5,
                          ...(option === 'baixa' && {
                            color: 'info.main',
                          }),
                          ...(option === 'média' && {
                            color: 'warning.main',
                          }),
                          ...(option === 'alta' && {
                            color: 'error.main',
                          }),
                        }}
                      />

                      {option}
                    </ButtonBase>
                  ))}
                </Stack>
              </Stack>

              <RHFTextField name="title" label="Título" />

              <RHFTextField fullWidth multiline name="description" label="Descrição" />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <ButtonGroup variant="contained" color="inherit">
                  <Button
                    variant="soft"
                    onClick={handleClear}
                    startIcon={<Iconify icon="ant-design:delete-outlined" />}
                  >
                    Limpar
                  </Button>

                  <Button
                    variant="soft"
                    onClick={openAddNotification.onFalse}
                    startIcon={<Iconify icon="ant-design:close-outlined" />}
                  >
                    Cancelar
                  </Button>
                </ButtonGroup>

                <Button
                  type="submit"
                  variant="contained"
                  color="inherit"
                  disabled={!isDirty}
                  startIcon={<Iconify icon="ant-design:plus-outlined" />}
                >
                  Cadastrar
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
