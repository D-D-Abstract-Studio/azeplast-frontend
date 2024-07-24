import { Notification } from '@/types/Notification'
import { Paper, Typography } from '@mui/material'

/*
export type Notification = {
  _id: string
  title: string
  description: string
  reporter: string
  view: boolean
  taskId: string
  assignee: Array<{
    name?: string
  }>
  priority: string
  createdAt: string
  updatedAt: string
}
*/

type Props = {
  notifications: Array<Notification> | undefined
}

export const Notifications = ({ notifications }: Props) => {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
      {notifications?.map((notification) => (
        <div key={notification._id}>
          <Typography variant="h6">{notification.title}</Typography>
          <Typography variant="body2">{notification.description}</Typography>
        </div>
      ))}
    </Paper>
  )
}
