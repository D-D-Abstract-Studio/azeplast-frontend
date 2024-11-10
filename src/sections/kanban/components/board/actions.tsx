import { useState, MouseEvent } from 'react'
import { Box, Menu, MenuItem, Stack, Typography, Button } from '@mui/material'
import { ConfirmDialog } from '@/components/custom-dialog'

import { useBoolean } from '@/hooks/use-boolean'

import { IKanbanBoard, IKanbanColumn } from '@/types/kanban'

import { axios } from '@/utils/axios'

import { endpoints } from '@/constants/config'

import { enqueueSnackbar } from 'notistack'

import { Iconify } from '@/components/iconify'
import { UpdateBoard } from './update'
import { mutate } from 'swr'
import { useRequestSWR } from '@/hooks/use-request'
import { User } from '@/types/user'

type Props = {
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>
  setSelectedBoard: React.Dispatch<React.SetStateAction<string | null>>
  selectedBoard: string | null
  board: IKanbanBoard
}

export const BoardActions = ({
  setShowArchived,
  setSelectedBoard,
  selectedBoard,
  board,
}: Props) => {
  const confirmDialogDelete = useBoolean()
  const dialogEdit = useBoolean()

  const { data: columns } = useRequestSWR<Array<IKanbanColumn>>({
    url: endpoints.columns.getAllColumns,
  })

  const { data: user } = useRequestSWR<User>({
    url: endpoints.user.getUser,
  })

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const isPermissionAdmin = user?.permissions === 'admin'

  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <ContextMenuButton
        selected={selectedBoard === board.id}
        onClick={(event) => handleMouseDown(event)}
        onRightClick={(event) => {
          setAnchorEl(event.currentTarget)
        }}
      >
        {board.name}
      </ContextMenuButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            dialogEdit.onTrue()
            handleClose()
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:pencil" />

            <Typography variant="body2">Editar</Typography>
          </Stack>
        </MenuItem>

        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            confirmDialogDelete.onTrue()
            handleClose()
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="tabler:trash-filled" />

            <Typography variant="body2">Deletar</Typography>
          </Stack>
        </MenuItem>
      </Menu>

      {dialogEdit.value && <UpdateBoard board={board} dialogEdit={dialogEdit} />}

      <ConfirmDialog
        open={confirmDialogDelete.value}
        onClose={confirmDialogDelete.onFalse}
        title="Deletar"
        content={
          <>
            Você quer mesmo deletar o quadro?
            <Box sx={{ typography: 'caption', color: 'error.main', mt: 2 }}>
              <strong>Aviso: </strong> Todos as colunas e tasks relacionados a este quadro também
              serão deletados.
            </Box>
          </>
        }
        action={
          <Button variant="outlined" color="error" onClick={() => deleteBoardData(board)}>
            Deletar
          </Button>
        }
      />
    </>
  )

  function handleMouseDown(event: MouseEvent<HTMLButtonElement>) {
    switch (event.button) {
      case 0:
        setSelectedBoard(board.id)
        break
      case 2:
        isPermissionAdmin && setAnchorEl(event.currentTarget)
        break
    }

    setShowArchived(false)
  }

  async function deleteBoardData(board: IKanbanBoard) {
    const columnDeletionPromises = board.columnIds.map(async (columnId: string) => {
      columns?.map(async (column) => {
        if (column.id === columnId) await axios.delete(endpoints.tasks.updateTask(columnId))
      })

      await axios.delete(endpoints.columns.updateColumn(columnId))
    })

    await Promise.all(columnDeletionPromises).then(() => {
      mutate(endpoints.columns.getAllColumns)
      mutate(endpoints.tasks.getAllTasks)
    })

    await axios.delete(endpoints.boards.updateBoard(board.id)).then(() => {
      enqueueSnackbar('Quadro deletado com sucesso')
      setSelectedBoard(null)

      mutate(endpoints.boards.getAllBoards)
      confirmDialogDelete.onFalse()
    })
  }
}

type ContextMenuButtonProps = {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
  onRightClick: (event: MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}

const ContextMenuButton = ({
  onClick,
  selected,
  onRightClick,
  children,
}: ContextMenuButtonProps & {
  selected: boolean
}) => {
  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onRightClick(event)
  }

  return (
    <Button
      variant="soft"
      sx={{
        minWidth: '150px',
        border: '1px solid',
        borderColor: selected ? 'text.secondary' : 'transparent',
      }}
      onClick={onClick}
      onContextMenu={handleContextMenu}
    >
      {children}
    </Button>
  )
}
