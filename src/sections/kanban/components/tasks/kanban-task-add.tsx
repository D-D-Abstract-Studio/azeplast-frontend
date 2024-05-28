import { useState, useCallback } from 'react'

import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import InputBase, { inputBaseClasses } from '@mui/material/InputBase'
import { axios } from '@/utils/axios'
import { endpoints, userCurrency } from '@/constants/config'
import { enqueueSnackbar } from 'notistack'
import { IKanbanColumn, IKanbanTask, priorityValues } from '@/types/kanban'
import dayjs from 'dayjs'
import { mutate } from 'swr'

type Props = {
  onCloseAddTask: VoidFunction
  column: IKanbanColumn
}

export default function KanbanTaskAdd({ onCloseAddTask, column }: Props) {
  const [name, setName] = useState('')

  const handleAddTask = async (name: string) =>
    await axios
      .post<IKanbanTask>(endpoints.tasks.createTask, {
        name,
        archived: false,
        priority: priorityValues[0],
        categories: [],
        description: 'asdsa',
        assignee: [],
        dueDate: dayjs().format('DD/MM/YYYY'),
        reporter: userCurrency,
      })
      .then(async (response) => {
        await axios
          .put(endpoints.columns.updateColumn(column.id), {
            ...column,
            taskIds: [...column.taskIds, response.data.id],
          })
          .then(() => {
            mutate(endpoints.columns.getAllColumns)
          })

        enqueueSnackbar('Tarefa criada com sucesso')
        mutate(endpoints.tasks.getAllTasks)

        onCloseAddTask()
      })

  const handleKeyUpAddTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (name) {
          handleAddTask(name)
        }
      }
    },
    [name, handleAddTask]
  )

  const handleClickAddTask = useCallback(() => {
    if (name) {
      handleAddTask(name)
    } else {
      onCloseAddTask()
    }
  }, [name, handleAddTask, onCloseAddTask])

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
