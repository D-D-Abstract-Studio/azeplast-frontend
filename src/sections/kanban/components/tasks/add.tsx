import { mutate } from 'swr'
import { useState } from 'react'

import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import InputBase, { inputBaseClasses } from '@mui/material/InputBase'

import { axios } from '@/utils/axios'
import { enqueueSnackbar } from 'notistack'

import { priorityValues } from '@/shared/priorityValues'

import { endpoints } from '@/constants/config'

import { useRequestSWR } from '@/hooks/use-request'

import { IKanbanColumn, IKanbanTask } from '@/types/kanban'
import { User } from '@/types/user'

type Props = {
  onCloseAddTask: VoidFunction
  column: IKanbanColumn
}

export const KanbanTaskAdd = ({ onCloseAddTask, column }: Props) => {
  const { data: user } = useRequestSWR<User>({
    url: endpoints.user.getUser,
  })

  const [name, setName] = useState('')

  const handleAddTask = async (name: string) => {
    const tempId = Math.random().toString(36).slice(2, 9)

    const newTask = {
      _id: tempId,
      name,
      archived: false,
      priority: priorityValues[0],
      categories: [],
      description: '...',
      assignee: [],
      dueDate: new Date(),
      userId: user?._id ?? '',
    }

    mutate<Array<IKanbanTask>>(
      endpoints.tasks.getAllTasks,
      (prev) => [...(prev ?? []), newTask],
      false
    )

    mutate<Array<IKanbanColumn>>(
      endpoints.columns.getAllColumns,
      (prev) =>
        prev?.map((columnItem) =>
          columnItem.id === column.id
            ? { ...columnItem, taskIds: [...columnItem.taskIds, tempId] }
            : columnItem
        ) ?? [],
      false
    )

    try {
      const response = await axios.post<IKanbanTask>(endpoints.tasks.createTask, newTask)

      mutate<Array<IKanbanTask>>(
        endpoints.tasks.getAllTasks,
        (prev) =>
          prev?.map((task) => (task._id === tempId ? { ...task, _id: response.data._id } : task)) ??
          [],
        false
      )

      mutate<Array<IKanbanColumn>>(
        endpoints.columns.getAllColumns,
        (prev) =>
          prev?.map((column) =>
            column.id === column.id
              ? {
                  ...column,
                  taskIds: column.taskIds.map((id) => (id === tempId ? response.data._id : id)),
                }
              : column
          ) ?? [],
        false
      )

      await axios.put(endpoints.columns.updateColumn(column.id), {
        ...column,
        taskIds: [...column.taskIds, response.data._id],
      })

      enqueueSnackbar('Tarefa criada com sucesso')
    } catch (error) {
      mutate(endpoints.tasks.getAllTasks)
      mutate(endpoints.columns.getAllColumns)

      enqueueSnackbar((error as any)?.message, {
        variant: 'error',
        autoHideDuration: 8000,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
      })
    }

    onCloseAddTask()
  }

  const handleKeyUpAddTask = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      await handleAddTask(name)
    }
  }

  const handleClickAddTask = () => {
    if (name) {
      handleAddTask(name)
    } else {
      onCloseAddTask()
    }
  }

  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value)

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
