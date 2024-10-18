import { mutate } from 'swr'
import { axios } from '@/utils/axios'
import { DropResult } from '@hello-pangea/dnd'
import { endpoints } from '@/constants/config'
import { IKanban, IKanbanBoard, IKanbanColumn } from '@/types/kanban'

export const onDragEnd =
  (board: IKanbanBoard & Pick<IKanban, 'columns' | 'tasks'>) =>
  async ({ destination, source, draggableId, type }: DropResult) => {
    if (!destination) {
      return
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Moving column
    if (type === 'COLUMN') {
      const newOrdered = [...board.ordered]
      newOrdered.splice(source.index, 1)
      newOrdered.splice(destination.index, 0, draggableId)

      // Optimistic update
      mutate(
        endpoints.boards.getAllBoards,
        (prev: any) => {
          return prev.map((b: any) => (b.id === board.id ? { ...b, ordered: newOrdered } : b))
        },
        false
      )

      try {
        await axios.put(endpoints.boards.updateBoard(board.id), {
          ...board,
          ordered: newOrdered,
        })
        mutate(endpoints.boards.getAllBoards)
      } catch (error) {
        mutate(endpoints.boards.getAllBoards) // Revert on error
      }

      return
    }

    const sourceColumn = board?.columns[source.droppableId]
    const destinationColumn = board?.columns[destination.droppableId]

    // Moving task to same list
    if (sourceColumn.id === destinationColumn.id) {
      const newTaskIds = [...sourceColumn.taskIds]
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)

      // Optimistic update
      mutate(
        endpoints.columns.getAllColumns,
        (prev: any) => {
          return prev.map((col: any) =>
            col.id === sourceColumn.id ? { ...col, taskIds: newTaskIds } : col
          )
        },
        false
      )

      try {
        await axios.put<IKanbanColumn>(endpoints.columns.updateColumn(sourceColumn.id), {
          ...sourceColumn,
          taskIds: newTaskIds,
        })
        mutate(endpoints.columns.getAllColumns)
      } catch (error) {
        mutate(endpoints.columns.getAllColumns) // Revert on error
      }

      return
    }

    // Moving task to different list
    const sourceTaskIds = [...sourceColumn.taskIds]
    const destinationTaskIds = [...destinationColumn.taskIds]
    // Remove from source
    sourceTaskIds.splice(source.index, 1)

    // Insert into destination
    destinationTaskIds.splice(destination.index, 0, draggableId)

    // Optimistic update
    mutate(
      endpoints.columns.getAllColumns,
      (prev: any) => {
        return prev.map((col: any) => {
          if (col.id === sourceColumn.id) {
            return { ...col, taskIds: sourceTaskIds }
          }
          if (col.id === destinationColumn.id) {
            return { ...col, taskIds: destinationTaskIds }
          }
          return col
        })
      },
      false
    )

    try {
      await axios.put<IKanbanColumn>(endpoints.columns.updateColumn(sourceColumn.id), {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      })

      await axios.put<IKanbanColumn>(endpoints.columns.updateColumn(destinationColumn.id), {
        ...destinationColumn,
        taskIds: destinationTaskIds,
      })

      mutate(endpoints.columns.getAllColumns)
    } catch (error) {
      mutate(endpoints.columns.getAllColumns) // Revert on error
    }
  }
