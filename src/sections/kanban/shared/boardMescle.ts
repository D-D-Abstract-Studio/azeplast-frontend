'use client'

import { useMemo } from 'react'

import { IKanban, IKanbanBoard, IKanbanColumn, IKanbanTask } from '@/types/kanban'
import { User } from '@/types/user'

type Props = {
  selectedBoard: string | null
  user: User | undefined
  boards: IKanbanBoard[] | undefined
  columns: IKanbanColumn[] | undefined
  tasks: IKanbanTask[] | undefined
}

export const boardMescle = ({ selectedBoard, boards, columns, tasks, user }: Props) => {
  return useMemo(() => {
    if (!selectedBoard || !user) {
      return null
    }

    const board = boards?.find(
      (board) => board.id === selectedBoard && board.usersIds.includes(user._id)
    )

    if (!board) {
      return null
    }

    const columnsFiltered = columns?.filter(
      (column) => column.boardId === selectedBoard && !column.archived
    )

    const columnsMapped = columnsFiltered?.reduce((acc, column) => {
      acc[column.id] = column
      return acc
    }, {} as Record<string, IKanbanColumn>)

    const tasksFiltered = tasks?.filter((task) =>
      columnsFiltered?.some((column) => column.taskIds.includes(task.id))
    )

    const tasksMapped = tasksFiltered?.reduce((acc, task) => {
      acc[task.id] = task
      return acc
    }, {} as Record<string, IKanbanTask>)

    return {
      ...board,
      columns: columnsMapped,
      tasks: tasksMapped,
    }
  }, [boards, columns, tasks, selectedBoard]) as IKanbanBoard & Pick<IKanban, 'columns' | 'tasks'>
}
