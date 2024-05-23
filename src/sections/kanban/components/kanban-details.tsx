import { useState, useCallback } from 'react'

import { styled, alpha } from '@mui/material/styles'

import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'

import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'

import { IKanbanTask } from '@/types/kanban'

import { useBoolean } from '@/hooks/use-boolean'

import Iconify from '@/components/iconify'
import Scrollbar from '@/components/scrollbar'
import CustomDateRangePicker, { useDateRangePicker } from '@/components/custom-date-range-picker'
import KanbanInputName from './kanban-input-name'
import KanbanContactsDialog from './kanban-contacts-dialog'
import KanbanDetailsPriority from './kanban-details-priority'

import { COLORS } from '@/constants/config'
import { Autocomplete, Box, Chip, Typography } from '@mui/material'
import { ConfirmDialog } from '../../../components/custom-dialog'

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}))

type Props = {
  task: IKanbanTask
  openDetails: boolean
  onCloseDetails: VoidFunction
  onUpdateTask: (updateTask: IKanbanTask) => void
  onDeleteTask: VoidFunction
}

export default function KanbanDetails({
  task,
  openDetails,
  onCloseDetails,
  onUpdateTask,
  onDeleteTask,
}: Props) {
  const confirm = useBoolean()

  const [priority, setPriority] = useState(task.priority)

  const [taskName, setTaskName] = useState(task.name)

  const contacts = useBoolean()

  const [taskDescription, setTaskDescription] = useState(task.description)

  const rangePicker = useDateRangePicker(task.due[0], task.due[1])

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

  const handleChangePriority = useCallback((newValue: string) => {
    setPriority(newValue)
  }, [])

  const onDelete = useCallback(() => {
    onDeleteTask()
    onCloseDetails()
  }, [confirm, onDeleteTask])

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
      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
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
              placeholder="Task name"
              value={taskName}
              onChange={handleChangeTaskName}
              onKeyUp={handleUpdateTask}
            />

            <IconButton color="default" onClick={onCloseDetails}>
              <Iconify icon="eva:close-fill" size={2.5} />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center">
            <StyledLabel>Criado por</StyledLabel>

            <Avatar alt={task.reporter.name} color="secondary">
              {task.reporter.name[0].toUpperCase()}
            </Avatar>
          </Stack>

          <Stack direction="row">
            <StyledLabel sx={{ height: 40, lineHeight: '40px' }}>Responsáveis</StyledLabel>

            <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
              {task.assignee.map((user, index) => (
                <Avatar alt={user.name} key={index} color={COLORS[index]}>
                  {user.name[0].toUpperCase()}
                </Avatar>
              ))}

              <Tooltip title="Add assignee">
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

          <Stack direction="row" alignItems="center">
            <StyledLabel>Data de vencimento</StyledLabel>

            {rangePicker.selected ? (
              <Button size="small" onClick={rangePicker.onOpen}>
                {rangePicker.shortLabel}
              </Button>
            ) : (
              <Tooltip title="Add due date">
                <IconButton
                  onClick={rangePicker.onOpen}
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    border: (theme) => `dashed 1px ${theme.palette.divider}`,
                  }}
                >
                  <Iconify icon="mingcute:add-line" />
                </IconButton>
              </Tooltip>
            )}

            <CustomDateRangePicker
              variant="calendar"
              title="Choose due date"
              startDate={rangePicker.startDate}
              endDate={rangePicker.endDate}
              onChangeStartDate={rangePicker.onChangeStartDate}
              onChangeEndDate={rangePicker.onChangeEndDate}
              open={rangePicker.open}
              onClose={rangePicker.onClose}
              selected={rangePicker.selected}
              error={rangePicker.error}
            />
          </Stack>

          <Stack direction="row" alignItems="center">
            <StyledLabel>Prioridade</StyledLabel>

            <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
          </Stack>

          <Stack direction="row" alignItems="center">
            <StyledLabel>Categorias</StyledLabel>

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
              ]}
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
          </Stack>

          <Stack direction="row">
            <StyledLabel>Descrição </StyledLabel>

            <TextField
              fullWidth
              multiline
              size="small"
              value={taskDescription}
              onChange={handleChangeTaskDescription}
              InputProps={{
                sx: { typography: 'body2' },
              }}
            />
          </Stack>
        </Stack>
      </Scrollbar>

      <Box p={2}>
        <Button onClick={confirm.onTrue} variant="contained" color="error" fullWidth>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="button">Deletar</Typography>

            <Iconify icon="solar:trash-bin-trash-bold" />
          </Stack>
        </Button>
      </Box>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {taskName} </strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Delete
          </Button>
        }
      />
    </Drawer>
  )
}
