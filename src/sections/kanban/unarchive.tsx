import { mutate } from 'swr'

import {
  Button,
  Divider,
  MenuItem,
  Stack,
  Avatar,
  Tooltip,
  Grid,
  Box,
  styled,
  Typography,
  Chip,
  Container,
} from '@mui/material'
import { Label } from '@/components/label'

import { DataGridCustom } from '@/components/data-grid-custom'
import { MenuPopover } from '@/components/MenuPopover'
import { Iconify } from '@/components/iconify'

import { useRequestSWR } from '@/hooks/use-request'

import { COLORS, endpoints } from '@/constants/config'

import dayjs from 'dayjs'
import { enqueueSnackbar } from 'notistack'

import { axios } from '@/utils/axios'

import { useBoolean } from '@/hooks/use-boolean'

import { IKanbanColumn, IKanbanTask } from '@/types/kanban'
import { LabelColor } from '@/components/label/types'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/custom-dialog'

import { DatePicker } from '@mui/x-date-pickers'

import { User } from '@/types/user'
import { PriorityStatus } from '@/components/PriorityStatus'
import { Conversations } from './components/tasks/components/conversations'

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: '100%',
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}))

export const ArchivedList = () => {
  const openDetails = useBoolean()

  const [task, setTask] = useState<IKanbanTask>()

  const { data: userCurrency } = useRequestSWR<User>({ url: endpoints.user.getUser })

  const { data: user } = useRequestSWR<User>({
    url: endpoints.user.getUserById(task?.userId || ''),
    stopRequest: !task?.userId,
  })

  const { data: users } = useRequestSWR<Array<User>>({ url: endpoints.user.getAllUsers })

  const { data: columns } = useRequestSWR<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: tasks } = useRequestSWR<Array<IKanbanTask>>({ url: endpoints.tasks.getAllTasks })

  const row = tasks
    ?.filter((task) => task.archived)
    .map((task) => {
      const isExistingColumn = columns?.find((column) => column.taskIds.includes(task._id))

      return { ...task, status: isExistingColumn ? isExistingColumn.name : '' }
    })

  const onUnarchiveTask = async (id: string) => {
    const task = await axios.get<IKanbanTask>(endpoints.tasks.getTask(id))

    await axios
      .put<IKanbanTask>(endpoints.tasks.updateTask(task.data._id), {
        ...task.data,
        archived: false,
      })
      .then(() => {
        enqueueSnackbar('Tarefa desarquivada com sucesso')

        mutate(endpoints.tasks.getAllTasks)
      })
  }

  const onDeleteTask = async (id: string) => {
    const task = await axios.get<IKanbanTask>(endpoints.tasks.getTask(id))

    await axios.delete<IKanbanTask>(endpoints.tasks.deleteTask(task.data._id)).then(() => {
      enqueueSnackbar('Tarefa deletada com sucesso')

      mutate(endpoints.tasks.getAllTasks)
    })
  }

  const priorityColorMap: Record<IKanbanTask['priority'], LabelColor> = {
    baixa: 'success',
    média: 'warning',
    alta: 'error',
  }

  return (
    <>
      <DataGridCustom<(IKanbanTask & { status: string }) | undefined>
        row={row || []}
        columns={[
          {
            field: 'name',
            headerName: 'Nome',
            flex: 1,
          },
          {
            field: 'priority',
            headerName: 'Prioridade',
            renderCell: ({ row }) => {
              const priorityColor = priorityColorMap[row?.priority || 'baixa']

              return <Label color={priorityColor}>{row?.priority}</Label>
            },
          },
          {
            field: 'status',
            headerName: 'Status',
            flex: 1,
          },
          {
            field: 'categories',
            headerName: 'Categorias',
            flex: 1,
            renderCell: ({ row }) => (
              <Grid container spacing={0.5} justifyContent="center" p={1}>
                {row?.categories?.map((category, index) => {
                  return (
                    <Grid key={index} item xs="auto" p={0}>
                      <Tooltip title={category}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignContent: 'center',
                          }}
                        >
                          <Label key={category} color="primary">
                            {category}
                          </Label>
                        </Box>
                      </Tooltip>
                    </Grid>
                  )
                })}
              </Grid>
            ),
          },
          {
            field: 'dueDate',
            headerName: 'Data de entrega',
            width: 130,
            renderCell: ({ row }) => dayjs(row?.dueDate).format('DD/MM/YYYY'),
          },
          {
            headerName: 'Ações',
            width: 60,
            renderCell: ({ row }) => (
              <MenuPopover arrow="top-right" sx={{ width: 'max-content', p: 1 }}>
                <MenuItem
                  component={Button}
                  fullWidth
                  onClick={() => {
                    setTimeout(() => setTask(row as IKanbanTask), 0)
                    openDetails.onTrue()
                  }}
                >
                  <Stack direction="row">
                    <Iconify icon="solar:eye-bold-duotone" />
                    Visualizar
                  </Stack>
                </MenuItem>

                <MenuItem
                  component={Button}
                  fullWidth
                  onClick={() => row?._id && onUnarchiveTask(row._id)}
                  sx={{ color: 'warning.main' }}
                >
                  <Stack direction="row">
                    <Iconify icon="eva:archive-outline" />
                    Desarquivar
                  </Stack>
                </MenuItem>

                <Divider />

                <MenuItem
                  component={Button}
                  fullWidth
                  onClick={() => row?._id && onDeleteTask(row._id)}
                  sx={{ color: 'error.main' }}
                >
                  <Stack direction="row">
                    <Iconify icon="eva:trash-fill" />
                    Deletar
                  </Stack>
                </MenuItem>
              </MenuPopover>
            ),
          },
        ]}
      />

      {Boolean(openDetails.value) && (
        <ConfirmDialog
          maxWidth="md"
          open={openDetails.value}
          onClose={openDetails.onFalse}
          title={`Detalhes da tarefa ${task?.name}`}
          content={
            <Container>
              <Stack spacing={3}>
                <Stack direction="column" alignItems="left" spacing={1}>
                  <StyledLabel>Criado por</StyledLabel>

                  <Avatar alt={user?.name} color="secondary">
                    <Tooltip title={user?.name}>
                      <Typography variant="button">
                        {user?.name?.slice(0, 3).toUpperCase()}
                      </Typography>
                    </Tooltip>
                  </Avatar>
                </Stack>

                <Stack direction="column" alignItems="left" spacing={1}>
                  <StyledLabel>Responsáveis</StyledLabel>

                  {Boolean(!task?.categories?.length) && (
                    <Avatar sx={{ bgcolor: 'background.neutral', color: 'text.primary' }}>
                      <Typography variant="button">N/A</Typography>
                    </Avatar>
                  )}

                  <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
                    {task?.assignee?.map(({ userId }, index) => {
                      const { data: user } = useRequestSWR<User>({
                        url: endpoints.user.getUserById(userId),
                      })

                      return (
                        <Avatar key={index} alt={user?.name} color={COLORS[index]}>
                          <Typography variant="button">
                            {user?.name?.slice(0, 3).toUpperCase()}
                          </Typography>
                        </Avatar>
                      )
                    })}
                  </Stack>
                </Stack>

                <DatePicker
                  disabled
                  value={task?.dueDate ? new Date(task.dueDate) : new Date()}
                  label="Data de vencimento"
                  slotProps={{
                    actionBar: {
                      actions: ['today', 'accept'],
                    },
                  }}
                />

                <PriorityStatus priority={task?.priority || 'baixa'} />

                <Stack direction="row" flexWrap="wrap" spacing={1}>
                  <StyledLabel>Categorias</StyledLabel>

                  {task?.categories?.map((category, index) => (
                    <Chip key={index} variant="soft" label={category} />
                  ))}

                  {Boolean(!task?.categories?.length) && (
                    <Chip variant="soft" label="Sem categoria" />
                  )}
                </Stack>

                <Stack direction="column" spacing={1}>
                  {task?.conversations?.map((conversation, index) => {
                    const user = users?.find((user) => user._id === conversation.userId)

                    const isUserCurrent = userCurrency?._id === user?._id

                    return (
                      <Conversations
                        key={index}
                        isUserCurrent={isUserCurrent}
                        conversation={{
                          ...conversation,
                          userId: user?.name || '',
                        }}
                      />
                    )
                  })}
                </Stack>
              </Stack>
            </Container>
          }
        />
      )}
    </>
  )
}
