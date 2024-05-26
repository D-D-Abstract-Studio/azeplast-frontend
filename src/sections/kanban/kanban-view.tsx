'use client'

import { useCallback, useState } from 'react'
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import { hideScroll } from '@/theme/css'

import { moveColumn, moveTask } from '@/api/kanban'

import { KanbanColumn } from './components/kanban-column'
import KanbanColumnAdd from './components/kanban-column-add'
import { KanbanColumnSkeleton } from './components/kanban-skeleton'

import { useRequest } from '@/hooks/use-request'

import { endpoints } from '@/constants/config'
import { KanbanBoardAdd } from './components/board/add'

import { IKanban, IKanbanBoard } from '@/types/kanban'
import { Button } from '@mui/material'
import { BoardActions } from './components/board/actions'

export const KanbanView = () => {
  const { data: boards, isLoading } = useRequest<{ items: Array<IKanbanBoard> }>({
    url: endpoints.boards.getAllBoards,
  })

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)

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
              direction="row"
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
                <KanbanBoardAdd />

                <Stack direction="row" sx={{ overflowX: 'auto' }} spacing={1}>
                  {boards?.items.map((board, index) => (
                    <BoardActions key={index} {...{ setSelectedBoard, selectedBoard, board }} />
                  ))}
                </Stack>
              </Stack>

              {/* {boards?.ordered?.map((columnId, index) => (
                <KanbanColumn
                  index={index}
                  key={columnId}
                  column={boards?.columns[columnId]}
                  tasks={boards?.tasks}
                />
              ))} */}

              {provided.placeholder}

              {/* <KanbanColumnAdd /> */}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  )
}
