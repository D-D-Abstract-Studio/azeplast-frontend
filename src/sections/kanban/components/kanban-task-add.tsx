import { useState, useCallback, useMemo } from 'react'

import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import InputBase, { inputBaseClasses } from '@mui/material/InputBase'
// _mock
import { _mock } from '@/_mock'

import uuidv4 from '@/utils/uuidv4'

import { IKanbanTask } from '@/types/kanban'

type Props = {
  status: string
  onCloseAddTask: VoidFunction
  onAddTask: (task: IKanbanTask) => void
}

export default function KanbanTaskAdd({ status, onAddTask, onCloseAddTask }: Props) {
  const [name, setName] = useState('')

  const defaultTask: IKanbanTask = useMemo(
    () => ({
      id: uuidv4(),
      name: name,
      status: 'todo',
      priority: 'low',
      categories: ['frontend'],
      description: 'Description',
      assignee: [
        {
          id: '1',
          name: _mock.fullName(2),
        },
      ],
      dueDate: new Date(),
      reporter: {
        id: '1',
        name: 'John Doe',
      },
    }),
    [name, status]
  )

  const handleKeyUpAddTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (name) {
          onAddTask(defaultTask)
        }
      }
    },
    [defaultTask, name, onAddTask]
  )

  const handleClickAddTask = useCallback(() => {
    if (name) {
      onAddTask(defaultTask)
    } else {
      onCloseAddTask()
    }
  }, [defaultTask, name, onAddTask, onCloseAddTask])

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }, [])

  return (
    <ClickAwayListener onClickAway={handleClickAddTask}>
      <Paper
        sx={{
          borderRadius: 1.5,
          bgcolor: 'background.default',
          boxShadow: (theme) => theme.customShadows.z1,
        }}
      >
        <InputBase
          autoFocus
          multiline
          fullWidth
          placeholder="Task name"
          value={name}
          onChange={handleChangeName}
          onKeyUp={handleKeyUpAddTask}
          sx={{
            px: 2,
            height: 56,
            [`& .${inputBaseClasses.input}`]: {
              typography: 'subtitle2',
            },
          }}
        />
      </Paper>
    </ClickAwayListener>
  )
}
