import { mutate } from 'swr'

import { Button, Divider, MenuItem, Stack, Avatar } from '@mui/material'
import { Label } from '@/components/label'

import { DataGridCustom } from '@/components/data-grid-custom'
import { MenuPopover } from '@/components/MenuPopover'
import { Iconify } from '@/components/iconify'

import { useRequest } from '@/hooks/use-request'

import { endpoints } from '@/constants/config'

import dayjs from 'dayjs'
import { enqueueSnackbar } from 'notistack'

import { axios } from '@/utils/axios'

import { IKanbanColumn, IKanbanTask } from '@/types/kanban'
import { LabelColor } from '@/components/label/types'

export const ArchivedList = () => {
  const { data: columns } = useRequest<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: tasks } = useRequest<Array<IKanbanTask>>({
    url: endpoints.tasks.getAllTasks,
  })

  const row = tasks?.map((task) => {
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
          renderCell: ({ row }) => (
            <Stack spacing={1} direction="row">
              {row?.categories?.map((category) => (
                <Label key={category} color="primary">
                  {category}
                </Label>
              ))}
            </Stack>
          ),
        },
        {
          field: 'assignee',
          headerName: 'Responsáveis',
          renderCell: ({ row }) => (
            <Stack spacing={1} direction="row">
              {row?.assignee?.map((assignee) => (
                <Avatar key={assignee.name} src={assignee.name} />
              ))}
            </Stack>
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
  )
}
