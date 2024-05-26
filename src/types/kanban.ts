export const priorityValues = ['baixa', 'média', 'alta'] as const

export type IKanbanTask = {
  id: string
  name: string
  priority: (typeof priorityValues)[number]
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

export type IKanbanBoard = Pick<IKanban, 'tasks' | 'columns' | 'ordered'> & {
  id: string
  name: string
}

export type IKanban = {
  tasks: Record<string, IKanbanTask>
  columns: Record<string, IKanbanColumn>
  ordered: string[]
}
