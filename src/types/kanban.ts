export type IKanbanTask = {
  id: string
  name: string
  status: string
  priority: string
  categories: string[]
  description: string
  assignee: Array<{
    name?: string
  }>
  dueDate: Date
  reporter: {
    user: string
  }
}

export type IKanbanColumn = {
  id: string
  name: string
  taskIds: string[]
}

export type IKanban = {
  tasks: Record<string, IKanbanTask>
  columns: Record<string, IKanbanColumn>
  ordered: string[]
}
