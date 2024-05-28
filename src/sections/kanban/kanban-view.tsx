'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import { hideScroll } from '@/theme/css'

import { moveColumn, moveTask } from '@/api/kanban'

import { useRequest } from '@/hooks/use-request'

import { endpoints, userCurrency } from '@/constants/config'

import { IKanban, IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

import { Alert, Checkbox, FormControlLabel, MenuItem, Typography } from '@mui/material'
import { MenuPopover } from '@/components/MenuPopover'

import { KanbanColumnSkeleton } from './components/kanban-skeleton'
import { KanbanBoardAdd } from './components/board/board-add'
import { BoardActions } from './components/board/board-actions'
import { KanbanColumnAdd } from './components/column/kanban-column-add'
import { KanbanColumn } from './components/column/kanban-column'

import { User } from '@/types/user'

export const KanbanView = () => {
  const { data: user } = useRequest<User>({
    url: endpoints.user.getUser,
  })

  const { data: boards, isLoading } = useRequest<Array<IKanbanBoard>>({
    url: endpoints.boards.getAllBoards,
  })

  const { data: columns } = useRequest<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: tasks } = useRequest<Array<IKanbanTask>>({
    url: endpoints.tasks.getAllTasks,
  })

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)

  const board = useMemo(() => {
    if (!selectedBoard) {
      return null
    }

    const board = boards?.find((board) => board.id === selectedBoard)

    if (!board) {
      return null
    }

    const columnsFiltered = columns?.filter((column) => column.boardId === selectedBoard)

    const columnsMapped = columnsFiltered?.reduce((acc, column) => {
      acc[column.id] = column
      return acc
    }, {} as Record<string, IKanbanColumn>)

    const tasksFiltered = tasks?.filter((task) =>
      columnsFiltered?.some((column) => column.taskIds.includes(task.id))
    )

    const tasksMapped = tasksFiltered?.reduce((acc, task) => {
      acc[task.id] = task
      return acc
    }, {} as Record<string, IKanbanTask>)

    console.log({ columnsMapped, tasksMapped })

    return {
      ...board,
      columns: columnsMapped,
      tasks: tasksMapped,
    }
  }, [boards, columns, tasks, selectedBoard]) as IKanbanBoard & Pick<IKanban, 'columns' | 'tasks'>

  const isPermissionAdmin = user?.permissions === 'admin'

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }: DropResult) => {
      try {
        if (!destination) {
          return
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return
        }

        // Moving column
        if (type === 'COLUMN') {
          const newOrdered = [...board.ordered]

          newOrdered.splice(source.index, 1)

          newOrdered.splice(destination.index, 0, draggableId)

          moveColumn(newOrdered)
          return
        }

        const sourceColumn = board?.columns[source.droppableId]

        const destinationColumn = board?.columns[destination.droppableId]

        // Moving task to same list
        if (sourceColumn.id === destinationColumn.id) {
          const newTaskIds = [...sourceColumn.taskIds]

          newTaskIds.splice(source.index, 1)

          newTaskIds.splice(destination.index, 0, draggableId)

          moveTask({
            ...board?.columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              taskIds: newTaskIds,
            },
          })

          console.info('Moving to same list!')

          return
        }

        // Moving task to different list
        const sourceTaskIds = [...sourceColumn.taskIds]

        const destinationTaskIds = [...destinationColumn.taskIds]

        // Remove from source
        sourceTaskIds.splice(source.index, 1)

        // Insert into destination
        destinationTaskIds.splice(destination.index, 0, draggableId)

        moveTask({
          ...board?.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            taskIds: sourceTaskIds,
          },
          [destinationColumn.id]: {
            ...destinationColumn,
            taskIds: destinationTaskIds,
          },
        })

        console.info('Moving to different list!')
      } catch (error) {
        console.error(error)
      }
    },
    [board?.columns, board?.ordered]
  )

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(4)].map((_, index) => (
        <KanbanColumnSkeleton key={index} index={index} />
      ))}
    </Stack>
  )

  if (userCurrency === 'anonymous') {
    return (
      <Stack p={2}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Você está visualizando a aplicação como um usuário anônimo. Para ter acesso a todas as
            funcionalidades, peça ao administrador para criar uma conta de usuário para você.
          </Typography>
        </Alert>
      </Stack>
    )
  }

  useEffect(() => {
    if (boards?.length && !selectedBoard) {
      setSelectedBoard(boards.filter((board) => !board.archived)[0].id)
    }
  }, [boards, selectedBoard])

  return (
    <Container maxWidth="xl" sx={{ mt: 1 }}>
      {isLoading && renderSkeleton}

      <Stack direction="column" spacing={1}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            backgroundColor: 'background.neutral',
            width: '100%',
            p: 1,
            borderRadius: 1,
          }}
        >
          <BoardsItems
            boards={boards}
            {...{ setSelectedBoard, selectedBoard, isPermissionAdmin }}
          />
        </Stack>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                spacing={1}
                direction="row"
                alignItems="flex-start"
                sx={{
                  p: 0.25,
                  height: 1,
                  overflowY: 'hidden',
                  ...hideScroll.x,
                }}
              >
                {board?.ordered?.map((columnId, index) => (
                  <KanbanColumn
                    key={columnId}
                    index={index}
                    column={board?.columns[columnId]}
                    tasks={board?.tasks}
                  />
                ))}

                {provided.placeholder}

                {selectedBoard && (
                  <KanbanColumnAdd board={boards?.find((b) => b.id === selectedBoard)} />
                )}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      </Stack>
    </Container>
  )
}

type BoardsProps = {
  boards: Array<IKanbanBoard> | undefined
  isPermissionAdmin: boolean
  setSelectedBoard: React.Dispatch<React.SetStateAction<string | null>>
  selectedBoard: string | null
}

const BoardsItems = ({
  boards,
  isPermissionAdmin,
  setSelectedBoard,
  selectedBoard,
}: BoardsProps) => {
  const [isShowBoardsArchived, setIsShowBoardsArchived] = useState(false)

  return (
    <Stack direction="row" sx={{ overflowX: 'auto' }} spacing={1}>
      {isPermissionAdmin && (
        <>
          <MenuPopover
            arrow="top-right"
            sx={{ width: 250 }}
            renderContent={(onClose) => (
              <MenuItem
                onClick={(event) => {
                  setIsShowBoardsArchived((prevState) => !prevState)

                  onClose()
                  event.preventDefault()
                }}
              >
                <FormControlLabel
                  sx={{ ml: 2 }}
                  control={<Checkbox checked={isShowBoardsArchived} sx={{ width: 10 }} />}
                  label={
                    isShowBoardsArchived
                      ? 'Ocultar Quadros Arquivados'
                      : 'Mostrar Quadros Arquivados'
                  }
                />
              </MenuItem>
            )}
          />

          <KanbanBoardAdd />
        </>
      )}

      {boards
        ?.filter((board) => (isShowBoardsArchived ? true : !board.archived))
        .map((board, index) => (
          <BoardActions key={index} {...{ setSelectedBoard, selectedBoard, board }} />
        ))}
    </Stack>
  )
}
