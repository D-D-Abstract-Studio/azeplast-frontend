import { useState, useCallback } from 'react'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { inputBaseClasses } from '@mui/material/InputBase'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useBoolean } from '@/hooks/use-boolean'

import { axios } from '@/utils/axios'
import { mutate } from 'swr'

import { Iconify } from '@/components/iconify'
import { endpoints, userCurrency } from '@/constants/config'

import { IKanbanBoard } from '@/types/kanban'
import { enqueueSnackbar } from 'notistack'
import { useRequest } from '@/hooks/use-request'
import { User } from '@/types/user'

export const KanbanBoardAdd = () => {
  const [boardName, setBoardName] = useState('')

  const { data } = useRequest<User>({
    url: endpoints.user.getUser(userCurrency),
  })

  const openAddBoard = useBoolean()

  const createBoard = async ({ name }: Pick<IKanbanBoard, 'name'>) => {
    await axios
      .post<{ message: string }>(endpoints.boards.createBoard, {
        name,
        usersIds: [data?._id],
        columnIds: [],
      })
      .then(({ data: { message } }) => {
        enqueueSnackbar(message)

        /* mutate(endpoints.tasks.getAllTasks) */
      })
  }

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setBoardName(event.target.value)
  }, [])

  const handleCreateBoard = useCallback(async () => {
    try {
      if (boardName) {
        createBoard({ name: boardName })
        setBoardName('')
      }
      openAddBoard.onFalse()
    } catch (error) {
      console.error(error)
    }
  }, [boardName, openAddBoard])

  const handleKeyUpCreateColumn = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCreateBoard()
      }
    },
    [handleCreateBoard]
  )

  return (
    <Paper sx={{ minWidth: 280, width: 280 }}>
      {openAddBoard.value ? (
        <ClickAwayListener onClickAway={handleCreateBoard}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Novo Quadro"
            value={boardName}
            onChange={handleChangeName}
            onKeyUp={handleKeyUpCreateColumn}
            sx={{
              [`& .${inputBaseClasses.input}`]: {
                typography: 'h6',
              },
            }}
          />
        </ClickAwayListener>
      ) : (
        <Button
          fullWidth
          size="large"
          color="inherit"
          variant="outlined"
          startIcon={<Iconify icon="mingcute:add-line" size={1.5} />}
          onClick={openAddBoard.onTrue}
        >
          Quadro
        </Button>
      )}
    </Paper>
  )
}
