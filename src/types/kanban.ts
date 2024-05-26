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
  dueDate: string
  reporter: {
    user: string
  }
}

export type IKanbanColumn = {
  id: string
  name: string
  taskIds: string[]
}

export type IKanbanBoard = {
  id: string
  name: string
  columnIds: string[]
}

export type IKanban = {
  boards: Record<string, IKanbanBoard>
  columns: Record<string, IKanbanColumn>
  ordered: string[]
  tasks: Record<string, IKanbanTask>
}
