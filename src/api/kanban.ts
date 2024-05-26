import { mutate } from 'swr'

import { IKanbanColumn, IKanbanTask, IKanban /*  IKanbanBoard */ } from '@/types/kanban'
import { endpoints } from '../constants/config'

const URL = endpoints.kanban.getAllTasks
/*
export async function createBoard(boardData: IKanbanBoard) {
  // const data = { columnData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-column' } });

  mutate<IKanban>(
    URL,
    (currentData) => {
      const columns = {
        ...currentData?.columns,
        // add new column in board.columns
        [boardData.id]: boardData,
      }

      // add new column in board.ordered
      const ordered = [...(currentData?.ordered ?? []), boardData.id]

      return {
        tasks: currentData?.tasks || {},
        columns,
        ordered,
      }
    },
    false
  )
} */

export async function createColumn(columnData: IKanbanColumn) {
  // const data = { columnData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-column' } });

  console.log(columnData)

  mutate<IKanban>(
    URL,
    (currentData) => {
      const columns = {
        ...currentData?.columns,
        // add new column in board.columns
        [columnData.id]: columnData,
      }

      // add new column in board.ordered
      const ordered = [...(currentData?.ordered ?? []), columnData.id]

      return {
        tasks: currentData?.tasks || {},
        columns,
        ordered,
      }
    },
    false
  )
}

export async function updateColumn(columnId: string, columnName: string) {
  // const data = { columnId, columnName };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-column' } });

  mutate<IKanban>(
    URL,
    (currentData) => {
      // current column
      const column = currentData?.columns[columnId]

      const columns = {
        ...currentData?.columns,
        // update column in board.columns
        [column?.id || '']: {
          ...column,
          name: columnName,
        },
      } as Record<string, IKanbanColumn>

      return {
        columns,
        tasks: currentData?.tasks || {},
        ordered: currentData?.ordered || [],
      }
    },
    false
  )
}

export async function moveColumn(newOrdered: string[]) {
  mutate<IKanban>(
    URL,
    (currentData) => {
      // update ordered in board.ordered
      const ordered = newOrdered

      return {
        tasks: currentData?.tasks || {},
        columns: currentData?.columns || {},
        ordered,
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

  mutate<IKanban>(
    URL,
    (currentData: any) => {
      // current column
      const column = currentData?.columns[columnId]

      const columns = {
        ...currentData?.columns,
        [columnId]: {
          ...column,
          // add task in column
          taskIds: [...column.taskIds, taskData.id],
        },
      }

      // add task in board.tasks
      const tasks = {
        ...currentData?.tasks,
        [taskData.id]: taskData,
      }

      return {
        columns,
        tasks,
        ordered: currentData?.ordered || [],
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
  mutate<IKanban>(
    URL,
    (currentData) => {
      // update board.columns
      const columns = updateColumns

      return {
        columns,
        tasks: currentData?.tasks || {},
        ordered: currentData?.ordered || [],
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

  mutate<IKanban>(
    URL,
    (currentData) => {
      // current column
      const column = currentData?.columns[columnId]

      const columns = {
        ...currentData?.columns,
        [column?.id || '']: {
          ...column,
          // delete tasks in column
          taskIds: column?.taskIds.filter((id: string) => id !== taskId),
        } as IKanbanColumn,
      }

      // delete tasks in board.tasks
      delete currentData?.tasks[taskId]

      return {
        columns,
        tasks: currentData?.tasks || {},
        ordered: currentData?.ordered || [],
      }
    },
    false
  )
}
