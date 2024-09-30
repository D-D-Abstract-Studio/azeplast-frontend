import { PriorityValues } from '@/shared/priorityValues'

export type ConversationsType = {
  _id: string
  userId: string
  date: string
  message: string
}

export type IKanbanTask = {
  _id: string
  name: string
  archived: boolean
  priority: PriorityValues
  categories?: string[]
  conversations?: Array<ConversationsType>
  history?: Array<{
    _id: string
    userId: string
    date: string
  }>
  assignee?: Array<{
    _id?: string
    userId: string
  }>
  dueDate: Date
  userId: string
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
