import { PriorityValues } from '@/shared/priorityValues'

export type Notification = {
  _id: string
  title: string
  description: string
  reporter: string
  view: boolean
  taskId: string
  assignee?: Array<{
    name: string
  }>
  priority: PriorityValues
  createdAt: string
  updatedAt: string
}
