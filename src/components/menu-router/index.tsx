import { useState, useCallback } from 'react'

import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { inputBaseClasses } from '@mui/material/InputBase'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import { useBoolean } from '@/hooks/use-boolean'

import uuidv4 from '@/utils/uuidv4'

import { createColumn } from '@/api/kanban'

import { Box } from '@mui/material'
import { Iconify } from '@/components/iconify'

export const MenuRouter = () => {
  const [columnName, setColumnName] = useState('')

  const openAddColumn = useBoolean()

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setColumnName(event.target.value)
  }, [])

  const handleCreateColumn = useCallback(async () => {
    try {
      if (columnName) {
        createColumn({
          id: uuidv4(),
          name: columnName,
          taskIds: [],
        })
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
    <Paper sx={{ minWidth: 300 }}>
      <Box sx={{ p: 1 }}>
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
            sx={{ width: 100 }}
            size="large"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" sx={{ mr: -0.5 }} />}
            onClick={openAddColumn.onTrue}
          >
            Painel
          </Button>
        )}
      </Box>
    </Paper>
  )
}
