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
  dueDate: Date
  reporter: string
}

export type IKanbanColumn = {
  id: string
  boardId: string
  archived: boolean
  name: string
  taskIds: string[]
}

export type IKanbanBoard = {
  id: string
  name: string
  usersIds: string[]
  columnIds: string[]
  ordered: string[]
}

export type IKanban = {
  boards: Record<string, IKanbanBoard>
  columns: Record<string, IKanbanColumn>
  tasks: Record<string, IKanbanTask>
  ordered: string[]
}
