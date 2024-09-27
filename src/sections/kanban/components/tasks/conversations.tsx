import { Stack, Typography } from '@mui/material'

import { Editor } from '@/components/editor'

export const Conversations = ({ children }: { children: string }) => {
  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        p: 2,
        mr: (theme) => theme.spacing(5),
        bgcolor: 'background.neutral',
        borderRadius: 2,
      }}
    >
      <Stack spacing={2} direction="row" justifyContent="space-between" justifyItems="center">
        <Typography variant="subtitle2">Diego Horvatti</Typography>

        <Typography variant="inherit" color="textSecondary" fontSize="0.80rem">
          27/09/2021 11:51
        </Typography>
      </Stack>

      <Editor
        value={children}
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
