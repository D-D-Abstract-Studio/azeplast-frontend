import { useEffect, useState } from 'react'

import { DragDropContext, Droppable } from '@hello-pangea/dnd'

import { useRequestSWR } from '@/hooks/use-request'

import { endpoints, userCurrencyStorage } from '@/constants/config'

import {
  Alert,
  Badge,
  Box,
  Button,
  Stack,
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'

import { KanbanColumnSkeleton } from './components/skeleton'
import { KanbanColumnAdd } from './components/column/add'
import { KanbanColumn } from './components/column/column'

import { onDragEnd } from './shared/onDragEnd'
import { boardMescle } from './shared/boardMescle'

import { ArchivedList } from './unarchive'

import { IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'

import { User } from '@/types/user'
import { Notification } from '@/types/Notification'

import { KanbanBoardAdd } from '@/sections/kanban/components/board/add'
import { BoardActions } from '@/sections/kanban/components/board/actions'
import { Iconify } from '@/components'
import { useBoolean } from '@/hooks/use-boolean'
import { Notifications } from '@/sections/notifications'

export const KanbanView = () => {
  const dialogNotifications = useBoolean()
  const [showArchived, setShowArchived] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)

  const { data: user } = useRequestSWR<User>({
    url: endpoints.user.getUser,
  })

  const { data: boards, isLoading } = useRequestSWR<Array<IKanbanBoard>>({
    url: endpoints.boards.getAllBoards,
  })

  const { data: columns } = useRequestSWR<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: tasks } = useRequestSWR<Array<IKanbanTask>>({
    url: endpoints.tasks.getAllTasks,
  })

  const { data: notifications } = useRequestSWR<Array<Notification>>({
    url: endpoints.notifications.getAllNotifications,
  })

  const isPermissionAdmin = user?.permissions === 'admin'

  const board = boardMescle({ selectedBoard, boards, columns, tasks })

  const isUserValid = userCurrencyStorage !== 'anonymous'

  const isUnreadNotification = notifications?.some(
    (notification) =>
      !notification.view &&
      (notification.assignee?.some((id) => id.userId === user?._id) || isPermissionAdmin)
  )

  useEffect(() => {
    if (boards?.length && !selectedBoard) {
      setSelectedBoard(
        // seleciona o primeiro board que o usuário tem acesso ou é admin
        boards.find((board) => board.usersIds.includes(user?._id || '') || isPermissionAdmin)?.id ||
          null
      )
    }
  }, [boards, user])

  const boardHeader = (
    <Stack direction="row" spacing={1} alignItems="center">
      <Paper sx={{ p: 1, borderRadius: 1, bgcolor: 'background.neutral' }}>
        <ButtonGroup>
          <Button
            variant="soft"
            color="inherit"
            onClick={() => setShowArchived((prevState) => !prevState)}
          >
            {showArchived ? 'Quadros' : 'Arquivados'}
          </Button>

          <Button
            variant="soft"
            color="inherit"
            onClick={() => isUnreadNotification && dialogNotifications.onTrue()}
          >
            <Badge
              {...(isUnreadNotification && {
                badgeContent: <Iconify icon="codicon:circle-filled" color="warning.main" />,
              })}
            >
              <Iconify icon="mdi:bell" />
            </Badge>
          </Button>
        </ButtonGroup>
      </Paper>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{
          p: 1,
          width: '100%',
          backgroundColor: 'background.neutral',
          borderRadius: 1,
        }}
      >
        <KanbanBoardAdd />

        <Grid container sx={{ borderRadius: '0 0 10px 10px', width: '100%' }}>
          <Grid item xs={12} sx={{ width: 100 }}>
            <Stack sx={{ width: '100%', maxHeight: 500 }}>
              <Stack direction="row" sx={{ overflowX: 'auto' }} spacing={1}>
                {boards
                  ?.filter((board) => board.usersIds.includes(user?._id || '') || isPermissionAdmin)
                  .map((board, index) => (
                    <BoardActions
                      key={index}
                      {...{ setSelectedBoard, setShowArchived, selectedBoard, board }}
                    />
                  ))}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  )

  return (
    <Box p={1}>
      {isLoading && (
        <Stack direction="row" alignItems="flex-start" spacing={3}>
          {[...Array(4)].map((_, index) => (
            <KanbanColumnSkeleton key={index} index={index} />
          ))}
        </Stack>
      )}

      {!isLoading && !isUserValid && (
        <Stack p={2}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Você está visualizando a aplicação como um usuário anônimo. Para ter acesso a todas as
              funcionalidades, peça ao administrador para criar uma conta de usuário para você.
            </Typography>
          </Alert>
        </Stack>
      )}

      {!isLoading && isUserValid && (
        <Stack direction="column" spacing={1}>
          {boardHeader}

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
                    }}
                  >
                    {board?.ordered?.map(
                      (columnId, index) =>
                        !board?.columns[columnId]?.archived && (
                          <KanbanColumn
                            key={columnId}
                            index={index}
                            column={board?.columns[columnId]}
                            tasks={board?.tasks}
                          />
                        )
                    )}

                    {provided.placeholder}

                    {selectedBoard && (
                      <KanbanColumnAdd
                        board={boards?.find((board) => board.id === selectedBoard)}
                      />
                    )}
                  </Stack>
                )}
              </Droppable>
            )}
          </DragDropContext>
        </Stack>
      )}

      <Dialog
        fullWidth
        maxWidth="md"
        open={dialogNotifications.value}
        onClose={() => dialogNotifications.onFalse()}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <DialogTitle>Notificações</DialogTitle>

          <IconButton onClick={dialogNotifications.onFalse} sx={{ mx: 2 }}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>

        <DialogContent sx={{ typography: 'body2' }}>
          <Notifications
            notifications={notifications?.filter(
              (notification) =>
                notification.assignee?.some((id) => id.userId === user?._id) || isPermissionAdmin
            )}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
