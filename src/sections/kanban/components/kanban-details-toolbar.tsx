import { useState, useCallback } from 'react'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'

import { useBoolean } from '@/hooks/use-boolean'
import { useResponsive } from '@/hooks/use-responsive'

import Iconify from '@/components/iconify'
import { ConfirmDialog } from '@/components/custom-dialog'
import CustomPopover, { usePopover } from '@/components/custom-popover'

type Props = {
  taskName: string
  taskStatus: string
  onDelete: VoidFunction
  onCloseDetails: VoidFunction
}

export default function KanbanDetailsToolbar({
  taskName,
  onDelete,
  taskStatus,
  onCloseDetails,
}: Props) {
  const smUp = useResponsive('up', 'sm')

  const confirm = useBoolean()

  const popover = usePopover()

  const [status, setStatus] = useState(taskStatus)

  const handleChangeStatus = useCallback(
    (newValue: string) => {
      popover.onClose()
      setStatus(newValue)
    },
    [popover]
  )

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          p: (theme) => theme.spacing(2.5, 1, 2.5, 2.5),
        }}
      >
        {!smUp && (
          <Tooltip title="Back">
            <IconButton onClick={onCloseDetails} sx={{ mr: 1 }}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
          </Tooltip>
        )}

        <Button
          size="small"
          variant="soft"
          endIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} sx={{ ml: -0.5 }} />}
          onClick={popover.onOpen}
        >
          {status}
        </Button>

        <Stack direction="row" justifyContent="flex-end" flexGrow={1}>
          <Tooltip title="Delete">
            <IconButton onClick={confirm.onTrue}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {['To Do', 'In Progress', 'Ready To Test', 'Done'].map((option) => (
          <MenuItem
            key={option}
            selected={status === option}
            onClick={() => {
              handleChangeStatus(option)
            }}
          >
            {option}
          </MenuItem>
        ))}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {taskName} </strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            Delete
          </Button>
        }
      />
    </>
  )
}
