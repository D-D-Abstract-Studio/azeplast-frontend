import { Iconify } from '@/components'
import { PriorityStatus } from '@/components/PriorityStatus'
import { endpoints } from '@/constants/config'
import { useRequest } from '@/hooks/use-request'
import { IKanbanTask } from '@/types/kanban'
import { Notification } from '@/types/Notification'
import { Divider, Paper, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'

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
  const { data: tasks } = useRequest<Array<IKanbanTask>>({
    url: endpoints.tasks.getAllTasks,
  })

  return tasks
    ?.filter((task) => notifications?.some((notification) => notification.taskId === task._id))
    .map((task, index) => {
      const notificationsTaks = notifications?.filter(
        (notification) => notification.taskId === task._id
      )

      return (
        <Paper key={index} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.neutral', my: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="h6">{task.name}</Typography>

            <Typography variant="inherit">
              ({notificationsTaks?.filter((notification) => !notification.view).length}) Não lidas
            </Typography>
          </Stack>

          {notificationsTaks?.map((notification, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', my: 2 }}
            >
              <Stack direction="column" alignItems="left" spacing={1}>
                <Stack direction="column">
                  <Typography variant="h6">{notification.title}</Typography>
                  <Typography variant="caption">
                    {dayjs(notification.createdAt).format('DD/MM/YYYY')}
                  </Typography>
                </Stack>

                <Typography variant="body2">{notification.description}</Typography>

                <Divider />

                <PriorityStatus priority={notification.priority} />
              </Stack>
            </Paper>
          ))}
        </Paper>
      )
    })
}
