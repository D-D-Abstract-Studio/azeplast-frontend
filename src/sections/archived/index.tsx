import { DataGridCustom } from '@/components/data-grid-custom'
import { endpoints } from '@/constants/config'
import { useRequest } from '@/hooks/use-request'
import { IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

import { Label } from '@/components/label'

import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import dayjs from 'dayjs'

export const ArchivedList = () => {
  const { data: boards } = useRequest<Array<IKanbanBoard>>({
    url: endpoints.boards.getAllBoards,
  })

  const { data: columns } = useRequest<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: tasks } = useRequest<Array<IKanbanTask>>({
    url: endpoints.tasks.getAllTasks,
  })

  return (
    <DataGridCustom<IKanbanTask | undefined>
      data={tasks || []}
      columns={[
        {
          field: 'id',
        },
        {
          field: 'name',
          headerName: 'Nome',
          flex: 1,
        },
        {
          field: 'priority',
          headerName: 'Prioridade',
          renderCell: ({ row }) => <Label>{String(row?.priority)}</Label>,
        },
        {
          field: 'categories',
          headerName: 'Categorias',
          flex: 1,
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
          field: 'description',
          headerName: 'Descrição',
          flex: 1,
        },
        {
          field: 'assignee',
          headerName: 'Responsáveis',
          flex: 1,
          renderCell: ({ row }) => (
            <Stack spacing={1} direction="row">
              {row?.assignee?.map((assignee) => (
                <Avatar key={assignee.name} src={assignee.name} />
              ))}
            </Stack>
          ),
        },
        {
          field: 'dueDate',
          headerName: 'Data de entrega',
          renderCell: ({ row }) => dayjs(row?.dueDate).format('DD/MM/YYYY'),
          flex: 1,
        },
      ]}
    />
  )
}
