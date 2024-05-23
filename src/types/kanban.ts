export type IKanbanComment = {
  id: string
  name: string
  message: string
  createdAt: Date
}

export type IKanbanAssignee = {
  id: string
  name: string
  role: string
  email: string
}

export type IKanbanTask = {
  id: string
  name: string
  status: string
  priority: string
  labels: string[]
  description?: string
  assignee: IKanbanAssignee[]
  due: [Date | null, Date | null]
  reporter: {
    id: string
    name: string
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
