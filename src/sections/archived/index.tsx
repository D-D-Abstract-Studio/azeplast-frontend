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
      {tasks
        ?.filter((task) => task.archived)
        .map((task) => (
          <div key={task.id}>{task.name}</div>
        ))}
    </div>
  )
}
