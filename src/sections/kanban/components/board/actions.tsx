import { useState, MouseEvent, useEffect } from 'react'

import { Box, Button, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { ConfirmDialog } from '@/components/custom-dialog'

import { useBoolean } from '@/hooks/use-boolean'

import { IKanbanBoard } from '@/types/kanban'

import { axios } from '@/utils/axios'

import { endpoints } from '@/constants/config'

import { enqueueSnackbar } from 'notistack'

import { handleTouchStart } from './shared/handleTouchStart'
import { UpdateBoard } from './board-update'
import { mutate } from 'swr'
import { Iconify } from '@/components/iconify'

type Props = {
  setSelectedBoard: React.Dispatch<React.SetStateAction<string | null>>
  selectedBoard: string | null
  board: IKanbanBoard
}

export const BoardActions = ({ setSelectedBoard, selectedBoard, board }: Props) => {
  const confirmDialogDelete = useBoolean()
  const dialogEdit = useBoolean()

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
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:pencil" />

            <Typography variant="body2">Editar</Typography>
          </Stack>
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirmDialogDelete.onTrue()
            handleClose()
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="mdi:archive" />

            <Typography variant="body2">Arquivar</Typography>
          </Stack>
        </MenuItem>
      </Menu>

      <UpdateBoard board={board} dialogEdit={dialogEdit} />

      <ConfirmDialog
        open={confirmDialogDelete.value}
        onClose={confirmDialogDelete.onFalse}
        title="Deletar"
        content={
          <>
            Você quer mesmo arquivar o quadro?
            <Box sx={{ typography: 'caption', color: 'error.main', mt: 2 }}>
              <strong>Aviso: </strong> Todos as colunas e tasks relacionados a este quadro também
              serão arquivados.
            </Box>
          </>
        }
        action={
          <Button
            variant="outlined"
            color="error"
            onClick={async () =>
              await axios
                .put(endpoints.boards.updateBoard(board.id), { ...board, archived: true })
                .then(() => {
                  enqueueSnackbar('Quadro arquivado com sucesso')

                  setSelectedBoard(null)

                  mutate(endpoints.boards.getAllBoards)
                  confirmDialogDelete.onFalse()
                })
            }
          >
            Arquivar
          </Button>
        }
      />
    </>
  )
}
