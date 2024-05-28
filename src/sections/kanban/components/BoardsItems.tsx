import { useState } from 'react'

import { Checkbox, FormControlLabel, MenuItem, Stack } from '@mui/material'
import { MenuPopover } from '@/components/MenuPopover'

import { KanbanBoardAdd } from './board/board-add'
import { BoardActions } from './board/board-actions'

import { IKanbanBoard } from '@/types/kanban'

type BoardsProps = {
  boards: Array<IKanbanBoard> | undefined
  isPermissionAdmin: boolean
  setSelectedBoard: React.Dispatch<React.SetStateAction<string | null>>
  selectedBoard: string | null
}

export const BoardsItems = ({
  boards,
  isPermissionAdmin,
  setSelectedBoard,
  selectedBoard,
}: BoardsProps) => {
  const [isShowBoardsArchived, setIsShowBoardsArchived] = useState(false)

  return (
    <Stack direction="row" sx={{ overflowX: 'auto' }} spacing={1}>
      {isPermissionAdmin && (
        <>
          <MenuPopover
            arrow="top-right"
            sx={{ width: 250 }}
            renderContent={(onClose) => (
              <MenuItem
                onClick={(event) => {
                  setIsShowBoardsArchived((prevState) => !prevState)

                  onClose()
                  event.preventDefault()
                }}
              >
                <FormControlLabel
                  sx={{ ml: 2 }}
                  control={<Checkbox checked={isShowBoardsArchived} sx={{ width: 10 }} />}
                  label={
                    isShowBoardsArchived
                      ? 'Ocultar Quadros Arquivados'
                      : 'Mostrar Quadros Arquivados'
                  }
                />
              </MenuItem>
            )}
          />

          <KanbanBoardAdd />
        </>
      )}

      {boards
        ?.filter((board) => (isShowBoardsArchived ? true : !board.archived))
        .map((board, index) => (
          <BoardActions key={index} {...{ setSelectedBoard, selectedBoard, board }} />
        ))}
    </Stack>
  )
}
