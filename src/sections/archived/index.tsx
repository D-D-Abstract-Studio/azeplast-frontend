import { endpoints } from '@/constants/config'
import { useRequest } from '@/hooks/use-request'
import { IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

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
    <div>
      <h1>Archived</h1>
    </div>
  )
}
