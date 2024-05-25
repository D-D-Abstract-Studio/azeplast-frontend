'use client'

import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Drawer, { drawerClasses } from '@mui/material/Drawer'

import { paper } from '@/theme/css'

import { Iconify } from '@/components/iconify'
import Scrollbar from '@/components/scrollbar'

import { SettingsContextProps } from './types'

export const SettingsDrawer = ({ settings }: { settings: SettingsContextProps }) => {
  const theme = useTheme()

  return (
    <Drawer
      anchor="right"
      open={settings.open}
      onClose={settings.onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({ theme, bgcolor: theme.palette.background.default }),
          width: 280,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ py: 2, pr: 1, pl: 2.5 }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Settings
        </Typography>

        <IconButton onClick={settings.onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3 }}>
          <h1>kapa</h1>
        </Stack>
      </Scrollbar>
    </Drawer>
  )
}
