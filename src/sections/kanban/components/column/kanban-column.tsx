import { useCallback } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'

import { alpha } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { Box } from '@mui/material'

import { useBoolean } from '@/hooks/use-boolean'

import { createTask, updateTask, deleteTask } from '@/api/kanban'

import KanbanTaskAdd from '../tasks/kanban-task-add'
import KanbanTaskItem from '../tasks/kanban-task-item'
import KanbanColumnToolBar from './kanban-column-tool-bar'

import { Iconify } from '@/components/iconify'

import { enqueueSnackbar } from 'notistack'

import { IKanban, IKanbanColumn, IKanbanTask } from '@/types/kanban'

type Props = Partial<Pick<IKanban, 'tasks'>> & {
  column: IKanbanColumn | undefined
  index: number
}

export const KanbanColumn = ({ column, tasks, index }: Props) => {
  const openAddTask = useBoolean()

  if (!column) return null

  const handleAddTask = useCallback(
    async (taskData: IKanbanTask) => {
      try {
        createTask(column.id, taskData)

        openAddTask.onFalse()
      } catch (error) {
        console.error(error)
      }
    },
    [column.id, openAddTask]
  )

  const handleUpdateTask = useCallback(async (taskData: IKanbanTask) => {
    try {
      updateTask(taskData)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        deleteTask(column.id, taskId)

        enqueueSnackbar('Delete success!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [column.id, enqueueSnackbar]
  )

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            ...(snapshot.isDragging && {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.24),
            }),
          }}
        >
          <Stack {...provided.dragHandleProps} spacing={2}>
            <KanbanColumnToolBar columnName={column.name} column={column} />

            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 210px)' }}>
              <Droppable droppableId={column.id} type="TASK">
                {(dropProvided) => (
                  <Stack
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    spacing={2}
                    sx={{
                      py: 3,
                      width: 280,
                    }}
                  >
                    {column.taskIds.map((taskId, taskIndex) => {
                      if (!tasks) return null

                      return (
                        <KanbanTaskItem
                          key={taskId}
                          index={taskIndex}
                          task={tasks[taskId]}
                          onUpdateTask={handleUpdateTask}
                          onDeleteTask={() => handleDeleteTask(taskId)}
                        />
                      )
                    })}

                    {openAddTask.value && (
                      <KanbanTaskAdd
                        status={column.name}
                        onAddTask={handleAddTask}
                        onCloseAddTask={openAddTask.onFalse}
                      />
                    )}

                    {dropProvided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </Box>

            <Button
              fullWidth
              sx={{ mb: 1 }}
              size="large"
              color="inherit"
              variant="outlined"
              startIcon={
                <Iconify
                  size={1.5}
                  icon={openAddTask.value ? 'solar:close-circle-broken' : 'mingcute:add-line'}
                />
              }
              onClick={openAddTask.onToggle}
            >
              {openAddTask.value ? 'Cancelar' : 'Tarefa'}
            </Button>
          </Stack>
        </Paper>
      )}
    </Draggable>
  )
}
