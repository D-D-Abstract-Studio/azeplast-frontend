import { useState, MouseEvent, useEffect } from 'react'

import { Box, Button, Menu, MenuItem } from '@mui/material'
import { ConfirmDialog } from '@/components/custom-dialog'

import { useBoolean } from '@/hooks/use-boolean'

import { IKanbanBoard } from '@/types/kanban'

import { axios } from '@/utils/axios'

import { endpoints } from '@/constants/config'

import { enqueueSnackbar } from 'notistack'

import { handleTouchStart } from './shared/handleTouchStart'

type Props = {
  setSelectedBoard: React.Dispatch<React.SetStateAction<string | null>>
  selectedBoard: string | null
  board: IKanbanBoard
}

export const BoardActions = ({ setSelectedBoard, selectedBoard, board }: Props) => {
  const dialogEdit = useBoolean()
  const confirmDialogDelete = useBoolean()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [lastTap, setLastTap] = useState<number>(0)

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    switch (event.button) {
      case 0:
        setSelectedBoard(board.id)
        break
      case 2:
        setAnchorEl(event.currentTarget)
        break
    }
  }

  const handleClose = () => setAnchorEl(null)

  const handleContextMenu = (event: Event) => event.preventDefault()

  // Prevent context menu default on touch devices
  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener(
      'touchstart',
      (event) => handleTouchStart(lastTap, setLastTap, setAnchorEl, event),
      { passive: false }
    )

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('touchstart', (event) =>
        handleTouchStart(lastTap, setLastTap, setAnchorEl, event)
      )
    }
  }, [lastTap])

  return (
    <>
      <Button
        variant="soft"
        onMouseDown={handleMouseDown}
        onContextMenu={(event) => event.preventDefault()}
        sx={{
          minWidth: '150px',
          border: '1px solid',
          borderColor: selectedBoard === board.id ? 'text.secondary' : 'transparent',
        }}
      >
        {board.name}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            dialogEdit.onTrue()
            handleClose()
          }}
        >
          Editar
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSelectedBoard(board.id)
            handleClose()
          }}
        >
          Deletar
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={dialogEdit.value}
        onClose={dialogEdit.onFalse}
        title="Delete"
        content={<>Are you sure want to delete column?</>}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleClose()
              dialogEdit.onFalse()
            }}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmDialogDelete.value}
        onClose={confirmDialogDelete.onFalse}
        title="Delete"
        content={
          <>
            Você quer mesmo excluir o quadro?
            <Box sx={{ typography: 'caption', color: 'error.main', mt: 2 }}>
              <strong>Aviso: </strong> Todos as colunas e tasks relacionados a este quadro também
              serão excluídos.
            </Box>
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              axios
                .delete<{ message: string }>(endpoints.boards.deleteBoard(board.id))
                .then(({ data }) => {
                  enqueueSnackbar(data.message, { variant: 'success' })
                  setSelectedBoard(null)
                })
            }
          >
            Delete
          </Button>
        }
      />
    </>
  )
}
