import { alpha } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import ButtonBase from '@mui/material/ButtonBase'

import Iconify from '@/components/iconify'

import { IKanbanTask, priorityValues } from '@/types/kanban'

type Props = {
  priority: string
  onChangePriority: (newValue: IKanbanTask['priority']) => void
}

export default function KanbanDetailsPriority({ priority, onChangePriority }: Props) {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={1}>
      {priorityValues.map((option) => (
        <ButtonBase
          key={option}
          onClick={() => onChangePriority(option)}
          sx={{
            py: 0.5,
            pl: 0.75,
            pr: 1.25,
            fontSize: 12,
            borderRadius: 1,
            lineHeight: '20px',
            textTransform: 'capitalize',
            fontWeight: 'fontWeightBold',
            boxShadow: (theme) => `inset 0 0 0 1px ${alpha(theme.palette.grey[500], 0.24)}`,
            ...(option === priority && {
              boxShadow: (theme) => `inset 0 0 0 2px ${theme.palette.text.primary}`,
            }),
          }}
        >
          <Iconify
            icon="solar:double-alt-arrow-down-bold-duotone"
            sx={{
              mr: 0.5,
              ...(option === 'baixa' && {
                color: 'info.main',
              }),
              ...(option === 'média' && {
                color: 'warning.main',
              }),
              ...(option === 'alta' && {
                color: 'error.main',
              }),
            }}
          />

          {option}
        </ButtonBase>
      ))}
    </Stack>
  )
}
