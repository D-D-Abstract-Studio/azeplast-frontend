import { useState, useCallback } from 'react'
import { mutate } from 'swr'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { inputBaseClasses } from '@mui/material/InputBase'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useBoolean } from '@/hooks/use-boolean'

import { Iconify } from '@/components/iconify'
import { IKanbanColumn } from '@/types/kanban'
import { axios } from '@/utils/axios'
import { endpoints } from '@/constants/config'
import { enqueueSnackbar } from 'notistack'

type Props = {
  boardId: string
}

export const KanbanColumnAdd = ({ boardId }: Props) => {
  const [columnName, setColumnName] = useState('')

  const openAddColumn = useBoolean()

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(event.target.value)
  }, [])

  const createColumn = async (columnData: Pick<IKanbanColumn, 'name'>) =>
    await axios
      .post(endpoints.columns.getAllColumns, {
        ...columnData,
        boardId,
        taskIds: [],
        archived: false,
      })
      .then(() => {
        enqueueSnackbar('Coluna criada com sucesso')

        mutate(endpoints.boards.getAllBoards)
      })

  const handleCreateColumn = useCallback(async () => {
    try {
      if (columnName) {
        createColumn({ name: columnName })
        setColumnName('')
      }
      openAddColumn.onFalse()
    } catch (error) {
      console.error(error)
    }
  }, [columnName, openAddColumn])

  const handleKeyUpCreateColumn = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleCreateColumn()
      }
    },
    [handleCreateColumn]
  )

  return (
    <Paper sx={{ minWidth: 280, width: 280 }}>
      {openAddColumn.value ? (
        <ClickAwayListener onClickAway={handleCreateColumn}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Nova Coluna"
            value={columnName}
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
          onClick={openAddColumn.onTrue}
        >
          Coluna
        </Button>
      )}
    </Paper>
  )
}
