import { alpha, Stack, Typography } from '@mui/material'

import { Editor } from '@/components/editor'

import dayjs from 'dayjs'

import { ConversationsType } from '@/types/kanban'
import { StyledArrow } from './styles'

type Props = {
  isUserCurrent: boolean
  conversation: ConversationsType
}

export const Conversations = ({ conversation, isUserCurrent }: Props) => {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        p: 2,
        position: 'relative',
        borderRadius: 2,
        ...(isUserCurrent
          ? {
              ml: (theme) => theme.spacing(5),
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }
          : {
              mr: (theme) => theme.spacing(5),
              bgcolor: 'background.neutral',
              color: 'primary.contrastText',
            }),
      }}
    >
      <StyledArrow
        arrow={isUserCurrent ? 'right-top' : 'left-top'}
        sx={{
          ...(isUserCurrent
            ? { backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }
            : { backgroundColor: 'background.neutral' }),
        }}
      />

      <Stack spacing={2} direction="row" justifyContent="space-between" justifyItems="center">
        <Typography variant="subtitle2" color="text.primary">
          {conversation.userId}
        </Typography>

        <Typography variant="inherit" color="textSecondary" fontSize="0.80rem">
          {dayjs(conversation.date).format('DD/MM/YYYY HH:mm')}
        </Typography>
      </Stack>

      <Editor
        value={conversation.message}
        sx={{
          border: 'none',
          '.ql-editor': {
            padding: 0,
            minHeight: 50,
            backgroundColor: 'transparent',
          },
        }}
        slotProps={{
          Editor: {
            readOnly: true,
            showHeader: false,
          },
        }}
      />
    </Stack>
  )
}
