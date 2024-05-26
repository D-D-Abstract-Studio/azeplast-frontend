import 'react-lazy-load-image-component/src/effects/blur.css'

import ThemeProvider from './theme'

import ProgressBar from './components/progress-bar'
import { MotionLazy } from './components/animate/motion-lazy'
import SnackbarProvider from './contexts/snackbar/snackbar-provider'

import { KanbanView } from './sections/kanban/kanban-view'

import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { MenuRouter } from './components/menu-router'
import { Stack } from '@mui/material'

import { SettingsButton } from './components/settings'
import { useRequest } from './hooks/use-request'

import { User } from './types/user'
import { endpoints, userCurrency } from './constants/config'

export const App = () => {
  const { data: users } = useRequest<Array<User>>({
    url: endpoints.user.getAllUsers,
  })
  const getUser = users?.find((getUser) => getUser.name === userCurrency)

  return (
    <ThemeProvider
      settings={{
        themeMode: 'dark',
        themeDirection: 'ltr',
        themeContrast: 'default',
        themeLayout: 'vertical',
        themeColorPresets: 'default',
        themeStretch: false,
      }}
    >
      <MotionLazy>
        <SnackbarProvider>
          <MuiLocalizationProvider dateAdapter={AdapterDateFns}>
            <ProgressBar />
            {getUser?.permissions === 'admin' && <SettingsButton />}

            <Stack direction="column" spacing={2}>
              <MenuRouter />
              <KanbanView />
            </Stack>
          </MuiLocalizationProvider>
        </SnackbarProvider>
      </MotionLazy>
    </ThemeProvider>
  )
}
