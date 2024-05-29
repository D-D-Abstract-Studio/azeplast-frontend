import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import { Label } from '@/components/label'

import { DataGridCustom } from '@/components/data-grid-custom'

import { useRequest } from '@/hooks/use-request'

import { endpoints } from '@/constants/config'

import dayjs from 'dayjs'

import { IKanbanColumn, IKanbanTask } from '@/types/kanban'
import { MenuPopover } from '@/components/MenuPopover'
import { Button, Divider, MenuItem } from '@mui/material'
import { Iconify } from '@/components/iconify'

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
          renderCell: ({ row }) => <Label>{String(row?.priority)}</Label>,
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
          renderCell: (launch) => (
            <MenuPopover arrow="top-right" sx={{ width: 'max-content', p: 1 }}>
              <MenuItem
                component={Button}
                fullWidth
                onClick={() => onEditLaunch(launch._id)}
                startIcon={<Iconify icon="mdi:pencil" />}
              >
                Editar
              </MenuItem>

              <Divider />

              <MenuItem
                component={Button}
                fullWidth
                onClick={() => onArchiveLaunch(launch._id)}
                sx={{ color: 'warning.main' }}
                startIcon={<Iconify icon="eva:archive-outline" />}
              >
                Desarquivar
              </MenuItem>
            </MenuPopover>
          ),
        },
      ]}
    />
  )
}
