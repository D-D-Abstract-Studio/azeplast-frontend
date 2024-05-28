import { DataGridCustom } from '@/components/data-grid-custom'
import { endpoints } from '@/constants/config'
import { useRequest } from '@/hooks/use-request'
import { IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'

import Label from '@/components/label'

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
        },
        {
          field: 'priority',
          headerName: 'Prioridade',
          renderCell: (params) => params?.priority,
        },
        {
          field: 'categories',
          headerName: 'Categorias',
          renderCell: (params) => (
            <Stack spacing={1} direction="row">
              {params?.categories?.map((category) => (
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
        },
        {
          field: 'assignee',
          headerName: 'Responsável',
          renderCell: (params) => (
            <Stack spacing={1} direction="row">
              {params?.assignee?.map((assignee) => (
                <Avatar key={assignee.name} src={assignee.name} />
              ))}
            </Stack>
          ),
        },
        {
          field: 'dueDate',
          headerName: 'Data de entrega',
        },
        {
          field: 'reporter',
          headerName: 'Relator',
          renderCell: (params) => (
            <Stack spacing={1} direction="row">
              <Avatar src={params?.reporter} />
            </Stack>
          ),
        },
      ]}
    />
  )
}
