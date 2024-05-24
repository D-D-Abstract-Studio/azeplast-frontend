import { useCallback } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'

import { alpha } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import { useBoolean } from '@/hooks/use-boolean'

import { updateColumn, deleteColumn, createTask, updateTask, deleteTask } from '@/api/kanban'

import Iconify from '@/components/iconify'

import { IKanban, IKanbanColumn, IKanbanTask } from '@/types/kanban'
import KanbanTaskAdd from './kanban-task-add'
import KanbanTaskItem from './kanban-task-item'
import KanbanColumnToolBar from './kanban-column-tool-bar'
import { useSnackbar } from 'notistack'
import { Box } from '@mui/material'

type Props = Pick<IKanban, 'tasks'> & {
  column: IKanbanColumn
  index: number
}

export default function KanbanColumn({ column, tasks, index }: Props) {
  const { enqueueSnackbar } = useSnackbar()

  const openAddTask = useBoolean()

  const handleUpdateColumn = useCallback(
    async (columnName: string) => {
      try {
        if (column.name !== columnName) {
          updateColumn(column.id, columnName)

          enqueueSnackbar('Update success!', {
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
          })
        }
      } catch (error) {
        console.error(error)
      }
    },
    [column.id, column.name, enqueueSnackbar]
  )

  const handleDeleteColumn = useCallback(async () => {
    try {
      deleteColumn(column.id)

      enqueueSnackbar('Delete success!', {
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      })
    } catch (error) {
      console.error(error)
    }
  }, [column.id, enqueueSnackbar])

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
            <KanbanColumnToolBar
              columnName={column.name}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
            />

            <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 210px)' }}>
              <Droppable droppableId={column.id} type="TASK">
                {(dropProvided) => (
                  <Stack ref={dropProvided.innerRef} {...dropProvided.droppableProps} spacing={2}>
                    {column?.taskIds.map((taskId, taskIndex) => (
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
              size="large"
              variant="contained"
              startIcon={
                <Iconify
                  icon={openAddTask.value ? 'solar:close-circle-broken' : 'mingcute:add-line'}
                  width={18}
                  sx={{ mr: -0.5 }}
                />
              }
              onClick={openAddTask.onToggle}
              sx={{
                mb: 2,
                fontSize: 14,
                backgroundColor: '#363e48',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'grey.700',
                },
              }}
            >
              {openAddTask.value ? 'Cancelar' : 'Add Tarefa'}
            </Button>
          </Stack>
        </Paper>
      )}
    </Draggable>
  )
}
