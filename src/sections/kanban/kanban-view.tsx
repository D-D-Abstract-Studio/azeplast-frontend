'use client'

import { useCallback, useEffect, useState } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import { hideScroll } from '@/theme/css'

import { moveColumn, moveTask } from '@/api/kanban'

import { useRequest } from '@/hooks/use-request'

import { endpoints, userCurrency } from '@/constants/config'

import { IKanbanBoard } from '@/types/kanban'

import { Alert, Checkbox, FormControlLabel, MenuItem, Typography } from '@mui/material'
import { MenuPopover } from '@/components/MenuPopover'

import { KanbanColumnAdd } from './components/kanban-column-add'
import { KanbanColumnSkeleton } from './components/kanban-skeleton'
import { KanbanBoardAdd } from './components/board/add'
import { BoardActions } from './components/board/actions'

import { User } from '@/types/user'

export const KanbanView = () => {
  const { data: boards, isLoading } = useRequest<{ items: Array<IKanbanBoard> }>({
    url: endpoints.boards.getAllBoards,
  })

  const { data: user } = useRequest<User>({
    url: endpoints.user.getUser,
  })

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)

  const isPermissionAdmin = user?.permissions === 'admin'

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }: DropResult) => {
      console.log({ destination, source, draggableId, type })

      try {
        if (!destination) {
          return
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return
        }

        // Moving column
        if (type === 'COLUMN') {
          const newOrdered = [...boards.ordered]

          newOrdered.splice(source.index, 1)

          newOrdered.splice(destination.index, 0, draggableId)

          moveColumn(newOrdered)
          return
        }

        const sourceColumn = boards?.columns[source.droppableId]

        const destinationColumn = boards?.columns[destination.droppableId]

        // Moving task to same list
        if (sourceColumn.id === destinationColumn.id) {
          const newTaskIds = [...sourceColumn.taskIds]

          newTaskIds.splice(source.index, 1)

          newTaskIds.splice(destination.index, 0, draggableId)

          moveTask({
            ...boards?.columns,
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
          ...boards?.columns,
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
    [boards?.columns, boards?.ordered]
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
    if (boards?.items.length && !selectedBoard) {
      setSelectedBoard(boards.items.filter((board) => !board.archived)[0].id)
    }
  }, [boards?.items, selectedBoard])

  return (
    <Container maxWidth="xl" sx={{ mt: 1 }}>
      {isLoading && renderSkeleton}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <Stack
              ref={provided.innerRef}
              {...provided.droppableProps}
              spacing={3}
              direction="column"
              alignItems="flex-start"
              sx={{
                alignItems: 'center',
                overflowY: 'hidden',
                ...hideScroll.x,
              }}
            >
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
                  boards={boards?.items}
                  {...{ setSelectedBoard, selectedBoard, isPermissionAdmin }}
                />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ width: '100%', p: 1 }}>
                {provided.placeholder}

                {selectedBoard && <KanbanColumnAdd boardId={selectedBoard} />}
              </Stack>

              {/* {boards?.ordered?.map((columnId, index) => (
                <KanbanColumn
                  index={index}
                  key={columnId}
                  column={boards?.columns[columnId]}
                  tasks={boards?.tasks}
                />
              ))} */}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
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
