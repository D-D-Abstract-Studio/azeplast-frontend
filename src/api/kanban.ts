import { mutate } from 'swr'

import {
  IKanbanColumn,
  IKanbanTask,
  IKanban /*  IKanbanBoard */,
  IKanbanBoard,
} from '@/types/kanban'
import { endpoints } from '../constants/config'
import { axios } from '../utils/axios'

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

export async function moveColumn(newOrdered: string[]) {
  // const data = { newOrdered };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'move-column' } });

  console.log('moveColumn')
  console.log(newOrdered)
}

export async function createTask(columnId: string, taskData: IKanbanTask) {
  // const data = { columnId, taskData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'create-task' } });

  console.log('createTask')
  console.log(columnId)
  console.log(taskData)
}

export async function updateTask(taskData: IKanbanTask) {
  // const data = { taskData };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'update-task' } });

  console.log('updateTask')
  console.log(taskData)
}

export async function moveTask(updateColumns: Record<string, IKanbanColumn>) {
  // const data = { updateColumns };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'move-task' } });

  console.log('moveTask')
  console.log(updateColumns)
}

export async function deleteTask(columnId: string, taskId: string) {
  // const data = { columnId, taskId };
  // await axios.post(endpoints.kanban, data, { params: { endpoint: 'delete-task' } });

  console.log('deleteTask')
  console.log(columnId)
  console.log(taskId)
}
