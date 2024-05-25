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

import { SettingsProvider } from './components/settings/context'
import SettingsDrawer from './components/settings/drawer'

export const App = () => {
  return (
    <SettingsProvider
      defaultSettings={{
        themeMode: 'dark',
        themeDirection: 'ltr',
        themeContrast: 'default',
        themeLayout: 'vertical',
        themeColorPresets: 'purple',
        themeStretch: false,
      }}
    >
      <ThemeProvider>
        <MotionLazy>
          <SnackbarProvider>
            <MuiLocalizationProvider dateAdapter={AdapterDateFns}>
              <ProgressBar />
              <SettingsDrawer />
              <Stack direction="column" spacing={2}>
                <MenuRouter />
                <KanbanView />
              </Stack>
            </MuiLocalizationProvider>
          </SnackbarProvider>
        </MotionLazy>
      </ThemeProvider>
    </SettingsProvider>
  )
}
