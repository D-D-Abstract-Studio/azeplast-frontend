'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import { hideScroll } from '@/theme/css'

import { useRequest } from '@/hooks/use-request'

import { endpoints, userCurrency } from '@/constants/config'

import { IKanban, IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

import { Alert, Button, Card, Typography } from '@mui/material'

import { KanbanColumnSkeleton } from './components/kanban-skeleton'
import { KanbanColumnAdd } from './components/column/kanban-column-add'
import { KanbanColumn } from './components/column/kanban-column'
import { BoardsItems } from './components/BoardsItems'

import { User } from '@/types/user'
import { axios } from '@/utils/axios'
import { mutate } from 'swr'

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

    return {
      ...board,
      columns: columnsMapped,
      tasks: tasksMapped,
    }
  }, [boards, columns, tasks, selectedBoard]) as IKanbanBoard & Pick<IKanban, 'columns' | 'tasks'>

  const isPermissionAdmin = user?.permissions === 'admin'

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }: DropResult) => {
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

        await axios
          .put(endpoints.boards.updateBoard(board.id), {
            ...board,
            ordered: newOrdered,
          })
          .then(() => mutate(endpoints.boards.getAllBoards))

        return
      }

      const sourceColumn = board?.columns[source.droppableId]

      const destinationColumn = board?.columns[destination.droppableId]

      // Moving task to same list
      if (sourceColumn.id === destinationColumn.id) {
        const newTaskIds = [...sourceColumn.taskIds]

        newTaskIds.splice(source.index, 1)

        newTaskIds.splice(destination.index, 0, draggableId)

        axios
          .put<IKanbanColumn>(endpoints.columns.updateColumn(sourceColumn.id), {
            ...sourceColumn,
            taskIds: newTaskIds,
          })
          .then(() => mutate(endpoints.columns.getAllColumns))

        return
      }

      // Moving task to different list
      const sourceTaskIds = [...sourceColumn.taskIds]

      const destinationTaskIds = [...destinationColumn.taskIds]

      // Remove from source
      sourceTaskIds.splice(source.index, 1)

      // Insert into destination
      destinationTaskIds.splice(destination.index, 0, draggableId)

      await axios.put<IKanbanColumn>(endpoints.columns.updateColumn(sourceColumn.id), {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      })

      await axios.put<IKanbanColumn>(endpoints.columns.updateColumn(destinationColumn.id), {
        ...destinationColumn,
        taskIds: destinationTaskIds,
      })

      mutate(endpoints.columns.getAllColumns)
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
        <Stack direction="row" spacing={1} alignItems="center">
          <Card sx={{ p: 1, borderRadius: 1, cursor: 'pointer' }}>
            <Button onClick={() => setSelectedBoard(null)}>Voltar</Button>
          </Card>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              p: 1,
              width: '100%',
              backgroundColor: 'background.neutral',
              borderRadius: 1,
            }}
          >
            <BoardsItems
              boards={boards}
              {...{ setSelectedBoard, selectedBoard, isPermissionAdmin }}
            />
          </Stack>
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
                  <KanbanColumnAdd board={boards?.find((board) => board.id === selectedBoard)} />
                )}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      </Stack>
    </Container>
  )
}
