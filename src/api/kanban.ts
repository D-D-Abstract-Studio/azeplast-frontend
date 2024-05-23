import { mutate } from 'swr'

import { IKanbanColumn, IKanbanTask, IKanban } from '@/types/kanban'
import { endpoints } from '../constants/config'

const URL = endpoints.kanban.getAllTasks

export async function createColumn(columnData: IKanbanColumn) {
  // const data = { columnData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-column' } });

  console.log(columnData)

  mutate(
    URL,
    (currentData: any) => {
      const board = currentData.board as IKanban

      console.log(board)

      const columns = {
        ...board.columns,
        // add new column in board.columns
        [columnData.id]: columnData,
      }

      // add new column in board.ordered
      const ordered = [...board.ordered, columnData.id]

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          ordered,
        },
      }
    },
    false
  )
}

export async function updateColumn(columnId: string, columnName: string) {
  // const data = { columnId, columnName };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-column' } });

  mutate(
    URL,
    (currentData: any) => {
      const board = currentData.board as IKanban

      // current column
      const column = board.columns[columnId]

      const columns = {
        ...board.columns,
        // update column in board.columns
        [column.id]: {
          ...column,
          name: columnName,
        },
      }

      return {
        ...currentData,
        board: {
          ...board,
          columns,
        },
      }
    },
    false
  )
}

export async function moveColumn(newOrdered: string[]) {
  mutate(
    URL,
    (currentData: any) => {
      const board = currentData.board as IKanban

      // update ordered in board.ordered
      const ordered = newOrdered

      return {
        ...currentData,
        board: {
          ...board,
          ordered,
        },
      }
    },
    false
  )

  // const data = { newOrdered };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'move-column' } });
}

export async function deleteColumn(columnId: string) {
  // const data = { columnId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'delete-column' } });

  mutate<IKanban>(
    URL,
    (currentData) => {
      console.log(currentData)
      // current column
      const column = currentData?.columns[columnId]

      // delete column in board.columns
      delete currentData?.columns[columnId]

      // delete tasks in board.tasks
      column?.taskIds.forEach((key: string) => {
        delete currentData?.tasks[key]
      })

      // delete column in board.ordered
      const boardOrdered = currentData?.ordered.filter((id: string) => id !== columnId)

      return {
        ...currentData,
        ...boardOrdered,
        columns: currentData?.columns || {},
        tasks: currentData?.tasks || {},
        ordered: boardOrdered || [],
      }
    },
    false
  )
}

export async function createTask(columnId: string, taskData: IKanbanTask) {
  // const data = { columnId, taskData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-task' } });

  mutate(
    URL,
    (currentData: any) => {
      const board = currentData.board as IKanban

      // current column
      const column = board.columns[columnId]

      const columns = {
        ...board.columns,
        [columnId]: {
          ...column,
          // add task in column
          taskIds: [...column.taskIds, taskData.id],
        },
      }

      // add task in board.tasks
      const tasks = {
        ...board.tasks,
        [taskData.id]: taskData,
      }

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          tasks,
        },
      }
    },
    false
  )
}

export async function updateTask(taskData: IKanbanTask) {
  // const data = { taskData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-task' } });

  mutate(
    URL,
    (currentData: any) => {
      const board = currentData.board as IKanban

      const tasks = {
        ...board.tasks,
        // add task in board.tasks
        [taskData.id]: taskData,
      }
      return {
        ...currentData,
        board: {
          ...board,
          tasks,
        },
      }
    },
    false
  )
}

export async function moveTask(updateColumns: Record<string, IKanbanColumn>) {
  /* @ts-ignore */
  mutate(
    URL,
    (currentData: { board: IKanban }) => {
      const board = currentData.board as IKanban

      // update board.columns
      const columns = updateColumns

      return {
        ...currentData,
        board: {
          ...board,
          columns,
        },
      }
    },
    false
  )

  // const data = { updateColumns };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'move-task' } });
}

export async function deleteTask(columnId: string, taskId: string) {
  // const data = { columnId, taskId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'delete-task' } });

  mutate(
    URL,
    (currentData: any) => {
      const board = currentData.board as IKanban

      const { tasks } = board

      // current column
      const column = board.columns[columnId]

      const columns = {
        ...board.columns,
        [column.id]: {
          ...column,
          // delete tasks in column          taskIds: column.taskIds.filter((id: string) => id !== taskId),
        },
      }

      // delete tasks in board.tasks
      delete tasks[taskId]

      return {
        ...currentData,
        board: {
          ...board,
          columns,
          tasks,
        },
      }
    },
    false
  )
}
