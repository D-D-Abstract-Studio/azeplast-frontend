export const priorityValues = ['baixa', 'média', 'alta'] as const

export type PriorityValues = (typeof priorityValues)[number]

export type IKanbanTask = {
  _id: string
  name: string
  archived: boolean
  priority: PriorityValues
  categories?: string[]
  description: string
  history?: Array<{
    user: string
    date: Date
  }>
  assignee: Array<{
    name?: string
  }>
  dueDate: Date
  reporter: string
  files?: File[]
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
