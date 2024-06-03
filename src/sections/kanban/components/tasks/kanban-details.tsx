import { useState } from 'react'

import { styled, alpha } from '@mui/material/styles'

import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'

import Tooltip from '@mui/material/Tooltip'

import IconButton from '@mui/material/IconButton'

import { useBoolean } from '@/hooks/use-boolean'

import { Iconify } from '@/components/iconify'

import KanbanInputName from '../kanban-input-name'
import KanbanContactsDialog from './kanban-contacts-dialog'

import { Autocomplete, ButtonBase, Chip, TextField, Typography, useTheme } from '@mui/material'

import { ConfirmDialog } from '@/components/custom-dialog'

import { enqueueSnackbar } from 'notistack'

import FormProvider from '@/components/hook-form/form-provider'

import { RHFDatePiker } from '@/components/hook-form/rhf-date-piker'

import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import { axios } from '@/utils/axios'
import { paper } from '@/theme/css'

import { endpoints } from '@/constants/config'

import { IKanbanTask, priorityValues } from '@/types/kanban'
import { mutate } from 'swr'
import { isEqual } from 'lodash'
import { RHFTextField } from '@/components/hook-form'

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: '100%',
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}))

type Props = {
  task: IKanbanTask
  openDetails: boolean
  onCloseDetails: VoidFunction
}

export default function KanbanDetails({ task, openDetails, onCloseDetails }: Props) {
  const theme = useTheme()
  const confirmArchive = useBoolean()
  const confirmDelete = useBoolean()
  const contacts = useBoolean()

  const [taskName, setTaskName] = useState(task.name)

  const assigneeSchema = Yup.object().shape({
    name: Yup.string().optional(),
  })

  const UpdateUserSchema = Yup.object().shape({
    id: Yup.string().required(),
    name: Yup.string().required(),
    archived: Yup.boolean().required(),
    priority: Yup.mixed().oneOf(priorityValues).required(),
    categories: Yup.array().of(Yup.string().required()).required(),
    description: Yup.string().required(),
    assignee: Yup.array().of(assigneeSchema).required(),
    dueDate: Yup.date().required(),
    reporter: Yup.string().required(),
  })

  const methods = useForm<IKanbanTask>({
    defaultValues: task,
    /* @ts-ignore */
    resolver: yupResolver(UpdateUserSchema),
  })

  const { handleSubmit, setValue, watch, control } = methods

  const assignee = useFieldArray({
    control,
    name: 'assignee',
  })

  const { priority } = watch()

  const values = watch()

  const isDirtyTask = isEqual(task, values)

  const categories = [
    ...new Set([
      'Gestão',
      'Informática',
      'Logística',
      'Financeiro',
      'Comercial',
      'Marketing',
      ...task?.categories,
    ]),
  ]

  const onUpdateTask = async (task: IKanbanTask) =>
    await axios
      .put(endpoints.tasks.updateTask(task.id), {
        ...task,
      })
      .then(() => {
        enqueueSnackbar('Tarefa atualizada com sucesso')

        mutate(endpoints.tasks.getAllTasks)
      })

  const onArchiveTask = async (taskId: string) =>
    await axios
      .put(endpoints.tasks.updateTask(taskId), {
        ...task,
        archived: true,
      })
      .then(() => {
        enqueueSnackbar('Tarefa arquivada com sucesso')

        onCloseDetails()
        mutate(endpoints.tasks.getAllTasks)
      })

  const onDeleteTask = async (taskId: string) =>
    await axios.delete(endpoints.tasks.updateTask(taskId)).then(() => {
      enqueueSnackbar('Tarefa deletada com sucesso')

      onCloseDetails()
      mutate(endpoints.tasks.getAllTasks)
    })

  const handleUpdate = async (task: IKanbanTask) =>
    await axios
      .put(endpoints.tasks.updateTask(task.id), {
        ...task,
      })
      .then(() => {
        enqueueSnackbar('Tarefa salva com sucesso')

        mutate(endpoints.tasks.getAllTasks)
      })

  const handleChangeTaskName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setTaskName(event.target.value)

  const handleUpdateTask = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (taskName) {
        onUpdateTask({
          ...task,
          name: taskName,
        })
      }
    }
  }

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit((data) => handleUpdate(data))}>
      <Drawer
        disablePortal
        open={openDetails}
        onClose={onCloseDetails}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: {
            width: {
              xs: 1,
              sm: 480,
            },
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} p={2}>
          <KanbanInputName
            fullWidth
            placeholder="Nome da tarefa"
            value={taskName}
            onChange={handleChangeTaskName}
            onKeyUp={handleUpdateTask}
          />

          <IconButton color="default" onClick={onCloseDetails}>
            <Iconify icon="eva:close-fill" size={2.5} />
          </IconButton>
        </Stack>

        <Stack direction="column" justifyContent="space-between" height="100%">
          <Stack
            spacing={3}
            sx={{
              pb: 5,
              px: 2.5,
            }}
          >
            <Stack direction="column" alignItems="left" spacing={1}>
              <StyledLabel>Criado por</StyledLabel>

              <Avatar alt={task.reporter} color="secondary">
                <Tooltip title={task.reporter}>
                  <Typography variant="button">
                    {task.reporter.slice(0, 3).toUpperCase()}
                  </Typography>
                </Tooltip>
              </Avatar>
            </Stack>

            <Stack direction="column" alignItems="left" spacing={1}>
              <StyledLabel>Responsáveis</StyledLabel>

              <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
                {values.assignee.map((task, index) => (
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
                    onClick={contacts.onTrue}
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                      border: (theme) => `dashed 1px ${theme.palette.divider}`,
                    }}
                  >
                    <Iconify icon="mingcute:add-line" />
                  </IconButton>
                </Tooltip>

                <KanbanContactsDialog
                  assignee={assignee}
                  assigneeValues={values.assignee}
                  open={contacts.value}
                  onClose={contacts.onFalse}
                />
              </Stack>
            </Stack>

            <RHFDatePiker<{ dueDate: Date }> label="Data de vencimento" name="dueDate" />

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

            <Controller
              name="categories"
              control={control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, onChange, ...restField }, fieldState: { error } }) => {
                return (
                  <Autocomplete
                    {...restField}
                    multiple
                    fullWidth
                    options={categories}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(error)}
                        label="Categorias"
                        placeholder="Digite para adicionar"
                      />
                    )}
                    onChange={(_, data) => onChange(data)}
                    filterOptions={(options, params) => {
                      const filtered = options.filter((option) =>
                        option.toLowerCase().includes(params.inputValue.toLowerCase())
                      )

                      if (params.inputValue !== '') {
                        filtered.push(params.inputValue)
                      }

                      return filtered
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          color="default"
                          {...getTagProps({ index })}
                          sx={{
                            borderColor: 'background.neutral',
                            backgroundColor: 'background.neutral',
                            borderRadius: 1,
                            alignItems: 'center',
                          }}
                          deleteIcon={<Iconify icon="eva:close-fill" />}
                          key={Math.random()}
                        />
                      ))
                    }
                  />
                )
              }}
            />

            <RHFTextField fullWidth multiline name="description" label="Descrição" />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              p: 2,
              bottom: 0,
              borderTop: 1,
              position: 'sticky',
              borderColor: 'divider',
              ...paper({ theme }),
            }}
          >
            <IconButton
              color="error"
              onClick={confirmDelete.onTrue}
              sx={{ backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08) }}
            >
              <Iconify icon="tabler:trash-filled" />
            </IconButton>

            <Button
              fullWidth
              onClick={confirmArchive.onTrue}
              startIcon={<Iconify icon="solar:archive-bold" />}
              variant="outlined"
              color="warning"
            >
              Arquivar
            </Button>

            <Button fullWidth disabled={isDirtyTask} type="submit" variant="contained">
              Salvar
            </Button>
          </Stack>
        </Stack>

        <ConfirmDialog
          open={confirmDelete.value}
          onClose={confirmDelete.onFalse}
          title="Deletar"
          disablePortal={false}
          content={<>Tem certeza que deseja deletar esta tarefa?</>}
          action={
            <Button variant="contained" color="error" onClick={() => onDeleteTask(task.id)}>
              Deletar
            </Button>
          }
        />

        <ConfirmDialog
          open={confirmArchive.value}
          onClose={confirmArchive.onFalse}
          title="Arquivar"
          disablePortal={false}
          content={<>Tem certeza que deseja arquivar esta tarefa?</>}
          action={
            <Button variant="contained" color="warning" onClick={() => onArchiveTask(task.id)}>
              Arquivar
            </Button>
          }
        />
      </Drawer>
    </FormProvider>
  )
}
