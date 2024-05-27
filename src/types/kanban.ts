export const priorityValues = ['baixa', 'média', 'alta'] as const

export type IKanbanTask = {
  id: string
  name: string
  archived: boolean
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
  archived: boolean
  name: string
  taskIds: string[]
}

export type IKanbanBoard = {
  id: string
  archived: boolean
  name: string
  usersIds: string[]
  columnIds: string[]
}

export type IKanban = {
  boards: Record<string, IKanbanBoard>
  columns: Record<string, IKanbanColumn>
  ordered: string[]
  tasks: Record<string, IKanbanTask>
}
