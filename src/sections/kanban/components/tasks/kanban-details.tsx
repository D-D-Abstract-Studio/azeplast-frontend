import { useState, useCallback } from 'react'

import { styled, alpha } from '@mui/material/styles'

import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'

import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'

import { useBoolean } from '@/hooks/use-boolean'

import { Iconify } from '@/components/iconify'

import KanbanInputName from '../kanban-input-name'
import KanbanContactsDialog from './kanban-contacts-dialog'
import KanbanDetailsPriority from './kanban-details-priority'

import { COLORS } from '@/constants/config'
import { Autocomplete, Box, Chip, Typography, useTheme } from '@mui/material'

import { ConfirmDialog } from '@/components/custom-dialog'
import { DesktopDatePicker } from '@mui/x-date-pickers'
import { enqueueSnackbar } from 'notistack'

import { IKanban, IKanbanColumn, IKanbanTask, priorityValues } from '@/types/kanban'
import { axios } from '@/utils/axios'
import { endpoints } from '@/constants/config'
import { paper } from '@/theme/css'

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

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import FormProvider from '@/components/hook-form/form-provider'
import { RHFTextField } from '@/components/hook-form'

export default function KanbanDetails({ task, openDetails, onCloseDetails }: Props) {
  const theme = useTheme()
  const confirm = useBoolean()
  const contacts = useBoolean()

  const [priority, setPriority] = useState(task.priority)
  const [taskName, setTaskName] = useState(task.name)
  const [taskDescription, setTaskDescription] = useState(task.description)

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

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods

  const onUpdateTask = async (task: IKanbanTask) =>
    await axios
      .put(endpoints.tasks.updateTask(task.id), {
        ...task,
      })
      .then(() => {
        enqueueSnackbar('Tarefa atualizada com sucesso')

        onCloseDetails()
      })

  const onDeleteTask = async (taskId: string) =>
    await axios
      .put(endpoints.tasks.updateTask(taskId), {
        ...task,
        archived: true,
      })
      .then(() => {
        enqueueSnackbar('Tarefa arquivada com sucesso')

        onCloseDetails()
      })

  const handleUpdate = async (task: IKanbanTask) =>
    await axios
      .post(endpoints.tasks.updateTask(task.id), {
        ...task,
      })
      .then(() => {
        enqueueSnackbar('Tarefa arquivada com sucesso')

        onCloseDetails()
      })

  const handleChangeTaskName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value)
  }, [])

  const handleUpdateTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask({
              ...task,
              name: taskName,
            })
          }
        }
      } catch (error) {
        console.error(error)
      }
    },
    [onUpdateTask, task, taskName]
  )

  const handleChangeTaskDescription = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskDescription(event.target.value)
  }, [])

  const handleChangePriority = useCallback((newValue: IKanbanTask['priority']) => {
    setPriority(newValue)
  }, [])

  return (
    <Drawer
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
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => handleUpdate(data))}>
        <Stack direction="column" justifyContent="space-between" sx={{ height: '100%' }}>
          <Stack
            spacing={3}
            sx={{
              pt: 3,
              pb: 5,
              px: 2.5,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
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

            <Stack direction="column" alignItems="left" spacing={1}>
              <StyledLabel>Criado por</StyledLabel>

              <Avatar alt={task.reporter} color="secondary">
                <Typography variant="button">{task.reporter.slice(0, 3).toUpperCase()}</Typography>
              </Avatar>
            </Stack>

            <Stack direction="column" alignItems="left" spacing={1}>
              <StyledLabel>Responsáveis</StyledLabel>

              <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
                {task.assignee.map((user, index) => (
                  <Avatar key={index} alt={user.name} color={COLORS[index]}>
                    <Typography variant="button">
                      {task.reporter.slice(0, 3).toUpperCase()}
                    </Typography>
                  </Avatar>
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
                  assignee={task.assignee}
                  open={contacts.value}
                  onClose={contacts.onFalse}
                />
              </Stack>
            </Stack>

            <RHFTextField fullWidth label="Data de vencimento" name="dueDate" type="date" />

            <Stack direction="column" alignItems="left" spacing={1}>
              <StyledLabel>Prioridade</StyledLabel>

              <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
            </Stack>
            <Autocomplete
              multiple
              fullWidth
              options={[
                'Gestão',
                'Informática',
                'Logística',
                'Financeiro',
                'Comercial',
                'Marketing',
                ...task.categories,
              ]}
              defaultValue={task.categories}
              renderInput={(params) => (
                <TextField {...params} label="Categorias" placeholder="Digite para adicionar" />
              )}
              onChange={(_, newValue) => {
                console.log(newValue)
              }}
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
            <Stack direction="column" alignItems="left" spacing={1}>
              <StyledLabel>Descrição </StyledLabel>

              <TextField
                fullWidth
                multiline
                value={taskDescription}
                onChange={handleChangeTaskDescription}
                InputProps={{
                  sx: { typography: 'body2' },
                }}
              />
            </Stack>
          </Stack>

          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              position: 'sticky',
              bottom: 0,
              zIndex: 999,
              ...paper({ theme }),
            }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                onClick={confirm.onTrue}
                startIcon={<Iconify icon="solar:archive-bold" />}
                variant="outlined"
                color="warning"
              >
                Arquivar
              </Button>

              <Button fullWidth disabled={!taskName} type="submit" variant="contained">
                Salvar
              </Button>
            </Stack>
          </Box>
        </Stack>
      </FormProvider>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Arquivar"
        disablePortal={false}
        content={<>Tem certeza que deseja deletar esta tarefa?</>}
        action={
          <Button variant="contained" color="error" onClick={() => onDeleteTask(task.id)}>
            Arquivar
          </Button>
        }
      />
    </Drawer>
  )
}
