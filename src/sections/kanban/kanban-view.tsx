'use client'

import { useEffect, useState } from 'react'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'

import { hideScroll } from '@/theme/css'

import { useRequest } from '@/hooks/use-request'

import { endpoints, userCurrency } from '@/constants/config'

import { Alert, Button, Card, Typography } from '@mui/material'

import { KanbanColumnSkeleton } from './components/kanban-skeleton'
import { KanbanColumnAdd } from './components/column/kanban-column-add'
import { KanbanColumn } from './components/column/kanban-column'
import { BoardsItems } from './components/BoardsItems'

import { onDragEnd } from './shared/onDragEnd'
import { boardMescle } from './shared/boardMescle'

import { ArchivedList } from '@/sections/archived'

import { IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

import { User } from '@/types/user'

export const KanbanView = () => {
  const [showArchived, setShowArchived] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)

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

  const board = boardMescle({ selectedBoard, boards, columns, tasks })

  const isPermissionAdmin = user?.permissions === 'admin'

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
            <Button onClick={() => setShowArchived((prevState) => !prevState)}>
              {showArchived ? 'Arquivados' : 'Kanban'}
            </Button>
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
            <BoardsItems {...{ boards, setSelectedBoard, selectedBoard, isPermissionAdmin }} />
          </Stack>
        </Stack>

        <DragDropContext onDragEnd={onDragEnd(board)}>
          {showArchived ? (
            <ArchivedList />
          ) : (
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
          )}
        </DragDropContext>
      </Stack>
    </Container>
  )
}
