import { Draggable } from '@hello-pangea/dnd'

import { useTheme } from '@mui/material/styles'

import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Paper, { PaperProps } from '@mui/material/Paper'
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup'

import { useBoolean } from '@/hooks/use-boolean'

import { bgBlur } from '@/theme/css'

import { IKanbanTask } from '@/types/kanban'

import Iconify from '@/components/iconify'

import KanbanDetails from './kanban-details'

type Props = PaperProps & {
  index: number
  task: IKanbanTask
  onUpdateTask: (updateTask: IKanbanTask) => void
  onDeleteTask: VoidFunction
}

export default function KanbanTaskItem({
  task,
  index,
  onDeleteTask,
  onUpdateTask,
  sx,
  ...other
}: Props) {
  const theme = useTheme()

  const openDetails = useBoolean()

  const renderPriority = (
    <Iconify
      icon="solar:double-alt-arrow-down-bold-duotone"
      sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        ...(task.priority === 'low' && {
          color: 'info.main',
        }),
        ...(task.priority === 'medium' && {
          color: 'warning.main',
        }),
        ...(task.priority === 'hight' && {
          color: 'error.main',
        }),
      }}
    />
  )

  const renderInfo = (
    <Stack direction="row" alignItems="center">
      <AvatarGroup
        sx={{
          [`& .${avatarGroupClasses.avatar}`]: {
            width: 24,
            height: 24,
          },
        }}
      >
        {task.assignee.map((user) => (
          <Avatar key={user.id} alt={user.name} src={user.avatarUrl} />
        ))}
      </AvatarGroup>
    </Stack>
  )

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={openDetails.onTrue}
            sx={{
              width: 1,
              borderRadius: 1.5,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'background.default',
              boxShadow: theme.customShadows.z1,
              '&:hover': {
                boxShadow: theme.customShadows.z20,
              },
              ...(openDetails.value && {
                boxShadow: theme.customShadows.z20,
              }),
              ...(snapshot.isDragging && {
                boxShadow: theme.customShadows.z20,
                ...bgBlur({
                  opacity: 0.48,
                  color: theme.palette.background.default,
                }),
              }),
              ...sx,
            }}
            {...other}
          >
            <Stack spacing={2} sx={{ px: 2, py: 2.5, position: 'relative' }}>
              {renderPriority}

              <Typography variant="subtitle2">{task.name}</Typography>

              {renderInfo}
            </Stack>
          </Paper>
        )}
      </Draggable>

      <KanbanDetails
        task={task}
        openDetails={openDetails.value}
        onCloseDetails={openDetails.onFalse}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />
    </>
  )
}