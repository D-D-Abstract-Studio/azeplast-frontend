import { useCallback } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'

import { alpha } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { Box } from '@mui/material'

import { useBoolean } from '@/hooks/use-boolean'

import { updateColumn, deleteColumn, createTask, updateTask, deleteTask } from '@/api/kanban'

import KanbanTaskAdd from './kanban-task-add'
import KanbanTaskItem from './kanban-task-item'
import KanbanColumnToolBar from './kanban-column-tool-bar'

import { Iconify } from '@/components/iconify'

import { enqueueSnackbar } from 'notistack'

import { IKanban, IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

type Props = Pick<IKanban, 'columns'> & {
  board: IKanbanBoard
  index: number
}

export const KanbanBoard = ({ board, columns, index }: Props) => {
  const openAddTask = useBoolean()

  const handleUpdateColumn = useCallback(
    async (columnName: string) => {
      try {
        if (board.name !== columnName) {
          updateColumn(board.id, columnName)

          enqueueSnackbar('Update success!', {
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
          })
        }
      } catch (error) {
        console.error(error)
      }
    },
    [board.id, board.name, enqueueSnackbar]
  )

  const handleDeleteColumn = useCallback(async () => {
    try {
      deleteColumn(board.id)

      enqueueSnackbar('Delete success!', {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      })
    } catch (error) {
      console.error(error)
    }
  }, [board.id, enqueueSnackbar])

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
        deleteTask(board.id, taskId)

        enqueueSnackbar('Delete success!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [board.id, enqueueSnackbar]
  )

  return (
    <Draggable draggableId={board.id} index={index}>
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
            <KanbanColumnToolBar
              columnName={board.name}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
            />

            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 210px)' }}>
              <Droppable droppableId={board.id} type="TASK">
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
                    {board.columnIds.map((taskId, taskIndex) => (
                      <KanbanTaskItem
                        key={taskId}
                        index={taskIndex}
                        task={tasks[taskId]}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={() => handleDeleteTask(taskId)}
                      />
                    ))}

                    {openAddTask.value && (
                      <KanbanTaskAdd
                        status={board.name}
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
