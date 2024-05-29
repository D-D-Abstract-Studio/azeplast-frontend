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
  ButtonBase,
  alpha,
  Chip,
  Container,
} from '@mui/material'
import { Label } from '@/components/label'

import { DataGridCustom } from '@/components/data-grid-custom'
import { MenuPopover } from '@/components/MenuPopover'
import { Iconify } from '@/components/iconify'

import { useRequest } from '@/hooks/use-request'

import { COLORS, endpoints } from '@/constants/config'

import dayjs from 'dayjs'
import { enqueueSnackbar } from 'notistack'

import { axios } from '@/utils/axios'

import { useBoolean } from '@/hooks/use-boolean'

import { IKanbanColumn, IKanbanTask, priorityValues } from '@/types/kanban'
import { LabelColor } from '@/components/label/types'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/custom-dialog'

import { DatePicker } from '@mui/x-date-pickers'
import { CopyClipboard } from '@/components/CopyClipboard'

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

  const { data: columns } = useRequest<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: tasks } = useRequest<Array<IKanbanTask>>({
    url: endpoints.tasks.getAllTasks,
  })

  const row = tasks
    ?.filter((task) => task.archived)
    .map((task) => {
      const isExistingColumn = columns?.find((column) => column.taskIds.includes(task.id))

      return { ...task, status: isExistingColumn ? isExistingColumn.name : '' }
    })

  const onUnarchiveTask = async (id: string) => {
    const task = await axios.get<IKanbanTask>(endpoints.tasks.getTask(id))

    await axios
      .put<IKanbanTask>(endpoints.tasks.updateTask(task.data.id), {
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

    await axios.delete<IKanbanTask>(endpoints.tasks.deleteTask(task.data.id)).then(() => {
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
            field: 'id',
          },
          {
            field: 'name',
            headerName: 'Nome',
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
          },
          {
            field: 'categories',
            headerName: 'Categorias',
            width: 200,
            renderCell: ({ row }) => (
              <Grid container columnSpacing={0.5} justifyContent="center">
                {row?.categories.map((category, index) => {
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
            field: 'description',
            headerName: 'Descrição',
            flex: 1,
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
                  onClick={() => row?.id && onUnarchiveTask(row.id)}
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
                  onClick={() => row?.id && onDeleteTask(row.id)}
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

      <ConfirmDialog
        open={openDetails.value}
        onClose={openDetails.onFalse}
        title=""
        content={
          <Container>
            <Stack spacing={3}>
              <Stack direction="column" alignItems="left" spacing={1}>
                <StyledLabel>Criado por</StyledLabel>

                <Avatar alt={task?.reporter} color="secondary">
                  <Tooltip title={task?.reporter}>
                    <Typography variant="button">
                      {task?.reporter.slice(0, 3).toUpperCase()}
                    </Typography>
                  </Tooltip>
                </Avatar>
              </Stack>

              <Stack direction="column" alignItems="left" spacing={1}>
                <StyledLabel>Responsáveis</StyledLabel>

                {Boolean(!task?.categories.length) && (
                  <Avatar sx={{ bgcolor: 'background.neutral', color: 'text.primary' }}>
                    <Typography variant="button">N/A</Typography>
                  </Avatar>
                )}

                <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
                  {task?.assignee.map((user, index) => (
                    <Avatar key={index} alt={user.name} color={COLORS[index]}>
                      <Typography variant="button">
                        {task?.reporter.slice(0, 3).toUpperCase()}
                      </Typography>
                    </Avatar>
                  ))}
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

              <Stack direction="column" alignItems="left" spacing={1}>
                <StyledLabel>Prioridade</StyledLabel>

                <Stack direction="row" flexWrap="wrap" spacing={1}>
                  {priorityValues.map((option) => (
                    <ButtonBase
                      key={option}
                      sx={{
                        p: 1,
                        fontSize: 12,
                        borderRadius: 1,
                        lineHeight: '20px',
                        textTransform: 'capitalize',
                        fontWeight: 'fontWeightBold',
                        boxShadow: (theme) =>
                          `inset 0 0 0 1px ${alpha(theme.palette.grey[500], 0.24)}`,
                        ...(option === task?.priority && {
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

              <Stack direction="row" flexWrap="wrap" spacing={1}>
                <StyledLabel>Categorias</StyledLabel>

                {task?.categories?.map((category, index) => (
                  <Chip key={index} variant="soft" label={category} />
                ))}

                {Boolean(!task?.categories.length) && <Chip variant="soft" label="Sem categoria" />}
              </Stack>

              <CopyClipboard
                fullWidth
                multiline
                label="Descrição"
                value={task?.description || ''}
              />
            </Stack>
          </Container>
        }
      />
    </>
  )
}
